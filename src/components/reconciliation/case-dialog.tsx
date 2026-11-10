import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  APPROVAL_LIMIT, HANDBACKS, PEOPLE, financeOwns, handBack, REASONS, approvalCheck, approveCase, caseStatus, invoiceBalance, money, ownersFor, personLabel,
  resolveSmall, saveCase, sealLog, forceResealLog, inspectLogChain, verifyLogWithAnchor, tenTodayTaskLink, type SalesApproval, type LogEntry, type ChainNodeCheck, sendBack, submitForApproval, type Workspace as Data,
} from '@/lib/reconciliation/engine';

type Props = { w: Data; caseId: string | null; approvals?: SalesApproval[]; demo?: boolean; focusHistory?: boolean; onClose: () => void; change: (next: Data, message?: string) => void };
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export function CaseDialog({ w, caseId, approvals, demo = false, focusHistory = false, onClose, change: rawChange }: Props) {
  const historyRef = useRef<HTMLDivElement>(null);
  const change = (next: Data, msg?: string) => { void Promise.all(next.exceptions.map(async x => x.log ? { ...x, log: await sealLog(x.invoiceId, x.log) } : x)).then(exceptions => rawChange({ ...next, exceptions }, msg)); };
  const [check, setCheck] = useState<{ ok: boolean; text: string; brokenAt?: number; reason?: string; expectedAnchor?: string; actualAnchor?: string } | null>(null);
  const [chainNodes, setChainNodes] = useState<ChainNodeCheck[]>([]);
  const [anchorHash, setAnchorHash] = useState<string | undefined>(undefined);
  const [editingRow, setEditingRow] = useState(false);
  const [entryIndex, setEntryIndex] = useState(0);
  const [entryText, setEntryText] = useState('');
  const [originalTexts, setOriginalTexts] = useState<Record<number, string>>({});
  const [undoLog, setUndoLog] = useState<LogEntry[] | null>(null);
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
    setReason(e?.reason ?? 'Unexplained'); setOwner(e?.owner ?? ''); setNotes(e?.notes ?? ''); setError(''); setWhy(''); setDone(''); setCheck(null); setChainNodes([]); setAnchorHash(undefined); setEditingRow(false); setOriginalTexts({}); setUndoLog(null);
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!caseId || !demo) return;
    const cur = w.exceptions.find(x => x.invoiceId === caseId);
    if (cur && cur.log && cur.log.length > 0) return;
    const invObj = w.invoices.find(i => i.id === caseId);
    const shortAmt = invoiceBalance(w, caseId);
    const r = cur?.reason ?? 'Unexplained';
    const o = cur?.owner || (ownersFor(r)[0]?.name ?? 'Asha');
    const n = cur?.notes || `Initial triage for ${caseId}`;
    const seedEntries: LogEntry[] = [
      { at: '2026-10-26T09:15:00.000Z', who: 'Asha', text: `Detected ${money(shortAmt)} short-payment on ${caseId} (${invObj?.customer ?? 'Distributor'}).` },
      { at: '2026-10-26T09:18:00.000Z', who: 'Asha', text: `Classified reason as "${r}" and routed to ${personLabel(o)}.` },
      { at: '2026-10-26T09:22:00.000Z', who: o, text: `Recorded evidence note: ${n}` },
    ];
    void sealLog(caseId, seedEntries).then(sealed => {
      const nextExc = cur
        ? w.exceptions.map(x => x.invoiceId === caseId ? { ...x, log: sealed } : x)
        : [...w.exceptions, { invoiceId: caseId, reason: r, owner: o, notes: n, resolved: false, status: 'open' as const, log: sealed }];
      rawChange({ ...w, exceptions: nextExc });
    });
  }, [caseId, demo]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (e?.log?.some(l => !l.hash)) { change(w); return; }
    const head = e?.log?.at(-1)?.hash;
    if (head && !undoLog) setAnchorHash(head);
    if (caseId && e?.log?.length) {
      void inspectLogChain(caseId, e.log).then(setChainNodes);
    }
  }, [caseId, e?.log]); // eslint-disable-line react-hooks/exhaustive-deps
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
  const verify = async () => {
    const [r, nodes] = await Promise.all([verifyLogWithAnchor(caseId, log, anchorHash), inspectLogChain(caseId, log)]);
    setChainNodes(nodes);
    if (r.ok) {
      setCheck({ ok: true, text: `✓ All ${log.length} entries & controller anchor (${r.headHash.slice(0, 8)}…) verified intact` });
    } else if (r.reason === 'anchor_mismatch') {
      setCheck({ ok: false, brokenAt: r.brokenAt, reason: r.reason, expectedAnchor: r.expectedAnchor, actualAnchor: r.actualAnchor, text: `✗ Chain rewrite detected: internal links were re-sealed, but head hash (${r.actualAnchor?.slice(0, 8)}…) does not match the pinned Controller Anchor (${r.expectedAnchor?.slice(0, 8)}…)` });
    } else if (r.reason === 'link_broken') {
      setCheck({ ok: false, brokenAt: r.brokenAt, reason: r.reason, text: `✗ Missing entry detected before Entry ${r.brokenAt + 1}: stored prevHash does not match previous entry's fingerprint` });
    } else {
      setCheck({ ok: false, brokenAt: r.brokenAt, reason: r.reason, text: `✗ Entry ${r.brokenAt + 1} was changed after it was recorded (recomputed SHA-256 mismatch)` });
    }
  };
  const openTamper = () => {
    if (!demo || !log.length) return;
    setEntryIndex(0); setEntryText(log[0]?.text ?? ''); setEditingRow(true);
  };
  const tamper = () => {
    const original = log[entryIndex];
    if (!demo || !original || original.text === entryText) return;
    if (!anchorHash && log.at(-1)?.hash) setAnchorHash(log.at(-1)!.hash);
    setOriginalTexts(previous => ({ ...previous, [entryIndex]: previous[entryIndex] ?? original.text }));
    setUndoLog(undoLog ?? log);
    rawChange({ ...w, exceptions: w.exceptions.map(x => x.invoiceId === caseId ? {
      ...x, log: log.map((l, k) => k === entryIndex ? { ...l, text: entryText } : l),
    } : x) }, 'Demo only: stored text changed without a new fingerprint.');
    setEditingRow(false); setCheck(null);
  };
  const tamperDeleteMiddle = () => {
    if (!demo || log.length < 2) return;
    const delIdx = Math.min(1, log.length - 1);
    if (!anchorHash && log.at(-1)?.hash) setAnchorHash(log.at(-1)!.hash);
    setUndoLog(undoLog ?? log);
    rawChange({ ...w, exceptions: w.exceptions.map(x => x.invoiceId === caseId ? {
      ...x, log: log.filter((_, k) => k !== delIdx),
    } : x) }, `Demo only: deleted Entry ${delIdx + 1} directly from storage.`);
    setEditingRow(false); setCheck(null);
  };
  const tamperAndResealAll = async () => {
    const original = log[entryIndex];
    if (!demo || !original) return;
    const mutatedText = entryText !== original.text ? entryText : `${original.text} (silently altered ₹1,180 -> ₹11,800)`;
    if (!anchorHash && log.at(-1)?.hash) setAnchorHash(log.at(-1)!.hash);
    setOriginalTexts(previous => ({ ...previous, [entryIndex]: previous[entryIndex] ?? original.text }));
    setUndoLog(undoLog ?? log);
    const resealed = await forceResealLog(caseId, log.map((l, k) => k === entryIndex ? { ...l, text: mutatedText } : l));
    rawChange({ ...w, exceptions: w.exceptions.map(x => x.invoiceId === caseId ? { ...x, log: resealed } : x) }, 'Demo only: DBA altered row AND recalculated every SHA-256 hash.');
    setEditingRow(false); setCheck(null);
  };
  const undoTamper = () => {
    if (!demo || !undoLog) return;
    rawChange({ ...w, exceptions: w.exceptions.map(x => x.invoiceId === caseId ? { ...x, log: undoLog } : x) });
    setUndoLog(null); setOriginalTexts({}); setCheck(null);
  };
  const liveEditEntry = (idx: number, newText: string) => {
    const original = log[idx];
    if (!demo || !original) return;
    if (!anchorHash && log.at(-1)?.hash) setAnchorHash(log.at(-1)!.hash);
    setOriginalTexts(previous => ({ ...previous, [idx]: previous[idx] ?? original.text }));
    if (!undoLog) setUndoLog(log);
    rawChange({ ...w, exceptions: w.exceptions.map(x => x.invoiceId === caseId ? {
      ...x, log: log.map((l, k) => k === idx ? { ...l, text: newText } : l),
    } : x) });
  };
  const inv = w.invoices.find(i => i.id === caseId);
  const short = invoiceBalance(w, caseId);
  const big = short > APPROVAL_LIMIT;
  const status = caseStatus(w, caseId);
  const eligible = ownersFor(reason);
  const reasonOptions = REASONS.includes(reason as (typeof REASONS)[number]) ? [...REASONS] : [reason, ...REASONS];
  const dirty = !e || e.reason !== reason || e.owner !== owner || e.notes !== notes;
  const run = (fn: () => Data, msg: string) => { try { setError(''); setDone(''); change(fn(), msg); } catch (err) { setError(err instanceof Error ? err.message : 'Action failed.'); } };
  const saveFirst = (base: Data) => (dirty ? saveCase(base, caseId, { reason, owner, notes }, actor) : base);
  const pickReason = (r: string) => { setReason(r); const o = ownersFor(r); setOwner(o.length === 1 ? (o[0]?.name ?? '') : o.some(p => p.name === owner) ? owner : ''); };
  const ap = approvalCheck(w, caseId, approvals);
  const fill = (r: string, o: string, n: string) => {
    setReason(r); setOwner(o); setNotes(n);
    try { setError(''); change(saveCase(w, caseId, { reason: r, owner: o, notes: n }, actor), `Saved: ${caseId} owned by ${personLabel(o)}.`); setDone(financeOwns(o) ? `✓ Saved. Owner is now ${personLabel(o)}. Next step: close it below.` : `✓ Saved. It's now with ${personLabel(o)}. Finance can't close it until ${o} acts (below).`); setTimeout(() => document.getElementById('er-close-it')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }
    catch (err) { setError(err instanceof Error ? err.message : 'Action failed.'); }
  };
  const locked = status !== 'open';
  const isSchemeReason = reason.startsWith('Scheme claim') || reason === 'Unexplained';
  const activeBrokenAt = check && !check.ok ? check.brokenAt : undefined;

  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="er-app max-h-[92vh] sm:max-w-2xl overflow-y-auto">
      <DialogTitle>{caseId} · {inv?.customer} · {money(short)} short</DialogTitle>
      <DialogDescription>Every short-payment gets a reason, a role-locked owner, and a SHA-256 sealed audit trail.</DialogDescription>

      <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs leading-5">
        <p className="m-0 font-semibold text-foreground">How this workflow works (why Asha, Rahul, Kavita &amp; Vikram exist):</p>
        <ol className="m-0 mt-1.5 grid gap-1.5 pl-4 text-muted-foreground sm:grid-cols-3 sm:pl-0 sm:list-none">
          <li className="rounded-md border border-border/70 bg-background p-2"><b className="text-foreground">1. Domain Owner by Reason:</b><br />• <b>Asha (AR Exec):</b> Tax (TDS) &amp; approved schemes<br />• <b>Rahul (Sales Rep):</b> Unapproved discounts<br />• <b>Kavita (Sales Mgr):</b> Expired approvals<br />• <b>Priya (Warehouse):</b> Damage claims</li>
          <li className="rounded-md border border-border/70 bg-background p-2"><b className="text-foreground">2. Finance Maker (Asha):</b><br />Once the domain owner verifies &amp; hands back to Finance, <b>Asha</b> resolves gaps <b>≤ ₹10,000</b> alone, or submits <b>&gt; ₹10,000</b> for 2nd sign-off.</li>
          <li className="rounded-md border border-border/70 bg-background p-2"><b className="text-foreground">3. Controller Checker (Vikram):</b><br />Gaps <b>&gt; ₹10,000 (BR-5)</b> require <b>Vikram</b> to approve. Asha is blocked from approving her own submission.</li>
        </ol>
        <p className="m-0 mt-2 rounded-md bg-primary/10 px-2.5 py-1.5 font-medium text-foreground">
          <b>Right now on {caseId} ({money(short)}):</b> {status === 'resolved' ? 'This case is resolved and locked.' : status === 'pending' ? 'Submitted by Asha (>₹10,000). Switch "Acting as" to Vikram below to approve or send back.' : owner && !financeOwns(owner) ? `Owned by ${personLabel(owner)}. Finance (Asha) is locked out until ${owner} records their action and hands it back below.` : big ? 'Owned by Finance (Asha) and >₹10,000: Asha must submit it first, then switch to Vikram to approve.' : 'Under ₹10,000 and with Finance: Asha can resolve this directly once a reason, owner, and note are set.'}
        </p>
      </div>

      <div ref={historyRef} className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5]/60 p-4 text-sm shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-bold text-foreground">🔒 Sealed case record</span>
            <span className="text-muted-foreground">· one record for the whole team · {log.length} blocks</span>
          </div>
          {log.length > 0 && <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={verify} className="rounded-lg bg-[#059669] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#047857]">Verify record</button>
            {demo && <button type="button" onClick={openTamper} className="rounded-lg border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40">Try tampering yourself</button>}
            {demo && undoLog && <button type="button" onClick={undoTamper} className="rounded-lg border border-[#059669]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#059669] hover:bg-[#ECFDF5]">↺ Restore original</button>}
          </div>}
        </div>

        {log.length === 0 ? <p className="m-0 mt-2 text-xs text-muted-foreground">No actions yet.</p> :
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            {log.map((l, k) => {
              const node = chainNodes[k];
              const edited = activeBrokenAt !== undefined && k === activeBrokenAt;
              const later = activeBrokenAt !== undefined && k > activeBrokenAt;
              return <div key={k} className="flex flex-1 items-center gap-2">
                <div className={`flex h-full w-full flex-col justify-between rounded-xl border p-3 text-xs shadow-2xs transition ${edited ? 'border-destructive bg-destructive/5 ring-2 ring-destructive/20' : later ? 'border-[#D97706] bg-[#FFFBEB]' : 'border-border bg-white'}`}>
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[.7rem] text-muted-foreground">
                      <span>#{k + 1} · {l.who}</span>
                      {edited && <span className="rounded bg-destructive px-1.5 py-0.5 text-[.65rem] font-bold text-white">✗ TAMPERED</span>}
                      {later && <span className="rounded bg-[#D97706] px-1.5 py-0.5 text-[.65rem] font-bold text-white">⚠ INVALIDATED</span>}
                    </div>
                    <p className="m-0 mt-1.5 break-words text-xs leading-5 font-medium text-foreground">{l.text}</p>
                    {edited && originalTexts[k] !== undefined && <p className="m-0 mt-1 break-words text-[.7rem] text-destructive">Was: "{originalTexts[k]}"</p>}
                  </div>
                  {l.hash && <div className="mt-2.5 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <code className={`rounded px-1.5 py-0.5 font-mono text-[.72rem] font-bold ${edited ? 'bg-destructive/15 text-destructive line-through' : 'bg-muted text-foreground'}`}>{l.hash.slice(0, 8)}</code>
                      {edited && node && <code className="rounded bg-destructive px-1.5 py-0.5 font-mono text-[.72rem] font-bold text-white">≠ {node.recomputedHash.slice(0, 8)}</code>}
                    </div>
                    <p className="m-0 mt-1 text-[.68rem] text-muted-foreground">
                      {k === 0 ? 'first block' : <>built from #{k}'s <code className="rounded bg-muted px-1 py-0.5 font-mono text-[.66rem]">{l.prevHash?.slice(0, 6)}</code></>}
                    </p>
                  </div>}
                </div>
                {k < log.length - 1 && <span aria-hidden="true" className={`hidden font-bold sm:inline ${activeBrokenAt !== undefined && k >= activeBrokenAt ? 'text-destructive' : 'text-[#059669]'}`}>→</span>}
              </div>;
            })}
          </div>}

        {demo && editingRow && <section aria-label="Raw database row editor" className="mt-3.5 rounded-xl bg-[#141413] p-4 text-xs text-[#E7E5E4] shadow-md">
          <p className="m-0 text-[.7rem] font-bold uppercase tracking-wider text-[#F97316]">⚠ OUTSIDE THE APP · RAW DATABASE ROW</p>
          <p className="m-0 mt-1.5 leading-5 text-[#D6D3D1]">The app has no edit button for this record. An insider with database access could change a stored row directly, like this. No new fingerprint is made, because that only happens when a decision goes through the app.</p>
          <label className="mt-3 block font-semibold text-white">Block
            <select className="mt-1 block w-44 rounded-lg border border-[#44403C] bg-[#1C1917] px-2.5 py-1.5 text-xs font-medium text-white" value={entryIndex} onChange={ev => { const i = Number(ev.target.value); setEntryIndex(i); setEntryText(log[i]?.text ?? ''); }}>
              {log.map((l, i) => <option key={i} value={i}>#{i + 1} · {l.who}</option>)}
            </select>
          </label>
          <label className="mt-2.5 block font-semibold text-white">text
            <textarea className="mt-1 block w-full rounded-lg border border-[#44403C] bg-[#1C1917] p-2.5 font-mono text-xs text-white focus:border-[#F97316] focus:outline-none" rows={2} maxLength={300} value={entryText} onChange={ev => setEntryText(ev.target.value)} />
          </label>
          <p className="m-0 mt-2 font-mono text-[.7rem] text-[#A8A29E]">
            who: {log[entryIndex]?.who} · at: {log[entryIndex]?.at} · stored fingerprint: {log[entryIndex]?.hash?.slice(0, 16)}…
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" disabled={entryText === log[entryIndex]?.text} onClick={tamper} className="rounded-lg bg-[#C2410C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#9A3412] disabled:opacity-50">Save to database</button>
            <button type="button" onClick={() => setEditingRow(false)} className="rounded-lg border border-[#44403C] bg-transparent px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#292524]">Cancel</button>
          </div>
        </section>}

        <p role="status" className={`m-0 mt-2.5 text-xs ${check ? (check.ok ? 'font-semibold text-[#065F46]' : 'font-semibold text-destructive') : 'text-muted-foreground'}`}>
          {check ? check.text : <>Not checked in this view yet. Press <b>Verify record</b> to recompute every fingerprint.</>}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-2 text-sm">
        <span className="text-muted-foreground">Acting as</span>
        {['Asha', 'Vikram'].map(n => <button key={n} type="button" onClick={() => { setActor(n); setError(''); }} className={`rounded-md px-3 py-1.5 font-medium ${actor === n ? 'bg-foreground text-background' : 'bg-background text-foreground border border-border'}`}>{personLabel(n)}</button>)}
      </div>

      {ap.status !== 'unpaid' && status === 'open' && (isSchemeReason ? <div className="rounded-lg border border-border border-l-4 border-l-[#C2410C] bg-[#FFF8F2] p-3 text-sm leading-6">
        <p className="m-0 text-[.7rem] font-semibold uppercase tracking-[.06em] text-[#C2410C]">Linked from Ten Today · sales approval check</p>
        {ap.status === 'covered' && <><p className="m-0 mt-1"><b>✓ {ap.approval.id}</b>: {ap.approval.approver} approved a {money(ap.approval.capBeforeGst)} discount before GST, valid to {fmtDate(ap.approval.validTo)}. With 18% GST it covers up to {money(ap.limit)}, so all {money(ap.short)} is approved.</p><Button type="button" size="sm" className="mt-2" onClick={() => fill('Scheme claim · approved in Ten Today', 'Asha', `Matched to ${ap.approval.id} in Ten Today: ${money(ap.approval.capBeforeGst)} + GST approved by ${ap.approval.approver}.`)}>Use this approval</Button></>}
        {ap.status === 'excess' && <><p className="m-0 mt-1"><b>{ap.approval.id}</b> covers {money(ap.limit)}. The extra {money(ap.excess)} was never approved, so it goes back to {ap.approval.rep}.</p><Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => fill('Scheme claim · not approved', 'Rahul', `${money(ap.limit)} covered by ${ap.approval.id}; ${money(ap.excess)} above the cap goes back to the rep.`)}>Send the extra to {ap.approval.rep}</Button></>}
        {ap.status === 'expired' && <><p className="m-0 mt-1"><b>{ap.approval.id}</b> expired on {fmtDate(ap.approval.validTo)}. Nothing clears; it goes to {ap.approval.approver}, who signed it.</p><Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => fill('Scheme claim · approval expired', 'Kavita', `Approval ${ap.approval.id} expired; sent to the approver.`)}>Send to {ap.approval.approver}</Button></>}
        {ap.status === 'none' && <><p className="m-0 mt-1"><b>✗ No approval in Ten Today</b> for {inv?.customer}. If this is a discount, nobody approved it, so it belongs to the sales rep who promised it, not finance.</p><Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => fill('Scheme claim · not approved', 'Rahul', 'No sales approval in Ten Today (verbal promise). Owned by the rep who made it.')}>Give it to the sales rep</Button></>}
        <a className="mt-2 block text-xs text-muted-foreground underline" href="https://tentoday.vercel.app/cockpit.html?km=1">See how an approval is made in Ten Today ↗</a>
      </div> : <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <b>Ten Today sales-approval check skipped:</b> This gap is classified as <b>{reason}</b> (handled by <b>{personLabel(owner || (eligible[0]?.name ?? 'Asha'))}</b>), not a sales discount claim.
      </div>)}

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
