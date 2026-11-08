import Papa from 'papaparse';
import { z } from 'zod';

const amount = z.number().int().positive().max(1_000_000_000_000);
const id = z.string().trim().min(1).max(100);
export const invoiceSchema = z.object({ id, customer: z.string().trim().min(1).max(150), amount, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export const receiptSchema = z.object({ id, reference: z.string().trim().max(100), amount, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export const workspaceSchema = z.object({
  invoices: z.array(invoiceSchema).max(1000), receipts: z.array(receiptSchema).max(1000),
  allocations: z.array(z.object({ id, invoiceId: id, receiptId: id, amount })).max(5000),
  exceptions: z.array(z.object({ invoiceId: id, reason: z.string().max(150), owner: z.string().max(150), notes: z.string().max(2000), resolved: z.boolean() })).max(1000),
}).strict();
export type Workspace = z.infer<typeof workspaceSchema>;
export const emptyWorkspace = (): Workspace => ({ invoices: [], receipts: [], allocations: [], exceptions: [] });
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
    if (e.resolved && invoiceBalance(w, e.invoiceId) > 1_000_000) throw new Error('BR-5: resolutions above ₹10,000 require a different checker. Self-approval is blocked; this single-account workspace cannot record that approval.');
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
/** Small round numbers for first-time visitors on /demo. */
export function starterWorkspace(): Workspace {
  return { invoices: [
    { id: 'INV-101', customer: 'Aarav Distributors', amount: 1000000, date: '2026-10-01' },
    { id: 'INV-102', customer: 'Meera Trading', amount: 500000, date: '2026-10-04' },
    { id: 'INV-103', customer: 'Southern Stores', amount: 300000, date: '2026-10-08' },
    { id: 'INV-104', customer: 'Eastern Wholesale', amount: 200000, date: '2026-10-12' },
  ], receipts: [
    { id: 'UTR-001', reference: 'INV-101', amount: 900000, date: '2026-10-15' },
    { id: 'UTR-002', reference: 'INV-102', amount: 500000, date: '2026-10-16' },
    { id: 'UTR-003', reference: '', amount: 300000, date: '2026-10-18' },
    { id: 'UTR-004', reference: 'INV-104', amount: 180000, date: '2026-10-19' },
  ], allocations: [], exceptions: [
    { invoiceId: 'INV-101', reason: 'Scheme claim', owner: 'Asha', notes: 'Festival discount claimed; approval evidence pending.', resolved: false },
  ] };
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
    { invoiceId: 'INV-101', reason: 'Scheme claim', owner: 'Asha', notes: 'Festival discount claimed; approval evidence pending.', resolved: false },
    { invoiceId: 'INV-102', reason: 'Scheme claim', owner: '', notes: 'Verbal sales promise; no approved budget attached.', resolved: false },
  ] };
}
