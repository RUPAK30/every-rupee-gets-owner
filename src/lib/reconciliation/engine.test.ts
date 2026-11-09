import { describe, it, expect } from 'vitest';
import { allocate, approvalCheck, approveCase, autoMatch, handBack, resolveSmall, saveCase, sendBack, submitForApproval, importCsv, invoiceBalance, receiptBalance, sampleWorkspace, validateWorkspace, sealLog, verifyLog } from './engine';
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
  it('ownership: a case can only be owned by someone who handles that reason', () => {
    const w = autoMatch(sampleWorkspace());
    expect(() => saveCase(w, 'INV-102', { reason: 'Scheme claim · not approved', owner: 'Asha', notes: 'x' }, 'Asha')).toThrow(/doesn't handle/);
    expect(saveCase(w, 'INV-102', { reason: 'Scheme claim · not approved', owner: 'Rahul', notes: 'x' }, 'Asha').exceptions.find(e => e.invoiceId === 'INV-102')?.owner).toBe('Rahul');
  });
  it('BR-5: above ₹10,000 the maker submits, cannot self-approve, and a different checker resolves', () => {
    let w = saveCase(autoMatch(sampleWorkspace()), 'INV-102', { reason: 'Scheme claim · approved in Ten Today', owner: 'Asha', notes: 'APV attached' }, 'Asha');
    expect(() => resolveSmall(w, 'INV-102', 'Asha')).toThrow(/second approval/);
    w = submitForApproval(w, 'INV-102', 'Asha');
    expect(() => approveCase(w, 'INV-102', 'Asha')).toThrow(/can't approve/);
    const back = sendBack(w, 'INV-102', 'Vikram', 'Need the rep email');
    expect(back.exceptions.find(e => e.invoiceId === 'INV-102')?.status).toBe('open');
    w = approveCase(w, 'INV-102', 'Vikram');
    const e = w.exceptions.find(x => x.invoiceId === 'INV-102')!;
    expect(e.resolved).toBe(true); expect(e.approvedBy).toBe('Vikram'); expect(e.log!.length).toBe(3);
  });
  it('a gap owned by sales cannot be closed by finance until the rep hands it back', () => {
    let w = saveCase(autoMatch(sampleWorkspace()), 'INV-102', { reason: 'Scheme claim · not approved', owner: 'Rahul', notes: 'No approval' }, 'Asha');
    expect(() => submitForApproval(w, 'INV-102', 'Asha')).toThrow(/Rahul acts/);
    expect(() => handBack(w, 'INV-102', 0, ' ')).toThrow(/what Rahul did/);
    w = handBack(w, 'INV-102', 0, 'Kavita approved APV in Ten Today');
    const e = w.exceptions.find(x => x.invoiceId === 'INV-102')!;
    expect(e.owner).toBe('Asha'); expect(e.reason).toBe('Scheme claim · approved in Ten Today');
    w = approveCase(submitForApproval(w, 'INV-102', 'Asha'), 'INV-102', 'Vikram');
    expect(w.exceptions.find(x => x.invoiceId === 'INV-102')!.status).toBe('resolved');
    const r = handBack(saveCase(autoMatch(sampleWorkspace()), 'INV-102', { reason: 'Scheme claim · not approved', owner: 'Rahul', notes: 'x' }, 'Asha'), 'INV-102', 1, 'Customer agreed to pay');
    expect(r.exceptions.find(x => x.invoiceId === 'INV-102')!.owner).toBe('Rohan');
  });
  it('BR-5: up to ₹10,000 the maker resolves alone, with an owner and a note', () => {
    const w = resolveSmall(autoMatch(sampleWorkspace()), 'INV-101', 'Asha');
    expect(w.exceptions.find(e => e.invoiceId === 'INV-101')?.status).toBe('resolved');
  });
});

