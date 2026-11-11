import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { advanceRuleChange, runRuleChangeChecks, type RuleChange } from '@/lib/reconciliation/rule-change';

export function RuleChangeRequest({ onLogged }: { onLogged: (entries: RuleChange['log']) => Promise<void> }) {
  const [request, setRequest] = useState<RuleChange | null>(null);
  const [actor, setActor] = useState('Asha');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const labels = { requested: 'Approve as Vikram', approved: 'Run rule-change checks', tested: 'Simulate go-live', released: 'Released · simulation only' };
  async function advance() {
    setBusy(true); setError('');
    try { const next = await advanceRuleChange(request, actor); const added = next.log.slice(request?.log.length ?? 0); await onLogged(added); setRequest(next); }
    catch (err) { setError(err instanceof Error ? err.message : 'Request failed.'); }
    finally { setBusy(false); }
  }
  return <section aria-label="Rule change request" className="mt-4 border-t border-border pt-3 text-xs">
    <h3 className="text-sm font-semibold">Rule change request · ServiceNow ITIL Change</h3>
    <p className="my-2">Raise BR-5 two-person limit from ₹10,000 to ₹25,000 → <code>change_request</code> → Vikram approval → executable checks → simulated go-live.</p>
    <p className="text-muted-foreground">Simulated · ServiceNow Table API format. No external ticket, deployment or actual limit change. Checks below run in this browser; the full project test suite runs separately.</p>
    <div className="my-2 flex flex-wrap items-center gap-2"><label>Acting as <select aria-label="Rule change actor" className="er-input ml-2" value={actor} onChange={e => setActor(e.target.value)}><option>Asha</option><option>Vikram</option></select></label><Button size="sm" disabled={busy || request?.stage === 'released' || (request?.stage === 'requested' && actor !== 'Vikram')} onClick={() => void advance()}>{busy ? 'Checking…' : request ? labels[request.stage] : 'Request rule change'}</Button></div>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {(request?.stage === 'tested' || request?.stage === 'released') && <ul className="grid gap-1">{runRuleChangeChecks().map(check => <li key={check.name}>{check.pass ? '✓' : '✗'} {check.name}</li>)}</ul>}
    {request && <pre className="my-2 max-w-full overflow-x-auto rounded-md bg-muted p-2 text-[10px]">{JSON.stringify({ table: 'change_request', short_description: 'Raise BR-5 two-person limit from ₹10,000 to ₹25,000', state: request.stage, requested_by: 'Asha', approver: 'Vikram', simulation: true }, null, 2)}</pre>}
    {request?.log.map(entry => <p className="my-1 break-words" key={entry.hash}>{entry.who} · {entry.text} <code>{entry.hash?.slice(0, 8)}</code></p>)}
  </section>;
}