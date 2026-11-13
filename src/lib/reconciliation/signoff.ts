import { caseStatus, invoiceBalance, sealLog, verifyLogWithAnchor, ownersFor, type Workspace, type SalesApproval } from './engine';
import { computeMis, deskDate } from './mis';
export type WeeklySignoff = { week: string; signedBy: string; at: string; notes: Record<string, string>; cases: { id: string; count: number; head: string }[]; summary: ReturnType<typeof computeMis>; fingerprint: string; countersignedBy?: string; counterFingerprint?: string };
const digest = async (value: unknown) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))), x => x.toString(16).padStart(2, '0')).join('');
export const openItems = (w: Workspace) => w.invoices.filter(i => invoiceBalance(w, i.id) > 0 && caseStatus(w, i.id) !== 'resolved');
const payload = ({ fingerprint: _f, countersignedBy: _c, counterFingerprint: _cf, ...rest }: WeeklySignoff) => rest;
export async function signWeek(w: Workspace, notes: Record<string, string>, signer: string, at = new Date(), approvals?: SalesApproval[]): Promise<{ workspace: Workspace; signoff: WeeklySignoff }> {
  if (signer !== 'Vikram') throw new Error('Vikram signs the weekly finance review.');
  const missing = openItems(w).filter(i => !notes[i.id]?.trim());
  if (missing.length) throw new Error(`Add a one-line reason for every open item: ${missing.map(i => i.id).join(', ')}.`);
  const exceptions = await Promise.all(w.exceptions.map(async e => ({ ...e, log: await sealLog(e.invoiceId, e.log ?? []) })));
  const workspace = { ...w, exceptions };
  for (const e of exceptions) if (!(await verifyLogWithAnchor(e.invoiceId, e.log)).ok) throw new Error(`${e.invoiceId} history is altered. Restore it before signing.`);
  const monday = new Date(at); monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const data = { week: monday.toISOString().slice(0, 10), signedBy: signer, at: at.toISOString(), notes: Object.fromEntries(openItems(w).map(i => [i.id, notes[i.id]?.trim() ?? ''])), cases: w.invoices.map(i => { const log = exceptions.find(e => e.invoiceId === i.id)?.log ?? []; return { id: i.id, count: log.length, head: log.at(-1)?.hash ?? 'GENESIS' }; }), summary: computeMis(workspace, { sealedEntries: exceptions.reduce((n, e) => n + e.log.length, 0), intact: true }, deskDate(workspace), approvals).filter(r => r.kpi !== 'Open items explained for weekly review') };
  return { workspace, signoff: { ...data, fingerprint: await digest(data) } };
}
export async function countersign(s: WeeklySignoff, person: string): Promise<WeeklySignoff> {
  if (person === s.signedBy) throw new Error('The signer cannot countersign their own review (maker-checker).');
  if (person !== 'Arjun') throw new Error('Arjun provides the separate countersign.');
  if (await digest(payload(s)) !== s.fingerprint) throw new Error('The sign-off was altered.');
  return { ...s, countersignedBy: person, counterFingerprint: await digest([s.fingerprint, person]) };
}
export async function checkSignoff(s: WeeklySignoff, w: Workspace): Promise<string[]> {
  const changes: string[] = [];
  if (await digest(payload(s)) !== s.fingerprint || (s.countersignedBy && await digest([s.fingerprint, s.countersignedBy]) !== s.counterFingerprint)) changes.push('Sign-off record');
  for (const c of s.cases) { const log = w.exceptions.find(e => e.invoiceId === c.id)?.log ?? []; const prefix = log.slice(0, c.count); if (prefix.length !== c.count || !(await verifyLogWithAnchor(c.id, prefix, c.head, c.count)).ok) changes.push(c.id); }
  return changes;
}
export function collectorPrefill(w: Workspace, invoiceId: string, asOf = new Date()) {
  const invoice = w.invoices.find(i => i.id === invoiceId); if (!invoice) return null;
  const current = w.exceptions.find(e => e.invoiceId === invoiceId);
  const past = w.exceptions.filter(e => e.invoiceId !== invoiceId && e.reason !== 'Unexplained' && w.invoices.some(i => i.id === e.invoiceId && i.customer === invoice.customer && i.date < invoice.date));
  const counts = new Map<string, number>(); past.forEach(e => counts.set(e.reason, (counts.get(e.reason) ?? 0) + 1));
  const ranking = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const likely = ranking.length && (ranking.length === 1 || ranking[0]?.[1] !== ranking[1]?.[1]) ? ranking[0]?.[0] : undefined;
  const reason = current?.reason && current.reason !== 'Unexplained' ? current.reason : likely ?? 'Unexplained';
  return { customer: invoice.customer, invoiceId, short: invoiceBalance(w, invoiceId), ageDays: Math.max(0, Math.floor((asOf.getTime() - Date.parse(invoice.date)) / 86400000)), reason, owner: current?.owner || ownersFor(reason)[0]?.name || '', pattern: likely ? `${past.length} past deduction(s): ${likely}` : 'no past pattern' };
}
