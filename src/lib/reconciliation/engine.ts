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
    log: z.array(z.object({ at: z.string().max(40), who: z.string().max(60), text: z.string().max(300), prevHash: z.string().max(64).optional(), hash: z.string().max(64).optional() })).max(200).optional() })).max(1000),
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
/* Finance can close a gap only while finance owns it. Anyone else must act first and hand it back. */
export const HANDBACKS: Record<string, { label: string; reason: string; owner: string }[]> = {
  'Scheme claim · not approved': [{ label: 'Got it approved in Ten Today', reason: 'Scheme claim · approved in Ten Today', owner: 'Asha' }, { label: 'Customer must pay it back', reason: 'Recovery pending', owner: 'Rohan' }],
  'Scheme claim · approval expired': [{ label: 'Approval renewed in Ten Today', reason: 'Scheme claim · approved in Ten Today', owner: 'Asha' }, { label: 'Customer must pay it back', reason: 'Recovery pending', owner: 'Rohan' }],
  'Damage claim': [{ label: 'Damage confirmed: credit note due', reason: 'Pending credit note', owner: 'Asha' }, { label: 'Damage rejected: customer must pay', reason: 'Recovery pending', owner: 'Rohan' }],
  'Recovery pending': [],
};
export const financeOwns = (owner?: string) => !!owner && MAKERS.includes(owner);
const needFinance = (owner?: string) => { if (owner && !financeOwns(owner)) throw new Error(`${personLabel(owner)} owns this. Finance can close it only after ${owner} acts and hands it back.`); };
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
/* The current owner records what they did; the case moves to the next owner. */
export function handBack(w: Workspace, invoiceId: string, choice: number, note: string): Workspace {
  return upsert(w, invoiceId, e => {
    if (statusOf(e) !== 'open') throw new Error('Only open cases can be handed on.');
    const o = (HANDBACKS[e.reason] ?? [])[choice]; if (!o || !e.owner) throw new Error('Nothing to hand back here.');
    if (!note.trim()) throw new Error(`Add what ${e.owner} did first.`);
    return { ...e, reason: o.reason, owner: o.owner, notes: `${e.notes}\n${e.owner}: ${note.trim()}`.trim(), log: [...e.log!, { at: stamp(), who: e.owner, text: `${o.label}. Handed to ${personLabel(o.owner)}. Note: ${note.trim()}` }] };
  });
}
/* Up to ₹10,000: the maker can resolve it alone, with a note. */
export function resolveSmall(w: Workspace, invoiceId: string, actor: string): Workspace {
  if (invoiceBalance(w, invoiceId) > APPROVAL_LIMIT) throw new Error('Above ₹10,000: submit it for a second approval instead.');
  return upsert(w, invoiceId, e => { if (!e.owner) throw new Error('Pick an owner first.'); needFinance(e.owner); if (!e.notes.trim()) throw new Error('Add a note on the evidence first.'); return { ...e, resolved: true, status: 'resolved', log: [...e.log!, { at: stamp(), who: actor, text: 'Resolved (under ₹10,000, no second approval needed)' }] }; });
}
/* BR-5, above ₹10,000: maker submits, a different checker approves. */
export function submitForApproval(w: Workspace, invoiceId: string, actor: string): Workspace {
  if (!MAKERS.includes(actor)) throw new Error('Only the AR executive submits cases for approval.');
  if (invoiceBalance(w, invoiceId) <= APPROVAL_LIMIT) throw new Error('Under ₹10,000 no second approval is needed.');
  return upsert(w, invoiceId, e => { if (!e.owner) throw new Error('Pick an owner first.'); needFinance(e.owner); if (!e.notes.trim()) throw new Error('Add a note on the evidence first.'); if (statusOf(e) !== 'open') throw new Error('Already submitted.'); return { ...e, status: 'pending', submittedBy: actor, log: [...e.log!, { at: stamp(), who: actor, text: 'Submitted for approval (gap above ₹10,000)' }] }; });
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
export type SalesApproval = { id: string; customer: string; rep: string; approver: string; capBeforeGst: number; validTo: string; capPct?: number; source?: 'ten-today' };
/* Handoff contract v1, shared with Ten Today (tentoday.vercel.app). Travels base64url-encoded in the link.
   { v: 1, id: "APV-2026-033", customer, rep, approver, capPct (before GST, 0-30], validTo: "yyyy-mm-dd" } */
const b64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
export function readTenTodayApproval(token: string): SalesApproval {
  let o: Record<string, unknown>;
  try { o = JSON.parse(b64(token)); } catch { throw new Error('The approval link is damaged. Send it again from Ten Today.'); }
  if (o['v'] !== 1) throw new Error('This approval comes from an unsupported version of Ten Today.');
  const str = (k: string, max = 80) => { const x = o[k]; if (typeof x !== 'string' || !x.trim() || x.length > max) throw new Error(`The approval is missing a valid ${k}.`); return x.trim(); };
  const id = str('id', 20); if (!/^APV-\d{4}-\d{3}$/.test(id)) throw new Error('The approval ID is not valid.');
  const rep = str('rep'), approver = str('approver');
  if (rep === approver) throw new Error('Rejected: the same person asked for and approved this discount.');
  const capPct = Number(o['capPct']); if (!(capPct > 0 && capPct <= 30)) throw new Error('The approved discount must be between 0% and 30%.');
  const validTo = str('validTo', 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(validTo)) throw new Error('The approval has no valid expiry date.');
  return { id, customer: str('customer'), rep, approver, capPct, capBeforeGst: 0, validTo, source: 'ten-today' };
}
/* Contract v1 the other way: an unapproved gap handed to the rep as a Ten Today task. */
export function tenTodayTaskLink(invoiceId: string, customer: string, shortPaise: number, rep: string): string {
  const json = JSON.stringify({ v: 1, kind: 'recovery', invoiceId, customer, short: Math.round(shortPaise / 100), rep });
  const t = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `https://tentoday.vercel.app/app.html?task=${t}`;
}
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
  let approval = approvals.find(a => a.customer === inv.customer);
  if (!approval) return { status: 'none', short };
  if (inv.date > approval.validTo) return { status: 'expired', approval, short };
  const cap = approval.capPct ? Math.round((inv.amount / 1.18) * approval.capPct / 100) : approval.capBeforeGst;
  approval = { ...approval, capBeforeGst: cap };
  const limit = Math.round(cap * 1.18);
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

// Tamper-evident case history: a SHA-256 hash chain kept by one company, plus optional external anchor head check.
export type LogEntry = { at: string; who: string; text: string; prevHash?: string | undefined; hash?: string | undefined };
export type ChainNodeCheck = {
  index: number;
  canonical: string;
  expectedPrevHash: string;
  storedPrevHash: string;
  storedHash: string;
  recomputedHash: string;
  prevLinkOk: boolean;
  payloadOk: boolean;
  status: 'intact' | 'tampered' | 'deleted_before' | 'cascade';
};
async function sha256(s: string) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
export const canonicalEntryJson = (invoiceId: string, l: LogEntry, prevHash: string) => JSON.stringify({ invoiceId, at: l.at, who: l.who, text: l.text, prevHash });
const entryHash = (invoiceId: string, l: LogEntry, prevHash: string) => sha256(canonicalEntryJson(invoiceId, l, prevHash));
/** Seals only entries without a hash, so existing (possibly tampered) entries are never silently re-sealed. */
export async function sealLog(invoiceId: string, log: LogEntry[]): Promise<LogEntry[]> {
  const out: LogEntry[] = []; let prev = 'GENESIS';
  for (const l of log) { const e = l.hash ? l : { ...l, prevHash: prev, hash: await entryHash(invoiceId, l, prev) }; out.push(e); prev = e.hash ?? prev; }
  return out;
}
/** Recomputes every hash from scratch (simulates a rogue DBA editing a row AND re-hashing the rest of the chain). */
export async function forceResealLog(invoiceId: string, log: LogEntry[]): Promise<LogEntry[]> {
  return sealLog(invoiceId, log.map(({ at, who, text }) => ({ at, who, text })));
}
export async function inspectLogChain(invoiceId: string, log: LogEntry[]): Promise<ChainNodeCheck[]> {
  const nodes: ChainNodeCheck[] = [];
  let expectedPrev = 'GENESIS';
  let chainBroken = false;
  for (let i = 0; i < log.length; i++) {
    const l = log[i]!;
    const storedPrevHash = l.prevHash ?? '';
    const storedHash = l.hash ?? '';
    const canonical = canonicalEntryJson(invoiceId, l, expectedPrev);
    const recomputedHash = await sha256(canonical);
    const prevLinkOk = storedPrevHash === expectedPrev;
    const payloadOk = storedHash === recomputedHash;
    let status: ChainNodeCheck['status'] = 'intact';
    if (!chainBroken) {
      if (!prevLinkOk) { status = 'deleted_before'; chainBroken = true; }
      else if (!payloadOk) { status = 'tampered'; chainBroken = true; }
    } else {
      status = 'cascade';
    }
    nodes.push({ index: i, canonical, expectedPrevHash: expectedPrev, storedPrevHash, storedHash, recomputedHash, prevLinkOk, payloadOk, status });
    expectedPrev = recomputedHash;
  }
  return nodes;
}
export async function verifyLog(invoiceId: string, log: LogEntry[]): Promise<{ ok: true } | { ok: false; brokenAt: number }> {
  let prev = 'GENESIS';
  for (let i = 0; i < log.length; i++) { const l = log[i]!; if (l.prevHash !== prev || l.hash !== await entryHash(invoiceId, l, prev)) return { ok: false, brokenAt: i }; prev = l.hash!; }
  return { ok: true };
}
export async function verifyLogWithAnchor(invoiceId: string, log: LogEntry[], pinnedAnchorHash?: string, checkpointLength = log.length): Promise<{ ok: true; headHash: string } | { ok: false; brokenAt: number; reason: 'entry_tampered' | 'link_broken' | 'anchor_mismatch'; expectedAnchor?: string; actualAnchor?: string }> {
  let prev = 'GENESIS';
  for (let i = 0; i < log.length; i++) {
    const l = log[i];
    if (!l) return { ok: false, brokenAt: i, reason: 'link_broken' };
    if (l.prevHash !== prev) return { ok: false, brokenAt: i, reason: 'link_broken' };
    if (l.hash !== await entryHash(invoiceId, l, prev)) return { ok: false, brokenAt: i, reason: 'entry_tampered' };
    prev = l.hash ?? prev;
  }
  const checkpoint = log[checkpointLength - 1]?.hash ?? 'GENESIS';
  if (pinnedAnchorHash && checkpoint !== pinnedAnchorHash) {
    return { ok: false, brokenAt: Math.max(0, Math.min(checkpointLength, log.length) - 1), reason: 'anchor_mismatch', expectedAnchor: pinnedAnchorHash, actualAnchor: checkpoint };
  }
  return { ok: true, headHash: prev };
}

/** An approval is evidence only when its chain and optional independent checkpoint verify. */
export async function sealedDecisionLookup(invoiceId: string, log: LogEntry[], anchorHash?: string, checkpointLength = log.length): Promise<LogEntry | undefined> {
  const result = await verifyLogWithAnchor(invoiceId, log, anchorHash, checkpointLength);
  if (!result.ok) return undefined;
  return [...log].reverse().find(entry => /\bapproved\b/i.test(entry.text) && !/\b(unapproved|not approved)\b/i.test(entry.text));
}

/* Ten Today sends a fingerprint of the approval fields. Recompute it here: a mismatch means the link was edited on the way. */
export async function checkTenTodaySeal(token: string): Promise<'match' | 'mismatch' | 'none'> {
  try {
    const o = JSON.parse(b64(token)) as Record<string, unknown>;
    if (typeof o['seal'] !== 'string') return 'none';
    const mine = await sha256(JSON.stringify([o['v'], o['id'], o['customer'], o['rep'], o['approver'], o['capPct'], o['validTo']]));
    return mine === o['seal'] ? 'match' : 'mismatch';
  } catch { return 'none'; }
}

/* Public-benchmark batch (25 invoices · ₹48.60L gross billing across 10 distributors) calibrated to:
   - Cello World FY24–FY25 Annual Report AR disclosures (12–14 debtor days, general/modern trade mix)
   - APQC & The Hackett Group CPG O2C benchmarks (22 min manual 4-way lookup/line, 30–45d median dispute aging vs <=7d top quartile) */
export const benchmarkApprovals = (): SalesApproval[] => [
  ...salesApprovals(),
  { id: 'APV-2026-032', customer: 'Vikas Houseware Hub', rep: 'Rahul', approver: 'Kavita', capBeforeGst: 150000, validTo: '2026-10-31' },
  { id: 'APV-2026-035', customer: 'Shree Ganesh Agencies', rep: 'Rahul', approver: 'Kavita', capBeforeGst: 80000, validTo: '2026-10-05' }, // expired for Oct 14 bill
  { id: 'APV-2026-038', customer: 'Navkar Super Stockist', rep: 'Rahul', approver: 'Kavita', capBeforeGst: 250000, validTo: '2026-10-31' },
  { id: 'APV-2026-041', customer: 'Kaveri Home Mart', rep: 'Rahul', approver: 'Kavita', capBeforeGst: 120000, validTo: '2026-10-31' },
];

export function benchmarkWorkspace(): Workspace {
  const base = sampleWorkspace();
  const extraInvoices: Workspace['invoices'] = [
    { id: 'INV-105', customer: 'Vikas Houseware Hub', amount: 2360000, date: '2026-10-03' },
    { id: 'INV-106', customer: 'Shree Ganesh Agencies', amount: 1850000, date: '2026-10-14' },
    { id: 'INV-107', customer: 'Navkar Super Stockist', amount: 4720000, date: '2026-10-05' },
    { id: 'INV-108', customer: 'Kaveri Home Mart', amount: 2950000, date: '2026-10-06' },
    { id: 'INV-109', customer: 'Rathi Thermoware', amount: 1420000, date: '2026-10-07' },
    { id: 'INV-110', customer: 'Deccan Retail Corp', amount: 3540000, date: '2026-10-08' },
    { id: 'INV-111', customer: 'Patel Trade Links', amount: 1680000, date: '2026-10-09' },
    { id: 'INV-112', customer: 'Malabar Distributors', amount: 2120000, date: '2026-10-10' },
    { id: 'INV-113', customer: 'Aarav Distributors', amount: 1940000, date: '2026-10-11' },
    { id: 'INV-114', customer: 'Meera Trading', amount: 2480000, date: '2026-10-12' },
    { id: 'INV-115', customer: 'Vikas Houseware Hub', amount: 1770000, date: '2026-10-13' },
    { id: 'INV-116', customer: 'Navkar Super Stockist', amount: 3100000, date: '2026-10-14' },
    { id: 'INV-117', customer: 'Kaveri Home Mart', amount: 1560000, date: '2026-10-15' },
    { id: 'INV-118', customer: 'Rathi Thermoware', amount: 2240000, date: '2026-10-16' },
    { id: 'INV-119', customer: 'Deccan Retail Corp', amount: 1890000, date: '2026-10-17' },
    { id: 'INV-120', customer: 'Patel Trade Links', amount: 2650000, date: '2026-10-18' },
    { id: 'INV-121', customer: 'Malabar Distributors', amount: 1380000, date: '2026-10-19' },
    { id: 'INV-122', customer: 'Southern Stores', amount: 2740000, date: '2026-10-20' },
    { id: 'INV-123', customer: 'Eastern Wholesale', amount: 1980000, date: '2026-10-21' },
    { id: 'INV-124', customer: 'Shree Ganesh Agencies', amount: 1640000, date: '2026-10-22' },
    { id: 'INV-125', customer: 'Rathi Thermoware', amount: 2460000, date: '2026-10-23' },
  ];
  const extraReceipts: Workspace['receipts'] = [
    { id: 'UTR-005', reference: 'INV-105', amount: 2183000, date: '2026-10-16' }, // ₹1,770 short (covered by APV-2026-032: 1,500 + 18% GST = 1,770)
    { id: 'UTR-006', reference: 'INV-106', amount: 1730000, date: '2026-10-17' }, // ₹1,200 short (expired APV-2026-035 -> Kavita)
    { id: 'UTR-007', reference: 'INV-107', amount: 4248000, date: '2026-10-17' }, // ₹4,720 short (excess over APV-2026-038 ₹2,950 cap -> ₹1,770 excess to Rahul)
    { id: 'UTR-008', reference: 'INV-108', amount: 2808400, date: '2026-10-18' }, // ₹1,416 short (covered by APV-2026-041: 1,200 + 18% GST = 1,416)
    { id: 'UTR-009', reference: 'INV-109', amount: 1418580, date: '2026-10-18' }, // ₹14.20 TDS 194Q
    { id: 'UTR-010', reference: 'INV-110', amount: 3310000, date: '2026-10-19' }, // ₹2,300 transit damage claim -> Priya
    { id: 'UTR-011', reference: 'INV-111', amount: 1680000, date: '2026-10-19' }, // Paid in full
    { id: 'UTR-012', reference: 'INV-112', amount: 2120000, date: '2026-10-20' }, // Paid in full
    { id: 'UTR-013', reference: 'INV-113', amount: 1940000, date: '2026-10-20' }, // Paid in full
    { id: 'UTR-014', reference: 'INV-114', amount: 2480000, date: '2026-10-21' }, // Paid in full
    { id: 'UTR-015', reference: 'INV-115', amount: 1770000, date: '2026-10-21' }, // Paid in full
    { id: 'UTR-016', reference: 'INV-116', amount: 3100000, date: '2026-10-22' }, // Paid in full
    { id: 'UTR-017', reference: 'INV-117', amount: 1560000, date: '2026-10-22' }, // Paid in full
    { id: 'UTR-018', reference: 'INV-118', amount: 2240000, date: '2026-10-23' }, // Paid in full
    { id: 'UTR-019', reference: 'INV-119', amount: 1890000, date: '2026-10-23' }, // Paid in full
    { id: 'UTR-020', reference: 'INV-120', amount: 2650000, date: '2026-10-24' }, // Paid in full
    { id: 'UTR-021', reference: 'INV-121', amount: 1380000, date: '2026-10-24' }, // Paid in full
    { id: 'UTR-022', reference: 'INV-122', amount: 2740000, date: '2026-10-25' }, // Paid in full
    { id: 'UTR-023', reference: 'INV-123', amount: 1980000, date: '2026-10-25' }, // Paid in full
    { id: 'UTR-024', reference: 'INV-124', amount: 1640000, date: '2026-10-26' }, // Paid in full
    { id: 'UTR-025', reference: 'INV-125', amount: 2460000, date: '2026-10-26' }, // Paid in full
  ];
  const extraExceptions: Workspace['exceptions'] = [
    { invoiceId: 'INV-105', reason: 'Scheme claim · approved in Ten Today', owner: 'Asha', notes: 'Matched to APV-2026-032 (₹1,500 + 18% GST).', resolved: false, status: 'open', log: [] },
    { invoiceId: 'INV-106', reason: 'Scheme claim · approval expired', owner: 'Kavita', notes: 'APV-2026-035 expired on 2026-10-05 before invoice date.', resolved: false, status: 'open', log: [] },
    { invoiceId: 'INV-107', reason: 'Scheme claim · not approved', owner: 'Rahul', notes: 'Claimed ₹4,720 vs ₹2,950 GST-inclusive cap on APV-2026-038; ₹1,770 excess routed to rep.', resolved: false, status: 'open', log: [] },
    { invoiceId: 'INV-108', reason: 'Scheme claim · approved in Ten Today', owner: 'Asha', notes: 'Matched to APV-2026-041 (₹1,200 + 18% GST).', resolved: false, status: 'open', log: [] },
    { invoiceId: 'INV-109', reason: 'TDS deduction', owner: 'Asha', notes: '0.1% TDS u/s 194Q verified against PAN ledger.', resolved: false, status: 'open', log: [] },
    { invoiceId: 'INV-110', reason: 'Damage claim', owner: 'Priya', notes: 'Carton damage reported on LR-8841; awaiting warehouse POD check.', resolved: false, status: 'open', log: [] },
  ];
  return validateWorkspace({
    invoices: [...base.invoices, ...extraInvoices],
    receipts: [...base.receipts, ...extraReceipts],
    allocations: [],
    exceptions: [...base.exceptions, ...extraExceptions],
  });
}

export type DeskImpact = {
  totalBills: number;
  fullPaidBills: number;
  shortBills: number;
  autoTriagedBills: number;
  manualMinutesSaved: number;
  blockedLeakagePaise: number;
  dualControlPaise: number;
};

export function computeDeskImpact(w: Workspace, approvals: SalesApproval[] = salesApprovals()): DeskImpact {
  const totalBills = w.invoices.length;
  let fullPaidBills = 0;
  let shortBills = 0;
  let autoTriagedBills = 0;
  let blockedLeakagePaise = 0;
  let dualControlPaise = 0;
  for (const inv of w.invoices) {
    const bal = invoiceBalance(w, inv.id);
    const hasAlloc = w.allocations.some(a => a.invoiceId === inv.id);
    if (bal === 0 && hasAlloc) {
      fullPaidBills++;
      autoTriagedBills++;
    } else if (bal > 0) {
      shortBills++;
      if (bal > APPROVAL_LIMIT) dualControlPaise += bal;
      const chk = approvalCheck(w, inv.id, approvals);
      if (chk.status === 'covered') {
        autoTriagedBills++;
      } else if (chk.status === 'excess') {
        autoTriagedBills++;
        blockedLeakagePaise += chk.excess;
      } else if (chk.status === 'expired' || chk.status === 'none') {
        blockedLeakagePaise += chk.short;
      }
    }
  }
  // APQC / HighRadius CPG benchmark: ~22 minutes manual 4-way lookup (UTR + ERP Invoice + Trade Circular + Credit Note ledger) per line
  // vs ~2 minutes review on pre-matched / rule-checked lines (20 minutes saved per auto-triaged bill).
  const manualMinutesSaved = autoTriagedBills * 20;
  return { totalBills, fullPaidBills, shortBills, autoTriagedBills, manualMinutesSaved, blockedLeakagePaise, dualControlPaise };
}
