import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Workspace } from '@/lib/reconciliation/engine';

const API = 'https://tentoday.vercel.app/api/payment-matched';
const rs = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });

/** When a payment is matched here, Ten Today is told, so the rep is paid on cash that arrived, not on the booking. */
export function TenTodaySync({ w }: { w: Workspace }) {
  const [out, setOut] = useState<{ req: string; res: string; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const paid = w.invoices.map(i => ({ i, got: w.allocations.filter(a => a.invoiceId === i.id).reduce((s, a) => s + a.amount, 0) })).filter(x => x.got > 0);
  const pick = paid.find(x => x.got < x.i.amount) ?? paid[0];
  if (!pick) return null;
  const send = async () => {
    setBusy(true);
    const ev = { event: 'payment.matched', idempotency_key: `er_${pick.i.id}_${pick.got}`, order_id: pick.i.id, billed_amount: pick.i.amount / 100, actual_received: pick.got / 100, matched_on: new Date().toISOString().slice(0, 10), source: 'Every Rupee' };
    try { const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(ev) }); const j = await r.json(); setOut({ req: JSON.stringify(ev, null, 2), res: JSON.stringify(j, null, 2), msg: j.message ?? j.error ?? 'Sent.' }); }
    catch { setOut({ req: JSON.stringify(ev, null, 2), res: '{ "error": "Ten Today could not be reached from this network." }', msg: 'Ten Today could not be reached from here. Nothing changed.' }); }
    setBusy(false);
  };
  return <section aria-label="Ten Today pay update" className="mt-6 min-w-0 rounded-lg border border-border bg-card p-3 sm:p-4">
    <p className="text-[.7rem] font-semibold uppercase tracking-wide text-muted-foreground">Connected · Ten Today</p>
    <h2 className="text-base font-semibold">Reps are paid on cash that arrived, not on the booking</h2>
    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{pick.i.customer} paid {rs(pick.got)} against {rs(pick.i.amount)} on {pick.i.id}. Matching it here tells Ten Today, which holds only the incentive on any gap until it's cleared. Nothing is ever deducted from pay.</p>
    <Button size="sm" className="mt-3 min-h-11" disabled={busy} onClick={() => void send()}>{busy ? 'Sending…' : 'Send this payment to Ten Today ⇄'}</Button>
    {out && <div className="mt-3"><p className="text-sm font-medium">{out.msg}</p>
      <details className="mt-2 rounded-md border border-border px-3 py-2"><summary className="cursor-pointer text-sm">⇄ The API call <span className="text-xs text-muted-foreground">request and live response</span></summary>
        <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-foreground p-3 text-[11px] leading-5 text-background">{`POST ${API}\n${out.req}`}</pre>
        <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-foreground p-3 text-[11px] leading-5 text-background">{out.res}</pre></details></div>}
  </section>;
}
