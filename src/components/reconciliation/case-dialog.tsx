import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  APPROVAL_LIMIT, HANDBACKS, PEOPLE, financeOwns, handBack, REASONS, approvalCheck, approveCase, caseStatus, invoiceBalance, money, ownersFor, personLabel,
  resolveSmall, saveCase, sealLog, verifyLog, tenTodayTaskLink, type SalesApproval, sendBack, submitForApproval, type Workspace as Data,
} from '@/lib/reconciliation/engine';

type Props = { w: Data; caseId: string | null; approvals?: SalesApproval[]; demo?: boolean; focusHistory?: boolean; onClose: () => void; change: (next: Data, message?: string) => void };
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export function CaseDialog({ w, caseId, approvals, demo = false, focusHistory = false, onClose, change: rawChange }: Props) {
  const historyRef = useRef<HTMLDivElement>(null);
  const change = (next: Data, msg?: string) => { void Promise.all(next.exceptions.map(async x => x.log ? { ...x, log: await sealLog(x.invoiceId, x.log) } : x)).then(exceptions => rawChange({ ...next, exceptions }, msg)); };
  const [check, setCheck] = useState<{ ok: boolean; text: string } | null>(null);
  const [actor, setActor] = useState('Asha');
  const [reason, setReason] = useState('Unexplained');
  const [owner, setOwner] = useState('');
  const [notes, setNotes] = useState('');
  const [why, setWhy] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [did, setDid] = useState('');
  const e = caseId ? w.exceptions.find(x => x.invoiceId === caseId) : undefined;
  useEffect(() => {
    if (!caseId) return;
    setReason(e?.reason ?? 'Unexplained'); setOwner(e?.owner ?? ''); setNotes(e?.notes ?? ''); setError(''); setWhy(''); setDone(''); setCheck(null);
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (e?.log?.some(l => !l.hash)) change(w); }, [caseId, e?.log?.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!caseId || !focusHistory) return;
    const timer = setTimeout(() => {
      historyRef.current?.scrollIntoView({ block: 'start' });
      historyRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [caseId, focusHistory]);
  if (!caseId) return null;
  const log = e?.log ?? [];
  const verify = async () => { const r = await verifyLog(caseId, log); setCheck(r.ok ? { ok: true, text: `✓ All ${log.length} entries intact` } : { ok: false, text: `✗ Entry ${r.brokenAt + 1} was changed after it was recorded` }); };
  const tamper = () => { if (!demo) return; const i = 0; rawChange({ ...w, exceptions: w.exceptions.map(x => x.invoiceId === caseId ? { ...x, log: (x.log ?? []).map((l, k) => k === i ? { ...l, text: `${l.text} (edited later)` } : l) } : x) }, 'Demo: one past entry was edited without re-sealing.'); setCheck(null); };
  const inv = w.invoices.find(i => i.id === caseId);
  const short = invoiceBalance(w, caseId);
  const big = short > APPROVAL_LIMIT;
  const status = caseStatus(w, caseId);
  const eligible = ownersFor(reason);
  const reasonOptions = REASONS.includes(reason as (typeof REASONS)[number]) ? [...REASONS] : [reason, ...REASONS];
  const dirty = !e || e.reason !== reason || e.owner !== owner || e.notes !== notes;
  const run = (fn: () => Data, msg: string) => { try { setError(''); setDone(''); change(fn(), msg); } catch (err) { setError(err instanceof Error ? err.message : 'Action failed.'); } };
  const saveFirst = (base: Data) => (dirty ? saveCase(base, caseId, { reason, owner, notes }, actor) : base);
  const pickReason = (r: string) => { setReason(r); const o = ownersFor(r); setOwner(o.length === 1 ? o[0]!.name : o.some(p => p.name === owner) ? owner : ''); };
  const ap = approvalCheck(w, caseId, approvals);
  const fill = (r: string, o: string, n: string) => {
    setReason(r); setOwner(o); setNotes(n);
    try { setError(''); change(saveCase(w, caseId, { reason: r, owner: o, notes: n }, actor), `Saved: ${caseId} owned by ${personLabel(o)}.`); setDone(financeOwns(o) ? `✓ Saved. Owner is now ${personLabel(o)}. Next step: close it below.` : `✓ Saved. It's now with ${personLabel(o)}. Finance can't close it until ${o} acts (below).`); setTimeout(() => document.getElementById('er-close-it')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }
    catch (err) { setError(err instanceof Error ? err.message : 'Action failed.'); }
  };
  const locked = status !== 'open';

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="er-app max-h-[90vh] overflow-y-auto">
      <DialogTitle>{caseId} · {inv?.customer} · {money(short)} short</DialogTitle>
      <DialogDescription>Saving records why the money is missing and who owns it. It doesn't move any money.</DialogDescription>

      <div ref={historyRef} className="border-y border-primary/25 bg-primary/5 p-3 text-sm">
        <p className="m-0 mb-1 font-semibold">History · linked fingerprints</p>
        <div className="grid gap-1"><span className="w-fit rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">Tamper-evident · SHA-256</span>
          <p className="m-0 text-xs leading-5 text-muted-foreground">Each entry's fingerprint includes the one before it, so editing or backdating any entry breaks every fingerprint after it. It proves the history wasn't altered; it doesn't prove a decision was right, and it isn't a blockchain: one company keeps this record.</p>
          {log.length > 0 && <div className="flex flex-wrap items-center gap-3"><Button type="button" size="sm" variant="outline" onClick={verify}>Verify history</Button>{demo && <Button type="button" size="sm" variant="link" className="h-auto whitespace-normal p-0 text-xs text-muted-foreground" onClick={tamper}>Simulate tampering (demo only)</Button>}</div>}
          {check && <p role="status" className={`m-0 text-sm font-medium ${check.ok ? 'text-money-ok' : 'text-destructive'}`}>{check.text}</p>}
          <details className="mt-1 text-xs"><summary className="cursor-pointer font-medium text-primary">What happens behind the scenes?</summary><div className="mt-2 grid gap-2 leading-5 text-muted-foreground"><p className="m-0"><b className="text-foreground">1. Record.</b> Save the case ID, action text, person and time.</p><p className="m-0"><b className="text-foreground">2. Link.</b> SHA-256 turns that record plus the previous fingerprint into a new fingerprint. The first starts with GENESIS.</p><p className="m-0"><b className="text-foreground">3. Check.</b> Verify recalculates each fingerprint and checks every link against the stored values. Simulating an edit keeps the old fingerprint, so verification fails.</p><p className="m-0">This detects changes to the recorded history, not whether the decision was correct. There are no independent copies or signatures: someone able to replace the entire history and recalculate every fingerprint could make it pass.</p></div></details></div>
        {log.length === 0 ? <p className="m-0 text-muted-foreground">No actions yet.</p> :
          <ol className="m-0 mt-2 grid gap-2 pl-0">{log.map((l, k) => <li key={k} className="list-none border-l-2 border-primary/30 pl-2"><span className="text-xs text-muted-foreground">Action {k + 1} · {fmtTime(l.at)} · {personLabel(l.who)}</span><p className="m-0 break-words">{l.text}</p>{l.hash && <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground"><span>Previous: <code>{l.prevHash === 'GENESIS' ? 'GENESIS' : l.prevHash?.slice(0, 8)}</code></span><span aria-hidden="true">→</span><span>This fingerprint: <code className="text-primary">{l.hash.slice(0, 8)}</code></span></div>}</li>)}</ol>}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-2 text-sm">
        <span className="text-muted-foreground">Acting as</span>
        {['Asha', 'Vikram'].map(n => <button key={n} type="button" onClick={() => { setActor(n); setError(''); }} className={`rounded-md px-3 py-1.5 font-medium ${actor === n ? 'bg-foreground text-background' : 'bg-background text-foreground border border-border'}`}>{personLabel(n)}</button>)}
      </div>

      {ap.status !== 'unpaid' && status === 'open' && <div className="rounded-lg border border-border border-l-4 border-l-[#C2410C] bg-[#FFF8F2] p-3 text-sm leading-6">
        <p className="m-0 text-[.7rem] font-semibold uppercase tracking-[.06em] text-[#C2410C]">Linked from Ten Today · sales approval check</p>
        {ap.status === 'covered' && <><p className="m-0 mt-1"><b>✓ {ap.approval.id}</b>: {ap.approval.approver} approved a {money(ap.approval.capBeforeGst)} discount before GST, valid to {fmtDate(ap.approval.validTo)}. With 18% GST it covers up to {money(ap.limit)}, so all {money(ap.short)} is approved.</p><Button type="button" size="sm" className="mt-2" onClick={() => fill('Scheme claim · approved in Ten Today', 'Asha', `Matched to ${ap.approval.id} in Ten Today: ${money(ap.approval.capBeforeGst)} + GST approved by ${ap.approval.approver}.`)}>Use this approval</Button></>}
        {ap.status === 'excess' && <><p className="m-0 mt-1"><b>{ap.approval.id}</b> covers {money(ap.limit)}. The extra {money(ap.excess)} was never approved, so it goes back to {ap.approval.rep}.</p><Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => fill('Scheme claim · not approved', 'Rahul', `${money(ap.limit)} covered by ${ap.approval.id}; ${money(ap.excess)} above the cap goes back to the rep.`)}>Send the extra to {ap.approval.rep}</Button></>}
        {ap.status === 'expired' && <><p className="m-0 mt-1"><b>{ap.approval.id}</b> expired on {fmtDate(ap.approval.validTo)}. Nothing clears; it goes to {ap.approval.approver}, who signed it.</p><Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => fill('Scheme claim · approval expired', 'Kavita', `Approval ${ap.approval.id} expired; sent to the approver.`)}>Send to {ap.approval.approver}</Button></>}
        {ap.status === 'none' && <><p className="m-0 mt-1"><b>✗ No approval in Ten Today</b> for {inv?.customer}. If this is a discount, nobody approved it, so it belongs to the sales rep who promised it, not finance.</p><Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => fill('Scheme claim · not approved', 'Rahul', 'No sales approval in Ten Today (verbal promise). Owned by the rep who made it.')}>Give it to the sales rep</Button></>}
        <a className="mt-2 block text-xs text-muted-foreground underline" href="https://tentoday.vercel.app/cockpit.html?km=1">See how an approval is made in Ten Today ↗</a>
      </div>}

      <div className="grid gap-3">
        <p className="m-0 text-sm font-semibold">Why is the money missing, and who owns it?</p>
        <label className="grid gap-1 text-sm">Reason
          <select className="er-input" value={reason} disabled={locked} onChange={ev => pickReason(ev.target.value)}>{reasonOptions.map(r => <option key={r}>{r}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Owner <span className="text-xs text-muted-foreground">Only people who handle "{reason}" are listed.</span>
          <select className="er-input" value={owner} disabled={locked} onChange={ev => setOwner(ev.target.value)}>
            <option value="">Choose an owner</option>
            {eligible.map(p => <option key={p.name} value={p.name}>{personLabel(p.name)}</option>)}
          </select></label>
        <label className="grid gap-1 text-sm">Evidence / decision note
          <textarea className="er-input" value={notes} disabled={locked} onChange={ev => setNotes(ev.target.value)} maxLength={2000} rows={3} placeholder="e.g. Approval APV-2026-031 attached; rep confirmed by email." /></label>
        {!locked && <Button type="button" variant="outline" disabled={!dirty} onClick={() => run(() => saveCase(w, caseId, { reason, owner, notes }, actor), `Saved: ${caseId} owned by ${owner ? personLabel(owner) : 'nobody yet'}.`)}>Save</Button>}
      </div>

      <div id="er-close-it" className="grid gap-2 rounded-lg border border-border p-3 text-sm">
        {done && <p role="status" className="m-0 rounded-md bg-[#ECFDF5] p-2 font-medium text-[#065F46]">{done}</p>}
        <p className="m-0 font-semibold">Close it</p>
        {status === 'resolved' && <p className="m-0 text-[#0F766E]"><b>✓ Resolved</b>{e?.approvedBy ? ` · approved by ${personLabel(e.approvedBy)} after ${personLabel(e.submittedBy ?? '')} submitted it` : ''}.</p>}
        {status === 'open' && owner && !financeOwns(owner) && <>
          <p className="m-0 rounded-md bg-[#FFFBEB] p-2 text-[#92400E]">With <b>{personLabel(owner)}</b>. Finance can't close this until {owner} acts and hands it back.</p>
          {(HANDBACKS[reason] ?? []).length === 0 ? <p className="m-0 text-muted-foreground">{owner} is collecting from the customer. The gap closes when the money lands in the bank and is matched.</p> : <>
            {owner === 'Rahul' && <a className="text-sm font-medium text-[#C2410C] underline" href={tenTodayTaskLink(caseId, inv?.customer ?? '', short, owner)} target="_blank" rel="noopener">Send it to {owner}'s Today in Ten Today ↗</a>}
            <p className="m-0 font-medium">Record what {owner} did:</p>
            <input className="er-input" value={did} onChange={ev => setDid(ev.target.value)} maxLength={200} placeholder={`e.g. ${owner} confirmed by email on 10 Nov`} />
            {(HANDBACKS[reason] ?? []).map((o, k) => <Button key={k} type="button" variant={k === 0 ? 'default' : 'outline'} onClick={() => { run(() => handBack(saveFirst(w), caseId, k, did), `${caseId}: ${o.label}. Now with ${personLabel(o.owner)}.`); if (did.trim()) { setNotes(n => `${n}\n${owner}: ${did.trim()}`.trim()); setReason(o.reason); setOwner(o.owner); setDid(''); setDone(`✓ ${o.label}. Now with ${personLabel(o.owner)}.`); } }}>{o.label} → {o.owner}</Button>)}
          </>}
        </>}
        {status === 'open' && (!owner || financeOwns(owner)) && !big && <><p className="m-0 text-muted-foreground">Under ₹10,000: the AR executive can close it alone, once it has an owner and a note.</p>
          <Button type="button" disabled={actor !== 'Asha'} onClick={() => run(() => resolveSmall(saveFirst(w), caseId, actor), `${caseId} resolved by ${actor}.`)}>Resolve</Button>
          {actor !== 'Asha' && <p className="m-0 text-xs text-muted-foreground">Switch to Asha: she owns the day-to-day closing.</p>}</>}
        {big && (status === 'pending' || (status === 'open' && (!owner || financeOwns(owner)))) && <>
          <p className="m-0 text-muted-foreground">Over ₹10,000, so two people are needed: <b>Asha submits</b> it, then <b>Vikram approves</b> it. Nobody approves their own submission.</p>
          <ol className="m-0 grid gap-1 pl-5">
            <li className={status === 'open' ? 'font-semibold' : 'text-muted-foreground'}>Asha submits for approval {status !== 'open' && '✓'}</li>
            <li className={status === 'pending' ? 'font-semibold' : 'text-muted-foreground'}>Vikram approves, or sends it back</li>
          </ol>
          {status === 'open' && <><Button type="button" disabled={actor !== 'Asha'} onClick={() => run(() => submitForApproval(saveFirst(w), caseId, actor), `${caseId} sent to Vikram for approval.`)}>Submit to Vikram for approval</Button>{actor !== 'Asha' && <p className="m-0 text-xs text-muted-foreground">Switch to Asha to submit.</p>}</>}
          {status === 'pending' && actor === 'Asha' && <p className="m-0 rounded-md bg-[#FFFBEB] p-2 text-[#92400E]">Waiting for Vikram. Asha submitted this, so she can't approve it. <button type="button" className="underline" onClick={() => setActor('Vikram')}>Switch to Vikram →</button></p>}
          {status === 'pending' && actor === 'Vikram' && <div className="grid gap-2">
            <Button type="button" onClick={() => run(() => approveCase(w, caseId, actor), `${caseId} approved by Vikram and resolved.`)}>Approve and resolve</Button>
            <input className="er-input" value={why} onChange={ev => setWhy(ev.target.value)} placeholder="Reason for sending back (optional)" maxLength={200} />
            <Button type="button" variant="outline" onClick={() => run(() => sendBack(w, caseId, actor, why), `${caseId} sent back to Asha.`)}>Send back to Asha</Button>
          </div>}
        </>}
      </div>

      {error && <p role="alert" className="m-0 rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}

      <p className="m-0 text-xs text-muted-foreground">Team: {PEOPLE.map(p => `${p.name} (${p.role})`).join(' · ')}</p>
    </DialogContent>
  </Dialog>;
}
