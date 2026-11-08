import { describe, it, expect } from 'vitest';
import { allocate, autoMatch, importCsv, invoiceBalance, receiptBalance, sampleWorkspace, validateWorkspace } from './engine';
describe('reconciliation rules', () => {
  it('matches exact invoice references and leaves missing references unapplied', () => { const w = autoMatch(sampleWorkspace()); expect(w.allocations).toHaveLength(3); expect(receiptBalance(w, 'UTR-003')).toBe(2835000); expect(invoiceBalance(w, 'INV-101')).toBe(118000); });
  it('never overallocates a receipt or invoice', () => { const w = autoMatch(sampleWorkspace()); expect(() => allocate(w, 'UTR-001', 'INV-103', 1)).toThrow(); expect(() => allocate(w, 'UTR-003', 'INV-101', 118001)).toThrow(); });
  it('supports a manual partial allocation', () => { const w = allocate(sampleWorkspace(), 'UTR-003', 'INV-103', 2835000); expect(invoiceBalance(w, 'INV-103')).toBe(315000); });
  it('keeps ambiguous references unmatched', () => { const w = sampleWorkspace(); w.invoices.push({ ...w.invoices[0], id: 'inv-101', customer: 'Other', amount: 1000, date: '2026-10-01' }); expect(autoMatch(w).allocations.some(a => a.receiptId === 'UTR-001')).toBe(false); });
  it('matching twice does not duplicate allocations', () => { const w = autoMatch(sampleWorkspace()); expect(autoMatch(w)).toEqual(w); });
  it('rejects malformed and duplicate imports atomically', () => { const w = sampleWorkspace(); expect(() => importCsv(w, 'invoices', 'id,customer,amount,date\nNEW,Test,100,2026-10-01\nBAD,Test,no,2026-10-02')).toThrow(); expect(w.invoices).toHaveLength(4); expect(() => importCsv(w, 'invoices', 'id,customer,amount,date\nINV-101,Test,100,2026-10-01')).toThrow(); });
  it('imports quoted customer names and exact decimal currency', () => { const w = importCsv(sampleWorkspace(), 'invoices', 'id,customer,amount,date\nNEW,"Test, Ltd",100.25,2026-10-01'); expect(w.invoices.at(-1)?.amount).toBe(10025); });
  it('resolving an exception does not change cash or invoice balances', () => { const w = autoMatch(sampleWorkspace()); const before = invoiceBalance(w, 'INV-101'); const exception = w.exceptions[0]; if (!exception) throw new Error('Missing sample exception'); exception.resolved = true; expect(invoiceBalance(validateWorkspace(w), 'INV-101')).toBe(before); });
});
