import Papa from 'papaparse';
import { z } from 'zod';

const amount = z.number().int().positive().max(1_000_000_000_000);
const id = z.string().trim().min(1).max(100);
export const invoiceSchema = z.object({ id, customer: z.string().trim().min(1).max(150), amount, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export const receiptSchema = z.object({ id, reference: z.string().trim().max(100), amount, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export const workspaceSchema = z.object({
  invoices: z.array(invoiceSchema).max(1000), receipts: z.array(receiptSchema).max(1000),
  allocations: z.array(z.object({ id, invoiceId: id, receiptId: id, amount })).max(5000),
  exceptions: z.array(z.object({ invoiceId: id, reason: z.string().max(150), owner: z.string().max(150), notes: z.string().max(2000), resolved: z.boolean(),
    status: z.enum(['open', 'pending', 'resolved']).optional(), submittedBy: z.string().max(60).optional(), approvedBy: z.string().max(60).optional(),
    log: z.array(z.object({ at: z.string().max(40), who: z.string().max(60), text: z.string().max(300) })).max(200).optional() })).max(1000),
}).strict();
export type Workspace = z.infer<typeof workspaceSchema>;
export const emptyWorkspace = (): Workspace => ({ invoices: [], receipts: [], allocations: [], exceptions: [] });
/* Who handles what. Like a bank MIS: every reason has a named owner team, and a case can only be owned by someone who handles that reason. */
export const APPROVAL_LIMIT = 1_000_000; // ₹10,000 in paise
export type Person = { name: string; role: string; handles: string[]; checker?: boolean };
export const REASONS = ['Unexplained', 'TDS deduction', 'Scheme claim · approved in Ten Today', 'Scheme claim · not approved', 'Scheme claim · approval expired', 'Damage claim', 'Pending credit note', 'Recovery pending', 'Other'] as const;
export const PEOPLE: Person[] = [
  { name: 'Asha', role: 'AR executive', handles: ['Unexplained', 'TDS deduction', 'Scheme claim · approved in Ten Today', 'Pending credit note', 'Other'] },
  { name: 'Rahul', role: 'Sales rep', handles: ['Scheme claim · not approved'] },
  { name: 'Kavita', role: 'Sales manager', handles: ['Scheme claim · approval expired'] },
  { name: 'Priya', role: 'Warehouse & logistics', handles: ['Damage claim'] },
  { name: 'Rohan', role: 'Collections', handles: ['Recovery pending'] },
  { name: 'Vikram', role: 'Finance controller', handles: [], checker: true },
];
export const MAKERS = ['Asha'];
export const personLabel = (name: string) => { const p = PEOPLE.find(x => x.name === name); return p ? `${p.name} · ${p.role}` : name; };
export const ownersFor = (reason: string) => PEOPLE.filter(p => p.handles.includes(reason));
type Exc = Workspace['exceptions'][number];
const stamp = () => new Date().toISOString();
function upsert(w: Workspace, invoiceId: string, fn: (e: Exc) => Exc): Workspace {
  if (!w.invoices.some(i => i.id === invoiceId)) throw new Error('Unknown invoice.');
  const cur: Exc = w.exceptions.find(e => e.invoiceId === invoiceId) ?? { invoiceId, reason: 'Unexplained', owner: '', notes: '', resolved: false, status: 'open', log: [] };
  return validateWorkspace({ ...w, exceptions: [...w.exceptions.filter(e => e.invoiceId !== invoiceId), fn({ ...cur, log: cur.log ?? [] })] });
}
const statusOf = (e: Exc) => e.status ?? (e.resolved ? 'resolved' : 'open');
export function caseStatus(w: Workspace, invoiceId: string) { const e = w.exceptions.find(x => x.invoiceId === invoiceId); return e ? statusOf(e) : 'open'; }
/* Save reason, owner and notes. The owner must handle that reason: no mismatches. */
export function saveCase(w: Workspace, invoiceId: string, f: { reason: string; owner: string; notes: string }, actor: string): Workspace {
  if (f.owner && !ownersFor(f.reason).some(p => p.name === f.owner)) throw new Error(`${personLabel(f.owner)} doesn't handle "${f.reason}". Pick ${ownersFor(f.reason).map(p => p.name).join(' or ') || 'another reason'}.`);
  return upsert(w, invoiceId, e => { if (statusOf(e) === 'resolved') throw new Error('This case is already resolved.'); return { ...e, ...f, log: [...e.log!, { at: stamp(), who: actor, text: `Set reason "${f.reason}", owner ${f.owner ? personLabel(f.owner) : 'none'}` }] }; });
}
/* Up to ₹10,000: the maker can resolve it alone, with a note. */
export function resolveSmall(w: Workspace, invoiceId: string, actor: string): Workspace {
  if (invoiceBalance(w, invoiceId) > APPROVAL_LIMIT) throw new Error('Above ₹10,000: submit it for a second approval instead.');
  return upsert(w, invoiceId, e => { if (!e.owner) throw new Error('Pick an owner first.'); if (!e.notes.trim()) throw new Error('Add a note on the evidence first.'); return { ...e, resolved: true, status: 'resolved', log: [...e.log!, { at: stamp(), who: actor, text: 'Resolved (under ₹10,000, no second approval needed)' }] }; });
}
/* BR-5, above ₹10,000: maker submits, a different checker approves. */
export function submitForApproval(w: Workspace, invoiceId: string, actor: string): Workspace {
  if (!MAKERS.includes(actor)) throw new Error('Only the AR executive submits cases for approval.');
  if (invoiceBalance(w, invoiceId) <= APPROVAL_LIMIT) throw new Error('Under ₹10,000 no second approval is needed.');
  return upsert(w, invoiceId, e => { if (!e.owner) throw new Error('Pick an owner first.'); if (!e.notes.trim()) throw new Error('Add a note on the evidence first.'); if (statusOf(e) !== 'open') throw new Error('Already submitted.'); return { ...e, status: 'pending', submittedBy: actor, log: [...e.log!, { at: stamp(), who: actor, text: 'Submitted for approval (gap above ₹10,000)' }] }; });
}
export function approveCase(w: Workspace, invoiceId: string, actor: string): Workspace {
  return upsert(w, invoiceId, e => {
    if (statusOf(e) !== 'pending') throw new Error('Nothing is waiting for approval.');
    if (actor === e.submittedBy) throw new Error(`${actor} submitted this, so ${actor} can't approve it. A different person must.`);
    if (!PEOPLE.find(p => p.name === actor)?.checker) throw new Error('Only the finance controller can approve.');
    return { ...e, status: 'resolved', resolved: true, approvedBy: actor, log: [...e.log!, { at: stamp(), who: actor, text: 'Approved and resolved' }] };
  });
}
export function sendBack(w: Workspace, invoiceId: string, actor: string, why: string): Workspace {
  return upsert(w, invoiceId, e => {
    if (statusOf(e) !== 'pending') throw new Error('Nothing is waiting for approval.');
    if (!PEOPLE.find(p => p.name === actor)?.checker) throw new Error('Only the finance controller can send it back.');
    return { ...e, status: 'open', submittedBy: undefined, log: [...e.log!, { at: stamp(), who: actor, text: `Sent back: ${why || 'needs more evidence'}` }] };
  });
}
export const invoiceBalance = (w: Workspace, invoiceId: string) => (w.invoices.find(i => i.id === invoiceId)?.amount ?? 0) - w.allocations.filter(a => a.invoiceId === invoiceId).reduce((s, a) => s + a.amount, 0);
export const receiptBalance = (w: Workspace, receiptId: string) => (w.receipts.find(r => r.id === receiptId)?.amount ?? 0) - w.allocations.filter(a => a.receiptId === receiptId).reduce((s, a) => s + a.amount, 0);
export function validateWorkspace(input: unknown): Workspace {
  const w = workspaceSchema.parse(input);
  for (const items of [w.invoices, w.receipts, w.allocations]) if (new Set(items.map(i => i.id)).size !== items.length) throw new Error('Duplicate identifiers are not allowed.');
  if (new Set(w.exceptions.map(e => e.invoiceId)).size !== w.exceptions.length) throw new Error('Duplicate exception.');
  for (const a of w.allocations) if (!w.invoices.some(i => i.id === a.invoiceId) || !w.receipts.some(r => r.id === a.receiptId)) throw new Error('Allocation references a missing record.');
  for (const i of w.invoices) if (invoiceBalance(w, i.id) < 0) throw new Error('Allocation exceeds invoice balance.');
  for (const r of w.receipts) if (receiptBalance(w, r.id) < 0) throw new Error('Allocation exceeds receipt balance.');
  for (const e of w.exceptions) {
    if (!w.invoices.some(i => i.id === e.invoiceId)) throw new Error('Exception references a missing invoice.');
    if (e.resolved && invoiceBalance(w, e.invoiceId) > APPROVAL_LIMIT && !(e.approvedBy && e.approvedBy !== e.submittedBy)) throw new Error('BR-5: a gap above ₹10,000 needs a second person to approve it. Submit it for approval first.');
  }
  return w;
}
export function allocate(w: Workspace, receiptId: string, invoiceId: string, cents: number): Workspace {
  if (!w.receipts.some(r => r.id === receiptId) || !w.invoices.some(i => i.id === invoiceId)) throw new Error('Select a receipt and invoice.');
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error('Enter a positive amount with at most two decimal places.');
  if (cents > receiptBalance(w, receiptId) || cents > invoiceBalance(w, invoiceId)) throw new Error('Amount exceeds the available receipt or invoice balance.');
  return validateWorkspace({ ...w, allocations: [...w.allocations, { id: crypto.randomUUID(), receiptId, invoiceId, amount: cents }] });
}
export function autoMatch(w: Workspace): Workspace {
  let next = w;
  for (const r of w.receipts) {
    const matches = w.invoices.filter(i => i.id.toLowerCase() === r.reference.trim().toLowerCase());
    const invoice = matches.length === 1 ? matches[0] : undefined;
    if (!invoice) continue;
    const cents = Math.min(receiptBalance(next, r.id), invoiceBalance(next, invoice.id));
    if (cents > 0) next = allocate(next, r.id, invoice.id, cents);
  }
  return next;
}
export function parseMoney(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) throw new Error('Amount must be a positive number with at most two decimals.');
  const cents = Math.round(Number(value) * 100);
  if (cents <= 0 || !Number.isSafeInteger(cents) || cents > 1_000_000_000_000) throw new Error('Amount is outside the supported range.');
  return cents;
}
export function importCsv(w: Workspace, kind: 'invoices' | 'receipts', csv: string): Workspace {
  const result = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.trim().toLowerCase() });
  if (result.errors.length) throw new Error('CSV could not be read: ' + result.errors[0]?.message);
  const required = kind === 'invoices' ? ['id', 'customer', 'amount', 'date'] : ['id', 'reference', 'amount', 'date'];
  if (!required.every(h => result.meta.fields?.includes(h))) throw new Error('Required columns: ' + required.join(', '));
  if (!result.data.length) throw new Error('The CSV contains no records.');
  const rows = result.data.map((r, index) => {
    try {
      const date = r['date']?.trim() ?? '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Use a valid YYYY-MM-DD date.');
      const base = { id: r['id']?.trim(), date, amount: parseMoney(r['amount'] ?? '') };
      return kind === 'invoices' ? invoiceSchema.parse({ ...base, customer: r['customer'] }) : receiptSchema.parse({ ...base, reference: r['reference'] ?? '' });
    } catch (error) { throw new Error(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Invalid record'}`); }
  });
  return validateWorkspace({ ...w, [kind]: [...w[kind], ...rows] });
}
export const money = (cents: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(cents / 100);
/* BR-10: the link to Ten Today. A scheme deduction is checked against the discount approval saved in Ten Today, the sales app.
   The cap is approved before GST, so it covers cap + 18% GST. Within the cap: clears by rule. Above it: only the excess goes back to the rep.
   Invoice after the approval window: goes to the approver who signed it. No approval: goes back to the sales rep, not finance. */
export type SalesApproval = { id: string; customer: string; rep: string; approver: string; capBeforeGst: number; validTo: string };
export const salesApprovals = (): SalesApproval[] => [
  { id: 'APV-2026-031', customer: 'Aarav Distributors', rep: 'Rahul', approver: 'Kavita', capBeforeGst: 100000, validTo: '2026-10-31' },
];
export type ApprovalCheck =
  | { status: 'unpaid' } | { status: 'none'; short: number }
  | { status: 'expired'; approval: SalesApproval; short: number }
  | { status: 'covered'; approval: SalesApproval; short: number; limit: number }
  | { status: 'excess'; approval: SalesApproval; short: number; limit: number; excess: number };
export function approvalCheck(w: Workspace, invoiceId: string, approvals: SalesApproval[] = salesApprovals()): ApprovalCheck {
  const inv = w.invoices.find(i => i.id === invoiceId);
  if (!inv || !w.allocations.some(a => a.invoiceId === invoiceId)) return { status: 'unpaid' };
  const short = invoiceBalance(w, invoiceId);
  const approval = approvals.find(a => a.customer === inv.customer);
  if (!approval) return { status: 'none', short };
  if (inv.date > approval.validTo) return { status: 'expired', approval, short };
  const limit = Math.round(approval.capBeforeGst * 1.18);
  return short <= limit ? { status: 'covered', approval, short, limit } : { status: 'excess', approval, short, limit, excess: short - limit };
}
export function sampleWorkspace(): Workspace {
  return { invoices: [
    { id: 'INV-101', customer: 'Aarav Distributors', amount: 1180000, date: '2026-10-01' },
    { id: 'INV-102', customer: 'Meera Trading', amount: 6200000, date: '2026-10-04' },
    { id: 'INV-103', customer: 'Southern Stores', amount: 3150000, date: '2026-10-08' },
    { id: 'INV-104', customer: 'Eastern Wholesale', amount: 8600000, date: '2026-10-12' },
  ], receipts: [
    { id: 'UTR-001', reference: 'INV-101', amount: 1062000, date: '2026-10-15' },
    { id: 'UTR-002', reference: 'INV-102', amount: 4960000, date: '2026-10-16' },
    { id: 'UTR-003', reference: '', amount: 2835000, date: '2026-10-18' },
    { id: 'UTR-004', reference: 'INV-104', amount: 8514000, date: '2026-10-19' },
  ], allocations: [], exceptions: [
    { invoiceId: 'INV-101', reason: 'Scheme claim · approved in Ten Today', owner: 'Asha', notes: 'Festival discount claimed; check the Ten Today approval.', resolved: false, status: 'open', log: [] },
    { invoiceId: 'INV-102', reason: 'Scheme claim · not approved', owner: '', notes: 'Verbal sales promise; no approved budget attached.', resolved: false, status: 'open', log: [] },
  ] };
}
