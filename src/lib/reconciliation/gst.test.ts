import { describe, expect, it } from 'vitest';
import { buyerMessage, eInvoiceCrn, gstAtRisk, gstOn, gstr1Cdnr, imsDecideBy, noteState, recordIms, s34Deadline, sampleNotes, toFinancial } from './gst';

const notes = sampleNotes(['INV-101', 'INV-105', 'INV-108'].map(id => ({ id, customer: 'Aarav Distributors', date: '2026-10-10' })));

describe('GST credit notes (rules from 1 Nov 2026)', () => {
  it('uses the s.34(2) deadline: 30 Nov after the financial year of the supply', () => {
    expect(s34Deadline('2026-10-10')).toBe('2027-11-30');
    expect(s34Deadline('2027-02-10')).toBe('2027-11-30');
    expect(s34Deadline('2027-04-01')).toBe('2028-11-30');
  });
  it('allows one tax period pending in IMS', () => { expect(imsDecideBy('2026-10-22')).toBe('2026-11-30'); });
  it('counts only GST notes the buyer has not accepted as at risk', () => {
    const r = gstAtRisk(notes, '2026-10-26');
    expect(r.count).toBe(2);
    expect(r.paise).toBe(gstOn(notes[1]!) + gstOn(notes[2]!));
    expect(r.rejected).toBe(1);
  });
  it('flags a note pending past one tax period', () => { expect(noteState(notes[1]!, '2026-12-01').overdue).toBe(true); });
  it('needs the buyer remark to record a rejection', () => {
    expect(() => recordIms(notes, 'CN-2026-032', 'rejected', '2026-10-26')).toThrow(/remark/);
    expect(gstAtRisk(recordIms(notes, 'CN-2026-032', 'accepted', '2026-10-26'), '2026-10-26').count).toBe(1);
  });
  it('a financial credit note carries no GST and is not reported in GSTR-1', () => {
    const f = toFinancial(notes, 'CN-2026-041', '2026-10-26');
    expect(gstAtRisk(f, '2026-10-26').count).toBe(1);
    expect(gstr1Cdnr(f).cdnr.map(r => r.nt[0]!.nt_num)).not.toContain('CN-2026-041');
    expect(buyerMessage(f[2]!)).toMatch(/no reversal needed/);
  });
  it('e-invoice CRN refers to the original invoice and its totals add up', () => {
    const e = eInvoiceCrn(notes[0]!);
    expect(e.DocDtls.Typ).toBe('CRN');
    expect(e.RefDtls.PrecDocDtls[0]!.InvNo).toBe('INV-101');
    expect(e.ValDtls.TotInvVal).toBeCloseTo(e.ValDtls.AssVal + e.ValDtls.CgstVal + e.ValDtls.SgstVal, 2);
  });
});
