import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Live link: a matched receipt for one of Ten Today's discounted invoices is sent to the
// ServiceNow app "Ten Today Discount Approval". The call goes through Ten Today's server
// (/api/payment), which holds the ServiceNow credentials; this page never sees them.
const GATEWAY = 'https://tentoday.vercel.app/api/payment';

interface Receipt { id: string; retailer: string; invoice_number: string; expected: number; amount_collected: number; collection_date: string; reference: string }
interface Result { live: boolean; why?: string; number?: string; gap?: number; c6?: 'pass' | 'fail'; lifecycle_stage?: string; detail?: string | null; error?: string }

const rs = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const WHY: Record<string, string> = {
  not_configured: 'The live connection is not switched on yet.',
  asleep: 'The ServiceNow demo instance is asleep (free developer instances pause when idle). Try again in a minute.',
  refused: 'ServiceNow refused the request.',
};

export function LiveServiceNowPayments() {
  const [rows, setRows] = useState<Receipt[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [out, setOut] = useState<Record<string, Result>>({});

  useEffect(() => {
    fetch(GATEWAY).then(r => r.json()).then(j => setRows(j.receipts ?? [])).catch(() => setFailed(true));
  }, []);

  const send = async (id: string) => {
    setBusy(id);
    try {
      const r = await fetch(GATEWAY, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
      const j: Result = await r.json();
      setOut(o => ({ ...o, [id]: r.ok ? j : { live: false, error: j.error ?? 'Could not reach the server.' } }));
    } catch {
      setOut(o => ({ ...o, [id]: { live: false, error: 'Could not reach the server.' } }));
    } finally { setBusy(null); }
  };

  return <section aria-label="Live link to ServiceNow" className="mt-6 min-w-0 rounded-lg border border-border bg-card p-3 sm:p-4">
    <p className="text-[.7rem] font-semibold uppercase tracking-wide text-muted-foreground">Live in ServiceNow · discounted bills from Ten Today</p>
    <h2 className="text-base font-semibold">Did the right money arrive? Tell ServiceNow.</h2>
    <p className="mt-1 text-xs text-muted-foreground">These bills carry a discount approved in Ten Today. When the payment is matched here, ServiceNow records it on the discount, works out the gap and passes or fails check C6 (right money). This is a real call to a ServiceNow developer instance, not a simulation.</p>
    {failed && <p className="mt-3 text-sm text-destructive">Could not load the bills from Ten Today.</p>}
    {!rows && !failed && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
    {rows && <div className="mt-3 max-w-full overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm">
      <thead className="text-xs text-muted-foreground"><tr className="border-b border-border"><th className="py-2 pr-3 font-medium">Bill / retailer</th><th className="py-2 pr-3 font-medium">Expected</th><th className="py-2 pr-3 font-medium">Received</th><th className="py-2 pr-3 font-medium">ServiceNow</th></tr></thead>
      <tbody>{rows.map(r => { const o = out[r.id]; const gap = r.expected - r.amount_collected; return <tr key={r.id} className="border-b border-border/60 align-top last:border-0">
        <td className="py-2 pr-3"><strong>{r.invoice_number}</strong><span className="block text-xs text-muted-foreground">{r.retailer} · {r.reference} · {r.collection_date}</span></td>
        <td className="py-2 pr-3 tabular-nums">{rs(r.expected)}</td>
        <td className="py-2 pr-3 tabular-nums">{rs(r.amount_collected)}{gap !== 0 && <span className="block text-xs text-destructive">{rs(Math.abs(gap))} {gap > 0 ? 'short' : 'over'}</span>}</td>
        <td className="py-2 pr-3">{!o ? <Button size="sm" variant="outline" className="min-h-9" disabled={busy !== null} onClick={() => send(r.id)}>{busy === r.id ? 'Sending…' : '↗ Send to ServiceNow'}</Button>
          : o.live ? <span className={'text-xs ' + (o.c6 === 'pass' ? 'text-money-ok' : 'text-destructive')}><b>{o.number}</b> updated · gap {rs(o.gap ?? 0)} · C6 {o.c6 === 'pass' ? 'passes' : 'fails, Receivables to chase'}</span>
          : <span className="text-xs text-muted-foreground">{o.error ?? WHY[o.why ?? ''] ?? 'ServiceNow did not answer.'}{o.detail ? ` (${o.detail})` : ''}</span>}</td>
      </tr>; })}</tbody>
    </table></div>}
    <p className="mt-3 text-xs"><a className="text-primary underline" href="https://tentoday.vercel.app/app.html#controls" target="_blank" rel="noreferrer">See the same discounts in Ten Today ↗</a></p>
  </section>;
}
