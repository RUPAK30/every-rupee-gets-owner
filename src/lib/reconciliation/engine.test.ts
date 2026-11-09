import { describe, it, expect } from 'vitest';
import { allocate, approvalCheck, autoMatch, importCsv, invoiceBalance, receiptBalance, sampleWorkspace, validateWorkspace } from './engine';
describe('reconciliation rules', () => {
  it('keeps demo totals aligned with the homepage and README sample', () => {
    const w = sampleWorkspace();
    const billed = w.invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const received = w.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    expect(billed).toBe(19130000);
    expect(received).toBe(17371000);
    expect(billed - received).toBe(1759000);
    expect(w.allocations).toHaveLength(0);
  });
  it('matches exact invoice references and leaves missing references unapplied', () => { const w = autoMatch(sampleWorkspace()); expect(w.allocations).toHaveLength(3); expect(receiptBalance(w, 'UTR-003')).toBe(2835000); expect(invoiceBalance(w, 'INV-101')).toBe(118000); });
  it('never overallocates a receipt or invoice', () => { const w = autoMatch(sampleWorkspace()); expect(() => allocate(w, 'UTR-001', 'INV-103', 1)).toThrow(); expect(() => allocate(w, 'UTR-003', 'INV-101', 118001)).toThrow(); });
  it('supports a manual partial allocation', () => { const w = allocate(sampleWorkspace(), 'UTR-003', 'INV-103', 2835000); expect(invoiceBalance(w, 'INV-103')).toBe(315000); });
  it('keeps ambiguous references unmatched', () => { const w = sampleWorkspace(); w.invoices.push({ ...w.invoices[0], id: 'inv-101', customer: 'Other', amount: 1000, date: '2026-10-01' }); expect(autoMatch(w).allocations.some(a => a.receiptId === 'UTR-001')).toBe(false); });
  it('matching twice does not duplicate allocations', () => { const w = autoMatch(sampleWorkspace()); expect(autoMatch(w)).toEqual(w); });
  it('rejects malformed and duplicate imports atomically', () => { const w = sampleWorkspace(); expect(() => importCsv(w, 'invoices', 'id,customer,amount,date\nNEW,Test,100,2026-10-01\nBAD,Test,no,2026-10-02')).toThrow(); expect(w.invoices).toHaveLength(4); expect(() => importCsv(w, 'invoices', 'id,customer,amount,date\nINV-101,Test,100,2026-10-01')).toThrow(); });
  it('imports quoted customer names and exact decimal currency', () => { const w = importCsv(sampleWorkspace(), 'invoices', 'id,customer,amount,date\nNEW,"Test, Ltd",100.25,2026-10-01'); expect(w.invoices.at(-1)?.amount).toBe(10025); });
  it('resolving an exception does not change cash or invoice balances', () => { const w = autoMatch(sampleWorkspace()); const before = invoiceBalance(w, 'INV-101'); const exception = w.exceptions[0]; if (!exception) throw new Error('Missing sample exception'); exception.resolved = true; expect(invoiceBalance(validateWorkspace(w), 'INV-101')).toBe(before); });
  it('BR-5 blocks resolution above ₹10,000 without a separate checker, including direct save input', () => { const w = autoMatch(sampleWorkspace()); const e = w.exceptions.find(e => e.invoiceId === 'INV-102'); if (!e) throw new Error('Missing case'); expect(invoiceBalance(w, e.invoiceId)).toBe(1240000); e.resolved = true; expect(() => validateWorkspace(w)).toThrow('BR-5'); w.allocations.push({ id: 'boundary', invoiceId: 'INV-102', receiptId: 'UTR-003', amount: 240000 }); expect(invoiceBalance(validateWorkspace(w), e.invoiceId)).toBe(1000000); });
  it('BR-4 rejects write-off instructions and never clears money through a case decision', () => { const w = autoMatch(sampleWorkspace()); expect(() => validateWorkspace({ ...w, writeOffs: [{ invoiceId: 'INV-101', amount: 118000 }] })).toThrow(); const e = w.exceptions.find(e => e.invoiceId === 'INV-101'); if (!e) throw new Error('Missing case'); e.resolved = true; expect(invoiceBalance(validateWorkspace(w), 'INV-101')).toBe(118000); expect(receiptBalance(w, 'UTR-003')).toBe(2835000); });
  it('BR-10: clears a scheme deduction covered by the Ten Today approval (cap + 18% GST)', () => {
    const r = approvalCheck(autoMatch(sampleWorkspace()), 'INV-101');
    expect(r.status).toBe('covered');
    if (r.status === 'covered') { expect(r.short).toBe(118000); expect(r.limit).toBe(118000); expect(r.approval.id).toBe('APV-2026-031'); }
  });
  it('BR-10: routes a deduction with no Ten Today approval back to sales, and waits for payment first', () => {
    expect(approvalCheck(sampleWorkspace(), 'INV-101').status).toBe('unpaid');
    const r = approvalCheck(autoMatch(sampleWorkspace()), 'INV-102');
    expect(r.status).toBe('none');
    if (r.status === 'none') expect(r.short).toBe(1240000);
  });
  it('BR-10: splits at the cap and flags an expired approval', () => {
    const w = autoMatch(sampleWorkspace());
    const small: import('./engine').SalesApproval[] = [{ id: 'APV-X', customer: 'Aarav Distributors', rep: 'Rahul', approver: 'Kavita', capBeforeGst: 50000, validTo: '2026-10-31' }];
    const r = approvalCheck(w, 'INV-101', small);
    expect(r.status).toBe('excess');
    if (r.status === 'excess') { expect(r.limit).toBe(59000); expect(r.excess).toBe(59000); }
    expect(approvalCheck(w, 'INV-101', [{ ...small[0]!, validTo: '2026-09-30' }]).status).toBe('expired');
  });
});
