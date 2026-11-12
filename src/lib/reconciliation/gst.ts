/**
 * GST credit notes for post-sale discounts, under the rules in force from 1 Nov 2026
 * (Finance Act 2026, Notification 03/2026-Central Tax; CGST s.15(3)(b) and s.34):
 *  - a post-sale discount reduces GST only through a s.34 credit note, and only if the buyer reverses the matching ITC;
 *  - the credit note must be declared by 30 Nov after the financial year of the supply ends (s.34(2));
 *  - the buyer acts on it in the Invoice Management System (IMS): accept, reject (with a remark) or keep pending for one tax period;
 *  - a financial credit note leaves GST unchanged (CBIC Circular 251/08/2025-GST).
 * Amounts are in paise, like the rest of the desk. Nothing here talks to the GST portal: IMS actions are recorded by the controller.
 */
export type ImsAction = 'pending' | 'accepted' | 'rejected';
export type CreditNote = {
  no: string; invoiceId: string; invoiceDate: string; customer: string;
  kind: 'gst' | 'financial'; taxable: number; rate: 5 | 18 | 40; issuedOn: string;
  ims: ImsAction; remark?: string | undefined; recordedOn?: string | undefined;
};

const DAY = 86_400_000;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const nice = (d: string) => { const [y = 0, m = 1, dd = 1] = d.split('-').map(Number); return `${dd} ${MON[m - 1]} ${y}`; };
const ms = (d: string) => Date.parse(d + 'T00:00:00Z');
export const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
export const gstOn = (n: CreditNote) => (n.kind === 'gst' ? Math.round(n.taxable * n.rate / 100) : 0);
/** s.34(2): 30 Nov after the end of the financial year of the original supply. */
export const s34Deadline = (invoiceDate: string) => { const [y = 0, m = 0] = invoiceDate.split('-').map(Number); return `${m >= 4 ? y + 1 : y}-11-30`; };
/** IMS lets the buyer keep a credit note pending for one tax period: here, to the end of the month after it was issued. */
export const imsDecideBy = (issuedOn: string) => { const [y = 0, m = 0] = issuedOn.split('-').map(Number); return iso(Date.UTC(y, m + 1, 0)); };

export type NoteState = { note: CreditNote; gst: number; deadline: string; daysLeft: number; holds: boolean; overdue: boolean; next: string; tone: 'ok' | 'warn' | 'bad' | 'none' };
export function noteState(n: CreditNote, asOf: string): NoteState {
  const gst = gstOn(n), deadline = s34Deadline(n.invoiceDate), daysLeft = Math.round((ms(deadline) - ms(asOf)) / DAY);
  if (n.kind === 'financial') return { note: n, gst: 0, deadline, daysLeft, holds: true, overdue: false, tone: 'none', next: 'Financial credit note: GST stays as billed, the buyer keeps their input tax credit. Nothing to file.' };
  const by = imsDecideBy(n.issuedOn), overdue = n.ims === 'pending' && asOf > by;
  if (n.ims === 'accepted') return { note: n, gst, deadline, daysLeft, holds: true, overdue: false, tone: 'ok', next: `Accepted in IMS. Your GST reduction of ₹${(gst / 100).toLocaleString('en-IN')} holds.` };
  if (n.ims === 'rejected') return { note: n, gst, deadline, daysLeft, holds: false, overdue: false, tone: 'bad', next: `Rejected: “${n.remark || 'no remark'}”. The reduction doesn't hold. Fix the note or settle it as a financial credit note before ${nice(deadline)}.` };
  return { note: n, gst, deadline, daysLeft, holds: false, overdue, tone: overdue ? 'bad' : 'warn', next: overdue ? `Pending past ${nice(by)}. The buyer has had a full tax period: call them, or treat it as rejected.` : `Waiting for ${n.customer} to accept in IMS (by ${nice(by)}).` };
}

/** "Dead cash": GST you have reduced, or plan to, that doesn't hold yet. Lost for good if still open after the s.34(2) date. */
export function gstAtRisk(notes: CreditNote[], asOf: string) {
  const open = notes.map(n => noteState(n, asOf)).filter(s => s.note.kind === 'gst' && !s.holds);
  const deadline = open.map(s => s.deadline).sort()[0] ?? null;
  return { count: open.length, paise: open.reduce((t, s) => t + s.gst, 0), rejected: open.filter(s => s.note.ims === 'rejected').length, overdue: open.filter(s => s.overdue).length, deadline, daysLeft: deadline ? Math.round((ms(deadline) - ms(asOf)) / DAY) : null };
}