import { readTenTodayApproval, approvalCheck as check2, autoMatch as am2, sampleWorkspace as sw2 } from './engine';
const tok = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
describe('Ten Today handoff contract v1', () => {
  const good = { v: 1, id: 'APV-2026-033', customer: 'Aarav Distributors', rep: 'Rahul', approver: 'Kavita', capPct: 6, validTo: '2026-12-31' };
  it('accepts a valid approval and checks the short payment against its own cap', () => {
    const a = readTenTodayApproval(tok(good));
    const r = check2(am2(sw2()), 'INV-101', [a]);
    expect(['covered', 'excess']).toContain(r.status);
    const loose = check2(am2(sw2()), 'INV-101', [readTenTodayApproval(tok({ ...good, capPct: 30 }))]);
    expect(loose.status).toBe('covered');
  });
  it('rejects damaged, wrong-version, self-approved or out-of-range approvals', () => {
    expect(() => readTenTodayApproval('%%%')).toThrow(/damaged/);
    expect(() => readTenTodayApproval(tok({ ...good, v: 2 }))).toThrow(/version/);
    expect(() => readTenTodayApproval(tok({ ...good, approver: 'Rahul' }))).toThrow(/same person/);
    expect(() => readTenTodayApproval(tok({ ...good, capPct: 45 }))).toThrow(/between/);
    expect(() => readTenTodayApproval(tok({ ...good, id: 'X' }))).toThrow(/ID/);
  });
  describe('tamper-evident history', () => {
    const raw = [1, 2, 3].map(n => ({ at: `2026-11-0${n}T10:00:00Z`, who: 'Asha', text: `Step ${n}` }));
    it('a sealed log verifies', async () => { expect(await verifyLog('INV-1', await sealLog('INV-1', raw))).toEqual({ ok: true }); });
    it('editing one entry fails at that entry', async () => { const l = await sealLog('INV-1', raw); l[1] = { ...l[1]!, text: 'Edited' }; expect(await verifyLog('INV-1', l)).toEqual({ ok: false, brokenAt: 1 }); });
    it('with four sealed entries, editing entry 2 returns brokenAt 1', async () => {
      const actions = [
        { who: 'Asha', text: 'Set reason and owner' },
        { who: 'Asha', text: 'Added evidence note' },
        { who: 'Asha', text: 'Submitted for review' },
        { who: 'Vikram', text: 'Approved' },
      ];
      let log: import('./engine').LogEntry[] = [];
      for (const action of actions) log = await sealLog('INV-101', [...log, { ...action, at: '2026-11-09T19:49:00Z' }]);
      expect(log).toHaveLength(4);
      expect(log[0]?.prevHash).toBe('GENESIS');
      for (let i = 1; i < log.length; i++) expect(log[i]?.prevHash).toBe(log[i - 1]?.hash);
      expect(await verifyLog('INV-101', log)).toEqual({ ok: true });
      const second = log[1];
      if (!second) throw new Error('Missing entry 2');
      log[1] = { ...second, text: 'Changed the stored evidence note' };
      expect(await verifyLog('INV-101', log)).toEqual({ ok: false, brokenAt: 1 });
    });
    it('reordering entries fails', async () => { const l = await sealLog('INV-1', raw); expect((await verifyLog('INV-1', [l[1]!, l[0]!, l[2]!])).ok).toBe(false); });
    it('deleting a middle entry fails', async () => { const l = await sealLog('INV-1', raw); expect(await verifyLog('INV-1', [l[0]!, l[2]!])).toEqual({ ok: false, brokenAt: 1 }); });
  });
});

import { checkTenTodaySeal } from './engine';
describe('Ten Today fingerprint', () => {
  it('matches untouched fields and catches an edited cap', async () => {
    const { createHash } = await import('node:crypto');
    const o = { v: 1, id: 'APV-2026-034', customer: 'Aarav Distributors', rep: 'Rahul', approver: 'Kavita', capPct: 6, validTo: '2026-12-31' };
    const seal = createHash('sha256').update(JSON.stringify([o.v, o.id, o.customer, o.rep, o.approver, o.capPct, o.validTo])).digest('hex');
    const t = (x: object) => Buffer.from(JSON.stringify(x)).toString('base64url');
    expect(await checkTenTodaySeal(t({ ...o, seal }))).toBe('match');
    expect(await checkTenTodaySeal(t({ ...o, capPct: 10, seal }))).toBe('mismatch');
    expect(await checkTenTodaySeal(t(o))).toBe('none');
  });
});
