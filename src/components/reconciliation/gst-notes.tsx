import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Workspace } from '@/lib/reconciliation/engine';
import { deskDate } from '@/lib/reconciliation/mis';
import { buyerMessage, eInvoiceCrn, gstAtRisk, gstr1Cdnr, noteState, recordIms, sampleNotes, toFinancial, type CreditNote, type ImsAction } from '@/lib/reconciliation/gst';

const KEY = 'er-credit-notes-v1';
const inr = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const nice = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Shared by the MIS row and the register, so a recorded IMS action moves both at once. */
export function useCreditNotes(w: Workspace) {
  const seed = () => sampleNotes(w.invoices);
  const [notes, setNotes] = useState<CreditNote[]>(() => { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s) as CreditNote[]; } catch { /* first visit */ } return seed(); });
  useEffect(() => { const on = (e: Event) => setNotes((e as CustomEvent<CreditNote[]>).detail); window.addEventListener('er-cn', on); return () => window.removeEventListener('er-cn', on); }, []);
  const save = (n: CreditNote[]) => { try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* fine */ } window.dispatchEvent(new CustomEvent('er-cn', { detail: n })); };
  const valid = notes.filter(n => w.invoices.some(i => i.id === n.invoiceId));
  useEffect(() => { if (w.invoices.length && valid.length < Math.min(3, w.invoices.length)) save(seed()); }, [w.invoices.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return { notes: valid, save, reset: () => save(seed()) };
}

const tone = { ok: 'border-money-ok/40 bg-money-ok/5', warn: 'border-amber-300 bg-amber-50', bad: 'border-destructive/40 bg-destructive/5', none: 'border-border bg-muted/40' } as const;
const label: Record<ImsAction, string> = { accepted: 'Accepted', pending: 'Pending', rejected: 'Rejected' };

function Payload({ title, note, body }: { title: string; note: string; body: string }) {
  const [copied, setCopied] = useState(false);
  return <details className="mt-2 rounded-md border border-border bg-card px-3 py-2">
    <summary className="cursor-pointer text-sm font-medium">⇄ {title} <span className="ml-1 text-xs font-normal text-muted-foreground">integration preview</span></summary>
    <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-foreground p-3 text-[11px] leading-5 text-background">{body}</pre>
    <Button size="sm" variant="outline" className="mt-2" onClick={() => { void navigator.clipboard?.writeText(body).then(() => setCopied(true)); }}>{copied ? 'Copied' : 'Copy payload'}</Button>
  </details>;
}

export function GstNotes({ w }: { w: Workspace }) {
  const { notes, save, reset } = useCreditNotes(w);
  const asOf = deskDate(w).toISOString().slice(0, 10);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  if (!notes.length) return null;
  const risk = gstAtRisk(notes, asOf);
  const act = (no: string, ims: ImsAction) => { try { setErr(''); save(recordIms(notes, no, ims, asOf, remarks[no] ?? '')); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(gstr1Cdnr(notes), null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `gstr1-9b-credit-notes-${asOf}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };
  return <section id="gst-notes" aria-label="GST credit notes" className="mt-6 min-w-0 rounded-lg border border-border bg-card p-3 sm:p-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[.7rem] font-semibold uppercase tracking-wide text-muted-foreground">GST credit notes · rules in force from 1 Nov 2026</p>
        <h2 className="text-base font-semibold">{risk.count ? <>{inr(risk.paise)} of GST relief doesn't hold yet</> : 'Every GST reduction you claimed holds'}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">A post-sale discount cuts your GST only through a s.34 credit note, and only once the buyer reverses the same input tax credit (they accept it in IMS). {risk.deadline && <>Declare by <b className="text-foreground">{nice(risk.deadline)}</b> ({risk.daysLeft} days), or the GST stays paid for good.</>}</p>
      </div>
      <Button size="sm" variant="outline" className="min-h-11" onClick={download}>⬇ GSTR-1 Table 9B (JSON)</Button>
    </div>
    {err && <p role="alert" className="mt-3 border-l-2 border-destructive p-2 text-sm text-destructive">{err}</p>}
    <ul className="mt-3 grid gap-3">{notes.map(n => { const s = noteState(n, asOf); return <li key={n.no} className={'rounded-lg border p-3 ' + tone[s.tone]}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="m-0 text-sm"><b>{n.customer}</b> · {n.no} against {n.invoiceId} · {inr(n.taxable)} + {n.kind === 'gst' ? `${n.rate}% GST = ${inr(n.taxable + s.gst)}` : 'no GST change'}</p>
        <span className="text-xs text-muted-foreground">{n.kind === 'gst' ? 'GST credit note (s.34)' : 'Financial credit note'}</span>
      </div>
      <p className="m-0 mt-1 text-sm font-medium">{s.next}</p>
      {n.kind === 'gst' && <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Buyer's IMS action, recorded from the GST portal:</span>
        <div role="group" aria-label={`IMS action for ${n.no}`} className="inline-flex overflow-hidden rounded-md border border-border">{(['accepted', 'pending', 'rejected'] as ImsAction[]).map(k => <button key={k} type="button" aria-pressed={n.ims === k} onClick={() => act(n.no, k)} className={'min-h-9 px-3 text-xs font-medium ' + (n.ims === k ? 'bg-foreground text-background' : 'bg-card hover:bg-muted')}>{label[k]}</button>)}</div>
        {n.ims !== 'rejected' && <input aria-label="Buyer's rejection remark" placeholder="Their remark, if rejecting" className="er-input min-h-9 min-w-0 flex-1 text-sm" value={remarks[n.no] ?? ''} onChange={e => setRemarks(r => ({ ...r, [n.no]: e.target.value }))} />}
        {n.ims === 'rejected' && <Button size="sm" variant="outline" onClick={() => save(toFinancial(notes, n.no, asOf))}>Settle as financial credit note</Button>}
      </div>}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard?.writeText(buyerMessage(n)); }}>Copy message for the buyer</Button>
      </div>
      {n.kind === 'gst' && <Payload title="E-invoice for the credit note (CRN)" note="NIC e-invoice schema, document type CRN, with the original invoice in RefDtls. Needed where e-invoicing applies to you. GSTINs left as placeholders. Sample payload, not sent to the IRP." body={JSON.stringify(eInvoiceCrn(n), null, 2)} />}
    </li>; })}</ul>
    <p className="mt-3 text-xs text-muted-foreground">Sources: Finance Act 2026 and Notification 03/2026-Central Tax (s.15(3)(b), s.34, from 1 Nov 2026) · CBIC Circular 251/08/2025-GST (financial credit notes) · GSTN advisory on IMS (one tax period pending). Amounts are sample data; GST rate shown per note. This is a workflow, not tax advice. <button type="button" className="underline" onClick={() => { setErr(''); reset(); }}>Reset these notes</button></p>
  </section>;
}