/** Record the buyer's IMS action from the GST portal. A rejection needs the buyer's remark. */
export function recordIms(notes: CreditNote[], no: string, ims: ImsAction, asOf: string, remark = ''): CreditNote[] {
  if (ims === 'rejected' && !remark.trim()) throw new Error('Copy the buyer’s rejection remark from IMS so the fix is clear.');
  return notes.map(n => (n.no === no ? { ...n, ims, remark: ims === 'rejected' ? remark.trim() : undefined, recordedOn: asOf } : n));
}
/** Settling a rejected GST note as a financial credit note: the discount stands, the GST reduction is given up. */
export const toFinancial = (notes: CreditNote[], no: string, asOf: string): CreditNote[] => notes.map(n => (n.no === no ? { ...n, kind: 'financial', ims: 'accepted', recordedOn: asOf } : n));

const dmy = (d: string) => d.split('-').reverse().join('-');
const r2 = (p: number) => Math.round(p) / 100;
/** The credit note as an e-invoice (document type CRN) in the NIC e-invoice schema, referring back to the original invoice. */
export function eInvoiceCrn(n: CreditNote) {
  const tax = gstOn(n);
  return {
    Version: '1.1',
    TranDtls: { TaxSch: 'GST', SupTyp: 'B2B' },
    DocDtls: { Typ: 'CRN', No: n.no, Dt: dmy(n.issuedOn).replace(/-/g, '/') },
    SellerDtls: { Gstin: '<your GSTIN>' }, BuyerDtls: { Gstin: '<buyer GSTIN>', LglNm: n.customer, Pos: '<state code>' },
    RefDtls: { PrecDocDtls: [{ InvNo: n.invoiceId, InvDt: dmy(n.invoiceDate).replace(/-/g, '/') }] },
    ItemList: [{ SlNo: '1', PrdDesc: `Post-sale discount on ${n.invoiceId}`, IsServc: 'N', HsnCd: '<HSN>', Qty: 1, Unit: 'OTH', UnitPrice: r2(n.taxable), TotAmt: r2(n.taxable), AssAmt: r2(n.taxable), GstRt: n.rate, CgstAmt: r2(tax / 2), SgstAmt: r2(tax / 2), TotItemVal: r2(n.taxable + tax) }],
    ValDtls: { AssVal: r2(n.taxable), CgstVal: r2(tax / 2), SgstVal: r2(tax / 2), TotInvVal: r2(n.taxable + tax) },
  };
}
/** GSTR-1 Table 9B (credit notes to registered buyers, "cdnr") rows in the GST offline-tool JSON shape. Financial notes are not reported. */
export function gstr1Cdnr(notes: CreditNote[]) {
  return {
    cdnr: notes.filter(n => n.kind === 'gst').map(n => ({
      ctin: '<buyer GSTIN>',
      nt: [{ ntty: 'C', nt_num: n.no, nt_dt: dmy(n.issuedOn), val: r2(n.taxable + gstOn(n)), pos: '<state code>', rchrg: 'N', inv_typ: 'R',
        itms: [{ num: 1, itm_det: { rt: n.rate, txval: r2(n.taxable), camt: r2(gstOn(n) / 2), samt: r2(gstOn(n) / 2), csamt: 0 } }] }],
    })),
  };
}
export const buyerMessage = (n: CreditNote) => n.kind === 'gst'
  ? `Hi ${n.customer} team, credit note ${n.no} for ₹${((n.taxable + gstOn(n)) / 100).toLocaleString('en-IN')} against ${n.invoiceId} is issued. Please accept it in IMS and reverse ₹${(gstOn(n) / 100).toLocaleString('en-IN')} of input tax credit this month.`
  : `Hi ${n.customer} team, credit note ${n.no} for ₹${(n.taxable / 100).toLocaleString('en-IN')} against ${n.invoiceId} is issued as a financial credit note. Your GST input stays as billed; no reversal needed.`;

/** Sample notes for the demo desk: three credit notes on the desk's own invoices, each at a different IMS stage. */
export const sampleNotes = (invoices: { id: string; customer: string; date: string }[]): CreditNote[] => {
  const pick = ['INV-101', 'INV-105', 'INV-108'].map(id => invoices.find(i => i.id === id));
  const pool = invoices.filter(i => !pick.includes(i));
  const inv = pick.map(x => x ?? pool.shift()).filter((x): x is { id: string; customer: string; date: string } => !!x);
  const plan: Pick<CreditNote, 'no' | 'taxable' | 'issuedOn' | 'ims' | 'remark' | 'recordedOn'>[] = [
    { no: 'CN-2026-031', taxable: 100000, issuedOn: '2026-10-20', ims: 'accepted', recordedOn: '2026-10-24' },
    { no: 'CN-2026-032', taxable: 150000, issuedOn: '2026-10-22', ims: 'pending' },
    { no: 'CN-2026-041', taxable: 120000, issuedOn: '2026-10-23', ims: 'rejected', remark: 'Scheme slab not met on this invoice', recordedOn: '2026-10-25' },
  ];
  return inv.slice(0, 3).map((i, k) => ({ ...plan[k]!, invoiceId: i.id, invoiceDate: i.date, customer: i.customer, kind: 'gst', rate: 18 }));
};
