import { gstAtRisk, type CreditNote } from './gst';
import { APPROVAL_LIMIT, approvalCheck, invoiceBalance, money, salesApprovals, type SalesApproval, type Workspace } from './engine';

export type MisStatus = 'PASS' | 'FAIL' | 'TRACKED' | 'NO DATA YET';
export type MisRow = { kpi: string; value: string; target: string; status: MisStatus; proves: string };
export type MisHistory = { sealedEntries: number; intact: boolean };
const DAY = 86_400_000;
const SLA_DAYS = 3; // BR-8 review deadline
const pct = (x: number, y: number) => `${x} of ${y} (${Math.round((x / y) * 100)}%)`;
const zeroRule = (n: number, hasData: boolean): MisStatus => !hasData ? 'NO DATA YET' : n === 0 ? 'PASS' : 'FAIL';
/** CGST s.34(2): credit note must be declared by 30 Nov after the end of the invoice's financial year. */
export const gstCreditNoteDeadline = (invoiceDate: string) => { const d = new Date(invoiceDate + 'T00:00:00Z'); const fyEnd = d.getUTCMonth() >= 3 ? d.getUTCFullYear() + 1 : d.getUTCFullYear(); return Date.UTC(fyEnd, 10, 30); };

/** The desk's "today": the latest payment or bill date in the data, so sample data never ages against the real clock. */
export const deskDate = (w: Workspace): Date => { const ds = [...w.receipts.map(r => r.date), ...w.invoices.map(i => i.date)].filter(Boolean) as string[]; return ds.length ? new Date(ds.sort().at(-1)! + 'T00:00:00Z') : new Date(); };
export function computeMis(w: Workspace, history: MisHistory, asOf: Date = new Date(), approvals: SalesApproval[] = salesApprovals(), notes?: CreditNote[]): MisRow[] {
  const now = asOf.getTime();
  const short = w.invoices.filter(i => w.allocations.some(a => a.invoiceId === i.id) && invoiceBalance(w, i.id) > 0);
  const exc = (id: string) => w.exceptions.find(e => e.invoiceId === id);
  const owned = short.filter(i => !!exc(i.id)?.owner).length;
  const triaged = short.filter(i => { const s = approvalCheck(w, i.id, approvals).status; return s === 'covered' || s === 'excess'; }).length;
  const open = short.filter(i => (exc(i.id)?.status ?? (exc(i.id)?.resolved ? 'resolved' : 'open')) !== 'resolved');
  const age = (d: string) => (now - Date.parse(d + 'T00:00:00Z')) / DAY;
  // A short-pay is discovered when the payment lands, so the SLA clock starts at the latest payment date.
  const paidOn = (id: string) => w.allocations.filter(a => a.invoiceId === id).map(a => w.receipts.find(r => r.id === a.receiptId)?.date).filter(Boolean).sort().at(-1) ?? w.invoices.find(i => i.id === id)!.date;
  const pastSla = open.filter(i => age(paidOn(i.id)) > SLA_DAYS).length;
  const old = open.filter(i => age(i.date) >= 30);
  const oldPaise = old.reduce((s, i) => s + invoiceBalance(w, i.id), 0);
  const resolvedHigh = short.filter(i => exc(i.id)?.resolved && invoiceBalance(w, i.id) > APPROVAL_LIMIT);
  const noChecker = w.exceptions.filter(e => e.resolved && invoiceBalance(w, e.invoiceId) > APPROVAL_LIMIT && (!e.approvedBy || e.approvedBy === e.submittedBy)).length;
  const selfApproved = resolvedHigh.filter(i => { const e = exc(i.id)!; return !!e.approvedBy && e.approvedBy === e.submittedBy; }).length;
  const cn = w.exceptions.filter(e => e.reason === 'Pending credit note' && !e.resolved);
  const cnDue = cn.filter(e => { const inv = w.invoices.find(i => i.id === e.invoiceId); return inv && (gstCreditNoteDeadline(inv.date) - now) / DAY <= 30; }).length;
  const has = short.length > 0;
  return [
    { kpi: 'Short-paid bills with an owner on Day 0', value: has ? pct(owned, short.length) : '—', target: '100%', status: !has ? 'NO DATA YET' : owned === short.length ? 'PASS' : 'FAIL', proves: 'Every missing rupee gets an owner' },
    { kpi: 'Short-pays auto-triaged by rule', value: has ? pct(triaged, short.length) : '—', target: 'Tracked', status: has ? 'TRACKED' : 'NO DATA YET', proves: 'How much work the rules remove' },
    { kpi: 'Open cases past their SLA', value: has ? String(pastSla) : '—', target: '0', status: zeroRule(pastSla, has), proves: 'Nothing ages silently' },
    { kpi: 'Short-pays open 30+ days', value: has ? `${old.length} · ${money(oldPaise)}` : '—', target: '0', status: zeroRule(old.length, has), proves: 'Ageing is caught before provisions' },
    { kpi: 'Write-offs without maker-checker approval', value: has ? String(noChecker) : '—', target: '0', status: zeroRule(noChecker, has), proves: 'No silent write-offs' },
    { kpi: 'Approvals above ₹10,000 where maker = checker', value: resolvedHigh.length ? String(selfApproved) : '—', target: '0', status: zeroRule(selfApproved, resolvedHigh.length > 0), proves: 'Self-approval is blocked' },
    notes ? (() => { const r = gstAtRisk(notes, asOf.toISOString().slice(0, 10)); const any = notes.some(n => n.kind === 'gst'); return { kpi: 'GST relief at risk before the s.34(2) date (30 Nov)', value: !any ? '—' : r.count ? `${money(r.paise)} · ${r.count} note${r.count === 1 ? '' : 's'}${r.rejected ? `, ${r.rejected} rejected` : ''}` : '₹0', target: '₹0', status: (!any ? 'NO DATA YET' : r.count === 0 ? 'PASS' : r.rejected || r.overdue ? 'FAIL' : 'TRACKED') as MisStatus, proves: 'The GST cut you claim actually holds' }; })()
      : { kpi: 'GST credit notes due within 30 days of the CGST s.34(2) deadline', value: cn.length ? String(cnDue) : '—', target: 'Tracked', status: cn.length ? 'TRACKED' : 'NO DATA YET', proves: 'Tax deadlines are visible' },
    { kpi: 'Case history intact (hash chain + daily anchor)', value: !history.sealedEntries ? '—' : history.intact ? `✓ ${history.sealedEntries} sealed entries` : '✗ altered', target: 'Intact', status: !history.sealedEntries ? 'NO DATA YET' : history.intact ? 'PASS' : 'FAIL', proves: 'Any rewrite gets caught' },
  ];
}

const cell = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
export const misCsv = (rows: MisRow[]) => ['kpi,value,target,status,proves', ...rows.map(r => [r.kpi, r.value, r.target, r.status, r.proves].map(cell).join(','))].join('\n');
export const misFilename = (d: Date = new Date()) => `every-rupee-mis-${d.toISOString().slice(0, 10)}.csv`;
