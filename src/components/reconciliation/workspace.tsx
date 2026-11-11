import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Download, Upload, RotateCcw, Save, Check, Search, Trash2, Wallet, GitMerge, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tour, type TourStep } from './tour';
import { PresentationHeader, NumbersBand, DesignDecisions, AuditFraming } from './presentation';
import { computePresentationNumbers } from '@/lib/reconciliation/presentation';
import { RuleChangeRequest } from './rule-change';
import { CaseDialog } from './case-dialog';
import { ServiceNowModal, type ServiceNowTicket } from './servicenow-modal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { checkTenTodaySeal, readTenTodayApproval, salesApprovals, benchmarkApprovals, benchmarkWorkspace, computeDeskImpact, type SalesApproval, type LogEntry, type ChainNodeCheck, allocate, approvalCheck, autoMatch, caseStatus, emptyWorkspace, personLabel, importCsv, invoiceBalance, money, parseMoney, receiptBalance, saveCase, sealLog, forceResealLog, inspectLogChain, verifyLogWithAnchor, validateWorkspace, type Workspace as Data } from '@/lib/reconciliation/engine';

type Props = { initial: Data; demo?: boolean; onSave?: (data: Data) => Promise<void>; onSignOut?: () => Promise<void> };
function download(filename: string, text: string) { const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
export function Workspace({ initial, demo = false, onSave, onSignOut }: Props) {
  const routeSearch = useSearch({ strict: false });
  const [handoff, setHandoff] = useState<{ approval?: SalesApproval; error?: string; seal?: 'match' | 'mismatch' | 'none' } | null>(null);
  const [batchMode, setBatchMode] = useState<'starter' | 'benchmark'>('starter');
  useEffect(() => { const t = new URLSearchParams(window.location.search).get('apv'); if (!t) return; try { const approval = readTenTodayApproval(t); setHandoff({ approval }); void checkTenTodaySeal(t).then(seal => setHandoff(h => (h?.approval ? { ...h, seal } : h))); } catch (err) { setHandoff({ error: err instanceof Error ? err.message : 'Invalid approval link.' }); } }, []);
  const baseApprovals = batchMode === 'benchmark' ? benchmarkApprovals() : salesApprovals();
  const approvals = handoff?.approval ? [handoff.approval, ...baseApprovals.filter(a => a.customer !== handoff.approval?.customer)] : baseApprovals;
  const [w, setW] = useState(initial); const [tab, setTab] = useState<'reconcile' | 'exceptions'>('reconcile');
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('all'); const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [dirty, setDirty] = useState(false); const [saving, setSaving] = useState(false);
  const [importKind, setImportKind] = useState<'invoices' | 'receipts' | null>(null); const fileRef = useRef<HTMLInputElement>(null);
  const [receipt, setReceipt] = useState(''); const [invoice, setInvoice] = useState(''); const [amount, setAmount] = useState(''); const [manual, setManual] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [snCaseId, setSnCaseId] = useState<string | null>(null);
  const [snShowConfig, setSnShowConfig] = useState(false);
  const [snInstanceUrl, setSnInstanceUrl] = useState('https://dev214912.service-now.com');
  const [snEmail, setSnEmail] = useState('admin@corp.finance.internal');
  const [snToken, setSnToken] = useState('••••••••••••');
  const [snPingStatus, setSnPingStatus] = useState<string | null>(null); const [reason, setReason] = useState(''); const [owner, setOwner] = useState(''); const [notes, setNotes] = useState(''); const [resolved, setResolved] = useState(false);
  const [reset, setReset] = useState(false);
  const [focusHistory, setFocusHistory] = useState(false);
  const [openingHistory, setOpeningHistory] = useState(false);
  const [proofTab, setProofTab] = useState<'record' | 'servicenow' | 'impact'>('record');
  const proofRef = useRef<HTMLElement>(null);
  function openProof(next: 'record' | 'servicenow' | 'impact') { setProofTab(next); setTimeout(() => proofRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); }
  const [tour, setTour] = useState<number | null>(null);
  const deskAnchor = useRef<{ hash: string; count: number } | null>(null);
  const [deskAdminRewrite, setDeskAdminRewrite] = useState(false);
  const [deskBlocks, setDeskBlocks] = useState<LogEntry[]>([]);
  const [deskNodes, setDeskNodes] = useState<ChainNodeCheck[]>([]);
  const [deskCheck, setDeskCheck] = useState<{ ok: boolean; text: string; brokenAt?: number; anchorMismatch?: boolean } | null>(null);
  const [deskEditing, setDeskEditing] = useState(false);
  const [deskBlockIdx, setDeskBlockIdx] = useState(0);
  const [deskBlockText, setDeskBlockText] = useState('');
  const [deskUndo, setDeskUndo] = useState<LogEntry[] | null>(null);
  const [deskOrig, setDeskOrig] = useState<Record<number, string>>({});
  const deskChainRef = useRef<HTMLElement>(null);
  const openedHistoryLink = useRef(false);
  useEffect(() => {
    if (!demo || deskBlocks.length > 0) return;
    const seed: LogEntry[] = [
      { at: '2026-10-26T09:15:12.000Z', who: 'Asha', text: 'Matched APV-2026-031 (₹1,000 + 18% GST) for Aarav Distributors (INV-101), routed to Asha' },
      { at: '2026-10-26T09:18:44.000Z', who: 'Asha', text: 'Flagged ₹12,400 unapproved discount for Meera Trading (INV-102), routed to Rahul' },
      { at: '2026-10-26T09:22:05.000Z', who: 'System', text: 'Held ₹28,350 unreferenced receipt (UTR-003) for Southern Stores; blocked auto-write-off' },
    ];
    void sealLog('DESK-RECORD', seed).then(sealed => {
      deskAnchor.current = { hash: sealed.at(-1)?.hash ?? 'GENESIS', count: sealed.length };
      setDeskBlocks(sealed);
      setDeskBlockText(sealed[0]?.text ?? '');
      void inspectLogChain('DESK-RECORD', sealed).then(setDeskNodes);
    });
  }, [demo, deskBlocks.length]);
  const verifyDeskRecord = async (blocks = deskBlocks) => {
    const [r, nodes] = await Promise.all([verifyLogWithAnchor('DESK-RECORD', blocks, deskAnchor.current?.hash, deskAnchor.current?.count), inspectLogChain('DESK-RECORD', blocks)]);
    setDeskNodes(nodes);
    if (r.ok) setDeskCheck({ ok: true, text: `✓ All ${blocks.length} blocks verified: every stored SHA-256 fingerprint matches its recomputed hash and upstream link.` });
    else if (r.reason === 'anchor_mismatch') setDeskCheck({ ok: false, anchorMismatch: true, text: '✗ Whole chain rewritten: no longer matches the anchor shared with the auditor. (Simulated sharing)' });
    else setDeskCheck({ ok: false, brokenAt: r.brokenAt, text: `✗ Tamper detected at Block #${r.brokenAt + 1}: stored fingerprint (${blocks[r.brokenAt]?.hash?.slice(0, 8)}) ≠ recomputed SHA-256 (${nodes[r.brokenAt]?.recomputedHash.slice(0, 8)}).${r.brokenAt < blocks.length - 1 ? ` Downstream blocks #${r.brokenAt + 2}..#${blocks.length} cascade-invalidated.` : ''}` });
  };
  const saveDeskTamper = async () => {
    const orig = deskBlocks[deskBlockIdx];
    if (!orig || orig.text === deskBlockText) return;
    setDeskOrig(prev => ({ ...prev, [deskBlockIdx]: prev[deskBlockIdx] ?? orig.text }));
    if (!deskUndo) setDeskUndo(deskBlocks);
    const edited = deskBlocks.map((b, i) => i === deskBlockIdx ? { ...b, text: deskBlockText } : b);
    const next = deskAdminRewrite ? await forceResealLog('DESK-RECORD', edited) : edited;
    setDeskBlocks(next);
    setDeskEditing(false);
    setDeskCheck(null);
  };
  const restoreDeskRecord = async () => {
    if (!deskUndo) return;
    setDeskBlocks(deskUndo);
    const nodes = await inspectLogChain('DESK-RECORD', deskUndo);
    setDeskNodes(nodes);
    setDeskUndo(null);
    setDeskOrig({});
    setDeskCheck({ ok: true, text: `✓ Original sealed record restored (${deskUndo.length}/${deskUndo.length} blocks intact).` });
  };
  useEffect(() => {
    if (!demo || openedHistoryLink.current || routeSearch.history !== '1') return;
    openedHistoryLink.current = true;
    setProofTab('record');
    setDeskEditing(true);
    setDeskBlockIdx(0);
    setTimeout(() => deskChainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  }, [demo, routeSearch.history]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (demo && new URLSearchParams(window.location.search).get('tour') === '1') setTour(0); }, [demo]);
  const tourSteps: TourStep[] = [
    { target: 'numbers', title: 'Meet a small business', text: 'It sent 4 bills totalling ₹1,91,300 and received 4 payments totalling ₹1,73,710. The difference is ₹17,590. Our job: check which bills were paid.' },
    { target: 'automatch', title: 'Pair payments with bills', text: 'Most payments mention a bill number. The desk uses it to pair them, exactly, never by guessing.', cta: 'Auto-match for me', run: () => { setTab('reconcile'); change(autoMatch(w), 'Payments paired with their bills.'); } },
    { target: 'invoices', title: 'Spot the short payments', text: 'Look at Status. Paid means the full amount came in. Partial means the customer paid less: Aarav is ₹1,180 short, Eastern is ₹860 short, and Meera is ₹12,400 short.' },
    { target: 'receipts', title: 'A payment with no bill number', text: 'The ₹28,350 payment named no bill, so it stays unreferenced and Southern Stores’ ₹31,500 bill stays unpaid. In this sample, you can confirm the pairing by hand; that leaves ₹3,150 short.', cta: 'Pair it for me', run: () => action(() => change(allocate(w, 'UTR-003', 'INV-103', 2835000), 'UTR-003 paired with INV-103.')) },
    { target: 'tabs', title: 'Explain every missing rupee', text: 'Short bills land in "Gaps to explain". Give the unapproved Meera deduction to Rahul in Sales, with the existing 3-day review deadline. Nothing is quietly written off.', cta: 'Assign to Sales', run: () => { const next = saveCase(w, 'INV-102', { reason: 'Scheme claim · not approved', owner: 'Rahul', notes: 'No approved budget attached. Sales review due within 3 days (BR-8).' }, 'Asha'); change(next, 'Meera deduction assigned to Rahul in Sales.'); setTab('exceptions'); } },
    { target: 'totals', title: 'That is reconciliation', text: 'Once all payments are paired, ₹1,73,710 is matched against ₹1,91,300 billed, leaving ₹17,590 still owed. Open a case with Review to record a decision. For gaps above ₹10,000, a second person must approve.' },
    { target: 'record', title: 'Check the sealed record', text: 'Each recorded action links to the previous fingerprint. Verify the record, or try editing a stored row to see a broken link.' },
    { target: 'servicenow', title: 'Escalate a disputed gap', text: 'These sample ServiceNow tickets show the Table API format, evidence and approval gates. No ticket is sent to an external service.' },
    { target: 'numbers', title: 'Every missing rupee has a next step', text: `${money(computePresentationNumbers(w, approvals).salesOwnedPaise)} that would have been written off is now owned by Sales, with a deadline. Silent write-offs: ₹0.`, outcome: true },
  ];
  useEffect(() => {
    const target = tour === null ? undefined : tourSteps[tour]?.target;
    if (target === 'record' || target === 'servicenow' || target === 'impact') setProofTab(target);
    if (target === 'receipts' || target === 'invoices') setTab('reconcile');
  }, [tour]);
  function change(next: Data, message?: string) { const checked = validateWorkspace(next); const prev = w; setW(checked); setDirty(true); setError(''); setNotice(''); if (message) toast.success(message, { action: { label: 'Undo', onClick: () => setW(prev) } }); }
  function action(fn: () => void) { try { setError(''); fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Action failed.'); } }
  function openCase(id: string) { setFocusHistory(false); const e = w.exceptions.find(e => e.invoiceId === id); setCaseId(id); setReason(e?.reason ?? 'Unexplained'); setOwner(e?.owner ?? ''); setNotes(e?.notes ?? ''); setResolved(e?.resolved ?? false); setError(''); }
  async function openSampleHistory() {
    if (!demo || openingHistory) return;
    setOpeningHistory(true); setTour(null);
    try {
      let next = autoMatch(w);
      const entry = next.exceptions.find(e => e.invoiceId === 'INV-101');
      if (!entry?.log?.length) next = saveCase(next, 'INV-101', {
        reason: entry?.reason ?? 'Scheme claim · approved in Ten Today', owner: entry?.owner || 'Asha',
        notes: entry?.notes ?? 'Sample action for the hash-chain history check.',
      }, 'Asha');
      const exceptions = await Promise.all(next.exceptions.map(async e => {
        if (e.invoiceId !== 'INV-101') return e;
        let log = await sealLog(e.invoiceId, e.log ?? []);
        const sampleActions = [
          { who: 'Asha', text: 'Set the scheme-claim reason and assigned Asha as owner.' },
          { who: 'Asha', text: 'Added evidence note: approval APV-2026-031 covers the ₹1,180 scheme claim.' },
          { who: 'Asha', text: 'Submitted the sample decision to Vikram for review.' },
          { who: 'Vikram', text: 'Approved the sample decision after reviewing the evidence.' },
        ];
        for (let i = log.length; i < sampleActions.length; i++) {
          const action = sampleActions[i];
          if (action) log = await sealLog(e.invoiceId, [...log, { ...action, at: new Date().toISOString() }]);
        }
        return { ...e, log };
      }));
      change({ ...next, exceptions }); setTab('exceptions'); setFocusHistory(true); setCaseId('INV-101');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not open sample history.'); }
    finally { setOpeningHistory(false); }
  }
  const billed = w.invoices.reduce((s, i) => s + i.amount, 0); const received = w.receipts.reduce((s, r) => s + r.amount, 0); const matched = w.allocations.reduce((s, a) => s + a.amount, 0);
  const invoices = w.invoices.filter(i => `${i.id} ${i.customer}`.toLowerCase().includes(search.toLowerCase())).filter(i => filter === 'all' || (filter === 'outstanding' ? invoiceBalance(w, i.id) > 0 : invoiceBalance(w, i.id) === 0));
  const cases = invoices.filter(i => invoiceBalance(w, i.id) > 0);
  const receiptOptions = w.receipts.filter(r => receiptBalance(w, r.id) > 0);
  const sampleImpact = computeDeskImpact(autoMatch(benchmarkWorkspace()), benchmarkApprovals());
  const impactHours = (sampleImpact.manualMinutesSaved / 60).toFixed(1);
  const evaluated = w;
  const currentImpact = computeDeskImpact(evaluated, approvals);
  function toggleBatch() {
    if (batchMode === 'starter') { setBatchMode('benchmark'); change(autoMatch(benchmarkWorkspace()), 'Loaded and auto-matched the 25-bill sample.'); }
    else { setBatchMode('starter'); change(initial, 'Restored the 4-bill sample.'); }
  }
  useEffect(() => { const query = new URLSearchParams(window.location.search); if (demo && query.get('batch') === '25') { setBatchMode('benchmark'); setW(autoMatch(benchmarkWorkspace())); } if (demo && query.get('export') === '1') download('everyrupee-workspace.json', JSON.stringify(initial, null, 2)); }, [demo, initial]);
  const escalations = evaluated.invoices.filter(i => invoiceBalance(evaluated, i.id) > 0 && !['covered', 'paid'].includes(approvalCheck(evaluated, i.id, approvals).status)).length;
  return <div className={`er-app ${demo ? 'er-receivables-demo' : 'min-h-screen'} bg-background text-foreground`}>
    {demo ? <PresentationHeader onTour={() => { setTour(0); setBatchMode('starter'); setW(initial); }} onBatch={toggleBatch} benchmark={batchMode === 'benchmark'} onReset={() => setReset(true)} onExport={() => download('everyrupee-workspace.json', JSON.stringify(w, null, 2))} /> : <header className="border-b border-border bg-card px-4 py-3"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link to="/">Every Rupee</Link><Button variant="outline" onClick={onSignOut}>Sign out</Button></div></header>}
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8">
      {handoff && <div role="status" className={`mb-5 rounded-xl border p-4 text-sm leading-6 ${handoff.error ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-[#FED7AA] border-l-4 border-l-[#C2410C] bg-[#FFF8F2]'}`}>
        {handoff.error ? <><b>Approval from Ten Today rejected.</b> {handoff.error}</> : (() => { const a = handoff.approval; if (!a) return null; const inv = w.invoices.find(i => i.customer === a.customer); return <><p className="m-0 text-[.7rem] font-semibold uppercase tracking-[.06em] text-[#C2410C]">Received from Ten Today · handoff contract v1</p>
          <p className="m-0 mt-1"><b>{a.id}</b>: {a.approver} approved <b>{a.capPct}% before GST</b> for {a.customer}, asked by {a.rep}, valid to {a.validTo}. It replaces any older approval for this customer.</p>
          {handoff.seal === 'match' && <p className="m-0 mt-1 font-medium text-[#065F46]">🔒 Fingerprint checked: these are exactly the fields Ten Today sealed. Nothing was edited on the way.</p>}
          {handoff.seal === 'mismatch' && <p className="m-0 mt-1 font-medium text-destructive">✗ Fingerprint mismatch: this link was edited after Ten Today sealed it. Don't rely on this approval; ask sales to send it again.</p>}
          {inv ? <Button size="sm" className="mt-2" onClick={() => { const base = w.allocations.length ? w : autoMatch(w); if (base !== w) change(base, 'Payments matched to bills.'); setTab('exceptions'); setCaseId(inv.id); }}>Check {inv.id} against this approval</Button> : <p className="m-0 mt-1 text-muted-foreground">No bill for {a.customer} in this sample, so there is nothing to check yet.</p>}</>; })()}
      </div>}
      {!demo && <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Reconciliation desk</h1><Button disabled={!dirty || saving} onClick={async () => { if (!onSave) return; setSaving(true); setError(''); try { await onSave(w); setDirty(false); toast.success('Saved. Your records are up to date.'); } catch (e) { setError(e instanceof Error ? e.message : 'Save failed.'); } finally { setSaving(false); } }}><Save />{saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</Button><Button variant="outline" onClick={() => setReset(true)}>Clear workspace</Button></div>}
      {demo && <div aria-label="Desk summary" className="mt-3 flex flex-wrap items-center gap-x-1 text-xs">
        <Button variant="ghost" size="sm" className={`h-auto px-1 py-1 text-xs ${deskCheck?.ok === false ? 'text-destructive' : 'text-money-ok'}`} onClick={() => openProof('record')}>🔒 Record {deskCheck?.ok === false ? 'altered' : 'intact'} · {deskBlocks.length} blocks</Button><span>·</span>
        <Button variant="ghost" size="sm" className="h-auto px-1 py-1 text-xs" onClick={() => openProof('servicenow')}>⚡ {escalations} escalations</Button><span>·</span>
        <Button variant="ghost" size="sm" className="h-auto px-1 py-1 text-xs" onClick={() => openProof('impact')}>~{impactHours} h saved per {sampleImpact.totalBills} bills</Button>
      </div>}
      {(() => { const owned = cases.length === 0 || cases.every(i => w.exceptions.find(e => e.invoiceId === i.id)?.owner); const closed = cases.every(i => caseStatus(w, i.id) === 'resolved'); const s1 = w.allocations.length > 0; const cur = !s1 ? 1 : !owned ? 2 : !closed ? 3 : 0;
  const steps: [number, string, string, string, boolean][] = [
    [1, 'Match payments to bills', s1 ? `${w.allocations.length} payments paired with their bills. Any payment without a bill number is held, not guessed.` : 'Each bank payment names the bill it pays. One click pairs them.', 'Auto-match payments', s1],
    [2, 'Give every short bill an owner', owned && s1 ? 'Every short bill has an owner.' : `${cases.filter(i => !w.exceptions.find(e => e.invoiceId === i.id)?.owner).length} short bills still need a reason and an owner.`, `Open the ${cases.length} short bills`, s1 && owned],
    [3, 'Close them', closed && s1 ? 'All short bills are closed.' : 'Add the evidence and close each one. Above ₹10,000, a second person approves.', 'Review open bills', s1 && closed],
  ];
  return <ol aria-label="Do this next" className="mt-6 grid gap-2 sm:grid-cols-3">{steps.map(([n, t, d, cta, done]) => { const active = n === cur; const go = () => { setTab('exceptions'); setTimeout(() => document.getElementById('er-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }; const clickable = n > 1 && s1; return <li key={n} onClick={clickable ? go : undefined} className={'flex flex-col gap-2 rounded-xl border p-3 ' + (clickable ? 'cursor-pointer hover:border-primary ' : '') + (active ? 'border-primary bg-card shadow-sm ring-2 ring-primary/15' : done ? 'border-money-ok/40 bg-money-ok/5' : 'border-border bg-card opacity-60')}>
    <div className="flex items-center gap-2"><span className={'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ' + (done ? 'bg-money-ok text-primary-foreground' : active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>{done ? <Check className="size-4" /> : n}</span><span className="text-sm font-semibold">{t}</span>{active && <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[.65rem] font-semibold uppercase tracking-wide text-primary">Do this now</span>}</div>
    <p className="m-0 text-xs leading-5 text-muted-foreground">{d}</p>
    {active && (n === 1 ? <Button data-tour="automatch" className="mt-auto" onClick={() => action(() => { const next = autoMatch(w); const added = next.allocations.length - w.allocations.length; change(next, added ? `${added} payments paired with their bills.` : 'Everything that can be paired already is.'); if (added) setNotice(`Done: ${added} payments were paired with the bill they mention. Any bill still marked Partial was paid short. Open "Gaps to explain" to say why.`); })}><GitMerge />{cta}</Button> : <Button className="mt-auto" onClick={ev => { ev.stopPropagation(); go(); }}>{cta} <ArrowRight /></Button>)}
  </li>; })}</ol>; })()}
      <div data-tour="totals" className="mt-7 grid grid-cols-2 border-y border-border py-5 md:grid-cols-4">{[['Money received', received, 'Payments in the bank'], ['Matched', matched, 'Paired with an invoice'], ['Not yet matched', received - matched, 'Payments waiting for a bill'], ['Still owed', billed - matched, 'Billed but not paid']].map(([label, value, hint]) => <div key={String(label)} className="min-w-0 px-2 py-3 sm:px-4"><p className="text-xs font-medium">{label}</p><p className="text-[.7rem] text-muted-foreground">{hint}</p><p className="mt-2 break-words text-xl font-semibold tabular-nums">{money(Number(value))}</p></div>)}</div>
      <div className="mt-6 flex flex-wrap justify-between gap-3 border-b border-border"><div id="er-tabs" data-tour="tabs" className="grid w-full grid-cols-2 gap-1 rounded-md sm:flex sm:w-auto [&>button]:h-auto [&>button]:min-h-10 [&>button]:whitespace-normal [&>button]:text-left [&>button]:text-xs sm:[&>button]:text-sm"><Button variant={tab === 'reconcile' ? 'secondary' : 'ghost'} onClick={() => setTab('reconcile')}>Payments &amp; bills</Button><Button variant={tab === 'exceptions' ? 'secondary' : 'ghost'} onClick={() => setTab('exceptions')}>Gaps to explain <span className="er-pill bg-money-risk/10 text-money-risk">{w.invoices.filter(i => invoiceBalance(w, i.id) > 0 && !w.exceptions.find(e => e.invoiceId === i.id)?.resolved).length}</span></Button></div>{!demo && <div className="pb-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => download('everyrupee-workspace.json', JSON.stringify(w, null, 2))}><Download />Export</Button></div>}</div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><label className="flex min-w-0 flex-1 items-center gap-2"><Search className="size-4 text-muted-foreground" /><input aria-label="Search invoices" className="er-input w-full max-w-sm" placeholder="Search customer or invoice" value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="Invoice status" className="er-input" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All invoices</option><option value="outstanding">Outstanding</option><option value="paid">Paid</option></select></div>
      {error && <p className="mt-4 border-l-2 border-destructive p-3 text-sm text-destructive" role="alert">{error}</p>}{notice && <p className="mt-4 border-l-2 border-accent p-3 text-sm" role="status">{notice}</p>}
      {tab === 'reconcile' ? <>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          <section data-tour="receipts" className="min-w-0 rounded-xl"><div className="mb-3 flex items-center justify-between gap-2"><div><h2 className="font-semibold">Payments received</h2><p className="text-xs text-muted-foreground">What arrived in the bank, with the bill number the customer quoted</p></div><Button variant="outline" size="sm" onClick={() => setImportKind('receipts')}><Upload />Import CSV</Button></div><div className="overflow-x-auto border-y border-border"><table className="er-table"><thead><tr><th>Receipt / reference</th><th>Received</th><th>Available</th></tr></thead><tbody>{w.receipts.map(r => <tr key={r.id}><td><strong>{r.id}</strong><span className="block text-xs text-muted-foreground">{r.reference || 'No invoice reference'} · {r.date}</span></td><td>{money(r.amount)}</td><td>{money(receiptBalance(w, r.id))}</td></tr>)}</tbody></table>{!w.receipts.length && <p className="py-10 text-center text-sm text-muted-foreground">No receipts imported.</p>}</div><Button className="mt-3" variant="outline" disabled={!receiptOptions.length || !w.invoices.some(i => invoiceBalance(w, i.id) > 0)} onClick={() => { setManual(true); setReceipt(''); setInvoice(''); setAmount(''); }}>Pair one by hand <ArrowRight /></Button></section>
          <section data-tour="invoices" className="min-w-0 rounded-xl"><div className="mb-3 flex items-center justify-between gap-2"><div><h2 className="font-semibold">Bills sent (invoices)</h2><p className="text-xs text-muted-foreground">What customers owe. Partial means they paid short</p></div><Button variant="outline" size="sm" onClick={() => setImportKind('invoices')}><Upload />Import CSV</Button></div><div className="overflow-x-auto border-y border-border"><table className="er-table"><thead><tr><th>Invoice / customer</th><th>Billed</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>{invoices.map(i => <tr key={i.id}><td><strong>{i.id}</strong><span className="block text-xs text-muted-foreground">{i.customer}</span></td><td>{money(i.amount)}</td><td>{money(invoiceBalance(w, i.id))}</td><td><span className={'er-pill ' + (invoiceBalance(w, i.id) === 0 ? 'bg-money-ok/15 text-money-ok' : invoiceBalance(w, i.id) < i.amount ? 'bg-money-wip/15 text-money-wip' : 'bg-money-risk/10 text-money-risk')}>{invoiceBalance(w, i.id) === 0 ? 'Paid' : invoiceBalance(w, i.id) < i.amount ? 'Partial' : 'Unpaid'}</span></td></tr>)}</tbody></table>{!invoices.length && <p className="py-10 text-center text-sm text-muted-foreground">No matching invoices.</p>}</div></section>
        </div>
        {w.allocations.length > 0 && <section className="mt-8"><h2 className="mb-3 font-semibold">Allocation ledger</h2><div className="overflow-x-auto"><table className="er-table"><thead><tr><th>Receipt</th><th>Invoice</th><th>Allocated</th><th /></tr></thead><tbody>{w.allocations.map(a => <tr key={a.id}><td>{a.receiptId}</td><td>{a.invoiceId}</td><td>{money(a.amount)}</td><td><Button variant="ghost" size="icon" aria-label={`Undo ${a.receiptId} allocation`} title="Undo allocation" onClick={() => change({ ...w, allocations: w.allocations.filter(x => x.id !== a.id) }, 'Allocation removed.')}><Trash2 /></Button></td></tr>)}</tbody></table></div></section>}
      </> : <section className="mt-6">
        <div className="mb-4 rounded-xl border border-border bg-card p-3.5 text-xs leading-5">
          <p className="m-0 font-semibold text-foreground">How ownership &amp; approvals work (why each person exists):</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-2.5"><b className="text-foreground">1. Route by Reason (Domain Owner):</b><br />• <b>Asha (Finance AR):</b> Tax (TDS 194Q) &amp; pre-approved Ten Today discounts.<br />• <b>Rahul (Sales Rep):</b> Unapproved or over-cap discounts he promised.<br />• <b>Kavita (Sales Mgr):</b> Expired discount approvals she signed.<br />• <b>Priya (Warehouse) / Rohan (Collections):</b> Transit damage or cash recovery.</div>
            <div className="rounded-lg bg-muted/50 p-2.5"><b className="text-foreground">2. Finance Maker (Asha):</b><br />Once the domain owner verifies or hands the case back to Finance, <b>Asha</b> closes gaps <b>≤ ₹10,000</b> directly, or submits gaps <b>&gt; ₹10,000</b> for second approval.</div>
            <div className="rounded-lg bg-muted/50 p-2.5"><b className="text-foreground">3. Finance Checker (Vikram):</b><br />For any gap <b>above ₹10,000 (BR-5)</b>, <b>Vikram (Finance Controller)</b> must review and approve. Asha is blocked from approving her own submission.</div>
          </div>
        </div>
        <div className="overflow-x-auto"><table className="er-table"><thead><tr><th>Invoice / customer</th><th>Short by</th><th>Reason</th><th>Owner</th><th>Action &amp; dispute case</th></tr></thead><tbody>{cases.map(i => { const e = w.exceptions.find(e => e.invoiceId === i.id); return <tr key={i.id}><td><strong>{i.id}</strong><span className="block text-xs text-muted-foreground">{i.customer}</span></td><td>{money(invoiceBalance(w, i.id))}</td><td>{e?.reason ?? 'Unexplained'}</td><td>{e?.owner ? personLabel(e.owner) : 'Unassigned'}</td><td><div className="flex flex-wrap items-center gap-1.5">
  <Button size="sm" variant="outline" onClick={() => openCase(i.id)}>
    {(() => { const st = caseStatus(w, i.id); return st === 'resolved' ? '✓ Resolved' : st === 'pending' ? 'Waiting for Vikram' : 'Review Case'; })()}
  </Button>
  <Button
    size="sm"
    variant="secondary"
    className="h-8 gap-1 border border-sky-300 bg-sky-50 text-xs font-semibold text-sky-900 hover:bg-sky-100"
    onClick={() => setSnCaseId(i.id)}
    title="Open simulated dispute case"
  >
    <span className="font-bold text-sky-600">⚡</span>
    <span>sn Ticket</span>
  </Button>
  <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => { openCase(i.id); setFocusHistory(true); }}>
    🔒 SHA-256
  </Button>
</div></td></tr>; })}</tbody></table></div>{!cases.length && <p className="py-10 text-center text-muted-foreground">No outstanding exceptions.</p>}</section>}
      {demo && <><NumbersBand w={w} approvals={approvals} /><DesignDecisions /></>}
      <section ref={proofRef} aria-label="Controls & proof" className="mt-6 min-w-0 scroll-mt-4 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h2 className="mb-3 text-base font-semibold">Controls &amp; proof</h2>
        <div role="tablist" aria-label="Controls & proof" className="flex max-w-full gap-1 overflow-x-auto border-b border-border pb-2">
          {([['record', 'Sealed record'], ['servicenow', 'ServiceNow escalation'], ['impact', 'Impact']] as const).map(([key, label]) => <Button key={key} id={`proof-tab-${key}`} role="tab" aria-selected={proofTab === key} aria-controls={`proof-panel-${key}`} variant={proofTab === key ? 'secondary' : 'ghost'} size="sm" className="shrink-0 text-xs" onClick={() => setProofTab(key)}>{label}</Button>)}
        </div>
        <div role="tabpanel" id={`proof-panel-${proofTab}`} aria-labelledby={`proof-tab-${proofTab}`}>
          {proofTab === 'record' && <>
      {demo && <section ref={deskChainRef} data-tour="record" aria-label="Sealed reconciliation record" className="pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-bold text-foreground">🔒 Sealed reconciliation record</span>
            <span className="text-muted-foreground">· one record for the whole team · {deskBlocks.length} blocks</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={!deskBlocks.length} onClick={() => void verifyDeskRecord()}>Verify record</Button>
            <Button size="sm" variant="outline" disabled={openingHistory || !deskBlocks.length} onClick={() => void openSampleHistory()}>Open sample approval record</Button>
            <button type="button" onClick={() => { setDeskBlockIdx(0); setDeskBlockText(deskBlocks[0]?.text ?? ''); setDeskEditing(v => !v); }} className="rounded-lg border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40">Try tampering yourself</button>
            {deskUndo && <button type="button" onClick={() => void restoreDeskRecord()} className="rounded-lg border border-[#059669]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#059669] hover:bg-[#ECFDF5]">↺ Restore original</button>}
          </div>
        </div>

<AuditFraming /><p className="text-xs leading-5">Daily anchor drill: yesterday’s last fingerprint <code>{deskAnchor.current?.hash.slice(0, 8)}</code> “shared with the statutory auditor and Vikram (finance controller) at 18:00” · simulated, not sent. New actions append after this checkpoint.</p>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-stretch">
          {deskBlocks.map((b, k) => {
            const node = deskNodes[k];
            const brokenAt = deskCheck && !deskCheck.ok ? deskCheck.brokenAt : undefined;
            const hasBreak = brokenAt !== undefined && brokenAt >= 0;
            const isEdited = hasBreak && k === brokenAt;
            const isCascade = deskCheck?.anchorMismatch || (hasBreak && k > (brokenAt ?? -1));
            return <div key={k} className="flex flex-1 items-center gap-2">
              <div className={`flex h-full w-full flex-col justify-between rounded-xl border p-3 text-xs shadow-2xs transition ${isEdited ? 'border-destructive bg-destructive/5 ring-2 ring-destructive/20' : isCascade ? 'border-[#D97706] bg-[#FFFBEB]' : 'border-border bg-white'}`}>
                <div>
                  <div className="flex items-center justify-between gap-1 text-[.7rem] text-muted-foreground">
                    <span>#{k + 1} · {b.who}</span>
                    {isEdited && <span className="rounded bg-destructive px-1.5 py-0.5 text-[.65rem] font-bold text-white">✗ TAMPERED</span>}
                    {isCascade && <span className="rounded bg-[#D97706] px-1.5 py-0.5 text-[.65rem] font-bold text-white">⚠ INVALIDATED</span>}
                  </div>
                  <p className="m-0 mt-1.5 text-xs leading-5 font-medium text-foreground">{b.text}</p>
                  {isEdited && deskOrig[k] && <p className="m-0 mt-1 text-[.7rem] text-destructive">Was: "{deskOrig[k]}"</p>}
                </div>
                <div className="mt-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <code className={`rounded px-1.5 py-0.5 font-mono text-[.72rem] font-bold ${isEdited ? 'bg-destructive/15 text-destructive line-through' : 'bg-muted text-foreground'}`}>{b.hash?.slice(0, 8)}</code>
                    {isEdited && node && <code className="rounded bg-destructive px-1.5 py-0.5 font-mono text-[.72rem] font-bold text-white">≠ {node.recomputedHash.slice(0, 8)}</code>}
                  </div>
                  <p className="m-0 mt-1 text-[.68rem] text-muted-foreground">
                    {k === 0 ? 'first block' : <>built from #{k}'s <code className="rounded bg-muted px-1 py-0.5 font-mono text-[.66rem]">{b.prevHash?.slice(0, 6)}</code></>}
                  </p>
                </div>
              </div>
              {k < deskBlocks.length - 1 && <span aria-hidden="true" className={`hidden font-bold md:inline ${hasBreak && k >= (brokenAt ?? -1) ? 'text-destructive' : 'text-[#059669]'}`}>→</span>}
            </div>;
          })}
        </div>

        {deskEditing && <div aria-label="Outside the app raw database row" className="mt-3.5 rounded-xl bg-[#141413] p-4 text-xs text-[#E7E5E4] shadow-md">
          <p className="m-0 text-[.7rem] font-bold uppercase tracking-wider text-[#F97316]">⚠ OUTSIDE THE APP · RAW DATABASE ROW</p>
          <p className="m-0 mt-1.5 leading-5 text-[#D6D3D1]">The app has no edit button for this record. An insider with database access could change a stored row directly, like this. No new fingerprint is made, because that only happens when a decision goes through the app.</p>
          <label className="mt-3 block font-semibold text-white">Block
            <select aria-label="Select block to tamper" className="mt-1 block w-44 rounded-lg border border-[#44403C] bg-[#1C1917] px-2.5 py-1.5 text-xs font-medium text-white" value={deskBlockIdx} onChange={ev => { const idx = Number(ev.target.value); setDeskBlockIdx(idx); setDeskBlockText(deskBlocks[idx]?.text ?? ''); }}>
              {deskBlocks.map((b, i) => <option key={i} value={i}>#{i + 1} · {b.who}</option>)}
            </select>
          </label>
          <label className="mt-2.5 block font-semibold text-white">text
            <textarea aria-label="Raw database text" rows={2} className="mt-1 block w-full rounded-lg border border-[#44403C] bg-[#1C1917] p-2.5 font-mono text-xs text-white focus:border-[#F97316] focus:outline-none" value={deskBlockText} onChange={ev => setDeskBlockText(ev.target.value)} />
          </label>
          <p className="m-0 mt-2 font-mono text-[.7rem] text-[#A8A29E]">
            who: {deskBlocks[deskBlockIdx]?.who} · at: {deskBlocks[deskBlockIdx]?.at} · stored fingerprint: {deskBlocks[deskBlockIdx]?.hash?.slice(0, 16)}…
          </p>
<label className="my-2 flex items-center gap-2"><input type="checkbox" checked={deskAdminRewrite} onChange={ev => setDeskAdminRewrite(ev.target.checked)} />Admin with full access: also recompute every fingerprint</label>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" disabled={deskBlockText === deskBlocks[deskBlockIdx]?.text} onClick={() => void saveDeskTamper()} className="rounded-lg bg-[#C2410C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#9A3412] disabled:opacity-50">Save to database</button>
            <button type="button" onClick={() => setDeskEditing(false)} className="rounded-lg border border-[#44403C] bg-transparent px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#292524]">Cancel</button>
          </div>
        </div>}

        <p role="status" className={`m-0 mt-2.5 text-xs ${deskCheck ? (deskCheck.ok ? 'font-semibold text-[#065F46]' : 'font-semibold text-destructive') : 'text-muted-foreground'}`}>
          {deskCheck ? deskCheck.text : <>Not checked in this view yet. Press <b>Verify record</b> to recompute every fingerprint, or <b>Try tampering yourself</b> to edit a stored block.</>}
        </p>
      </section>}
          </>}
          {proofTab === 'servicenow' && <>
      {/* Enterprise ServiceNow ITIL Change & Dispute Hub (Native Desk Component) */}
      <section id="sn-gateway" data-tour="servicenow" className="pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">⚡</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="m-0 text-sm font-bold text-foreground">Dispute cases &amp; finance rule changes</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[.65rem] font-bold uppercase tracking-wider text-primary">Simulated · ServiceNow Table API format</span>
              </div>
              <p className="m-0 text-xs text-muted-foreground">Dispute case (modelled on SAP S/4HANA Dispute Management: short pay → residual item with reason code → dispute case with cause, amount, owner). SLA tiers, proof and two-person sign-off are illustrated here; no SAP or ServiceNow connection.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-primary" onClick={() => {
              const base = w.allocations.length ? w : autoMatch(w);
              if (base !== w) change(base, 'Payments matched to bills.');
              setSnCaseId('INV-102');
            }}>
              ⚡ Open INV-102 Ticket (Emergency 2-day TAT) →
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-foreground hover:bg-muted" onClick={() => {
              const base = w.allocations.length ? w : autoMatch(w);
              if (base !== w) change(base, 'Payments matched to bills.');
              setSnCaseId('INV-101');
            }}>
              Open INV-101 (Normal 7-day TAT) →
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold border-teal-600/30 text-teal-800 bg-teal-50/60 hover:bg-teal-100/60" onClick={() => setSnShowConfig(v => !v)}>
              <span>🔌</span>
              <span>{snShowConfig ? 'Hide API connection' : 'API connection & login'}</span>
            </Button>
          </div>
        </div>

        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between text-[.7rem] text-muted-foreground">
              <span className="font-semibold text-primary">1 · DISPUTE SLA TIERS</span>
              <span className="font-mono">DSP-EMG-102</span>
            </div>
            <p className="m-0 mt-1 font-semibold text-foreground">Normal vs. Emergency SLAs</p>
            <p className="m-0 mt-0.5 text-muted-foreground leading-4.5">Standard 7-day TAT vs. 2-day critical TAT for unapproved claims &gt;₹10,000.</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between text-[.7rem] text-muted-foreground">
              <span className="font-semibold text-primary">2 · MANDATORY PROOF GATE</span>
              <span className="font-mono">sys_attachment</span>
            </div>
            <p className="m-0 mt-1 font-semibold text-foreground">Signed GRN / POD Upload</p>
            <p className="m-0 mt-0.5 text-muted-foreground leading-4.5">Tickets physically lock until verified delivery notes or trade circulars are attached.</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between text-[.7rem] text-muted-foreground">
              <span className="font-semibold text-primary">3 · HOD &amp; PVT SIGN-OFF</span>
              <span className="font-mono">u_pvt_signoff</span>
            </div>
            <p className="m-0 mt-1 font-semibold text-foreground">Post-Validation Testing Gate</p>
            <p className="m-0 mt-0.5 text-muted-foreground leading-4.5">Requires Finance Head (Vikram) approval + PVT test pass before ticket can close.</p>
          </div>
        </div>

        {/* Simulated ServiceNow Instance Connection & Login Drawer */}
        {snShowConfig && (
          <div id="sn-desk-login" className="mt-4 rounded-xl border border-teal-600/30 bg-[#F0FDFA] p-3.5 text-xs text-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-teal-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-900 text-sm">ServiceNow Instance Connection &amp; API Credentials</span>
                <span className="rounded-full bg-teal-600/15 px-2 py-0.5 text-[0.65rem] font-bold text-teal-800">
                  {snPingStatus ? 'Simulation checked' : 'Ready to Ping'}
                </span>
              </div>
              <span className="text-[0.7rem] text-muted-foreground font-mono">Disputes: illustrative u_dispute_case &amp; sys_attachment; rules: change_request</span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[0.7rem] font-semibold text-teal-900">Instance URL</label>
                <input
                  type="text"
                  value={snInstanceUrl}
                  onChange={e => setSnInstanceUrl(e.target.value)}
                  placeholder="https://devXXXXX.service-now.com"
                  className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-[0.7rem] font-semibold text-teal-900">Service Account Email / User</label>
                <input
                  type="text"
                  value={snEmail}
                  onChange={e => setSnEmail(e.target.value)}
                  placeholder="admin@corp.finance.internal"
                  className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-[0.7rem] font-semibold text-teal-900">Password / Bearer Token</label>
                <input
                  type="password"
                  value={snToken}
                  onChange={e => setSnToken(e.target.value)}
                  placeholder="••••••••••••"
                  className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-teal-200">
              <span className="text-[0.72rem] text-muted-foreground">
                Disputes use an illustrative <code>u_dispute_case</code> object, not ITIL Change. Only finance rule changes use <code>change_request</code>.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3"
                  onClick={() => {
                    setSnPingStatus('Simulation checked · ServiceNow Table API format (u_dispute_case + sys_attachment); no connection made.');
                  }}
                >
                  Save &amp; Test Ping
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => {
                    setSnInstanceUrl('https://dev214912.service-now.com');
                    setSnEmail('admin@corp.finance.internal');
                    setSnToken('••••••••••••');
                    setSnPingStatus(null);
                  }}
                >
                  Reset Defaults
                </Button>
              </div>
            </div>

            {snPingStatus && (
              <p className="m-0 mt-2.5 rounded-lg bg-teal-100/80 px-3 py-1.5 text-[0.72rem] font-semibold text-teal-900 border border-teal-300">
                {snPingStatus}
              </p>
            )}
          </div>
        )}
      <RuleChangeRequest onLogged={async entries => { const next = await sealLog('DESK-RECORD', [...deskBlocks, ...entries.map(({ at, who, text }) => ({ at, who, text }))]); setDeskBlocks(next); setDeskCheck(null); setDeskNodes(await inspectLogChain('DESK-RECORD', next)); }} />
      </section>

          </>}
          {proofTab === 'impact' && <>
      {(() => {
        const imp = currentImpact;
        const hrs = impactHours;
        return <section aria-label="Estimated desk impact" data-tour="impact" className="pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-primary/10 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[.68rem] font-bold uppercase tracking-wider text-primary-foreground">Estimated impact</span>
              <span className="text-xs font-medium text-foreground">from this sample, against cited benchmarks</span>
            </div>
            {demo && <button type="button" className="text-xs font-semibold text-primary underline" onClick={() => { if (batchMode === 'starter') { const bw = autoMatch(benchmarkWorkspace()); setBatchMode('benchmark'); setW(bw); setNotice('Loaded & auto-matched 25-bill distributor batch (₹68.4L billed).'); } else { setBatchMode('starter'); setW(initial); } }}>{batchMode === 'starter' ? 'Switch to 25-bill CPG batch (₹68.4L) →' : '← Back to 4-bill starter'}</button>}
          </div>
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:grid-cols-4">
            <div className="p-3.5 sm:px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Short-Payment Detection</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">Day 0</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Down from <b>7–14 days</b> manual bank-to-ERP lag (The Hackett Group CPG baseline)</p>
            </div>
            <div className="p-3.5 sm:px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Estimated manual checks saved</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">~{hrs} h saved per {sampleImpact.totalBills} bills <span className="text-sm font-semibold text-muted-foreground">({sampleImpact.autoTriagedBills}/{sampleImpact.totalBills} auto-triaged)</span></p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Cuts 4-way lookup from <b>22 min → &lt;2 min/bill</b> across UTR, invoice &amp; scheme circular (APQC)</p>
            </div>
            <div className="p-3.5 sm:px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-money-wip">Invalid / Excess Claims Caught</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-money-wip">{money(imp.blockedLeakagePaise)} flagged</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Expired or over-cap discounts blocked &amp; routed back to Sales (<b>BR-10 · ₹0 write-offs</b>)</p>
            </div>
            <div className="p-3.5 sm:px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Faster Resolution &amp; Control</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">3–7d SLA</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{money(imp.dualControlPaise)} in gaps above ₹10,000 need two approvers (<b>BR-5</b>). Compared with <b>30–45d CPG average</b>.</p>
            </div>
          </div>
        </section>;
      })()}
          </>}
        </div>
      </section>
      <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><span>Strict reference matching · no automatic write-offs</span><span>{demo ? 'Sample changes are not saved.' : dirty ? 'Unsaved changes' : 'Private records'}{!demo && <> · <Link to="/capabilities" className="underline">Release limitations</Link></>}</span></footer>
    </main>
    <Tour steps={tourSteps} step={tour} setStep={setTour} />
    <Dialog open={importKind !== null} onOpenChange={open => { if (!open) setImportKind(null); }}><DialogContent className="er-app max-h-[90vh] overflow-y-auto"><DialogTitle>Import {importKind}</DialogTitle><DialogDescription>CSV · amounts in rupees · dates YYYY-MM-DD · up to 1,000 records per type. Imports append; duplicate IDs are rejected.</DialogDescription><Button variant="outline" onClick={() => download(`${importKind}-template.csv`, importKind === 'invoices' ? 'id,customer,amount,date\nINV-NEW,Example Distributors,11800.00,2026-10-01' : 'id,reference,amount,date\nUTR-NEW,INV-NEW,10620.00,2026-10-15')}><Download />Download template</Button><input ref={fileRef} type="file" accept=".csv,text/csv" aria-label="Choose CSV" className="er-input" onChange={async e => { const file = e.target.files?.[0]; if (!file || !importKind) return; if (file.size > 2_000_000) { setError('CSV must be smaller than 2 MB.'); return; } try { const next = importCsv(w, importKind, await file.text()); change(next, `${next[importKind].length - w[importKind].length} ${importKind} imported.`); setImportKind(null); } catch (e) { setError(e instanceof Error ? e.message : 'Import failed.'); } }} />{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</DialogContent></Dialog>
    <Dialog open={manual} onOpenChange={setManual}><DialogContent className="er-app"><DialogTitle>Allocate a receipt</DialogTitle><DialogDescription>Only available cash can be applied to an outstanding invoice.</DialogDescription><form className="grid gap-4" onSubmit={e => { e.preventDefault(); action(() => { change(allocate(w, receipt, invoice, parseMoney(amount)), 'Receipt allocated.'); setManual(false); }); }}><label className="grid gap-1 text-sm">Receipt<select required className="er-input" value={receipt} onChange={e => setReceipt(e.target.value)}><option value="">Select receipt</option>{receiptOptions.map(r => <option key={r.id} value={r.id}>{r.id} · {money(receiptBalance(w, r.id))}</option>)}</select></label><label className="grid gap-1 text-sm">Invoice<select required className="er-input" value={invoice} onChange={e => setInvoice(e.target.value)}><option value="">Select invoice</option>{w.invoices.filter(i => invoiceBalance(w, i.id) > 0).map(i => <option key={i.id} value={i.id}>{i.id} · {money(invoiceBalance(w, i.id))}</option>)}</select></label><label className="grid gap-1 text-sm">Amount (₹)<input required className="er-input" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" /></label>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<Button type="submit"><Check />Apply allocation</Button></form></DialogContent></Dialog>
    <ServiceNowModal open={Boolean(snCaseId)} onClose={() => setSnCaseId(null)} caseId={snCaseId} w={w} actor="Asha" />
    <CaseDialog w={w} caseId={caseId} approvals={approvals} demo={demo} focusHistory={focusHistory} onClose={() => { setCaseId(null); setFocusHistory(false); }} change={change} />
    <Dialog open={reset} onOpenChange={setReset}><DialogContent className="er-app"><DialogTitle>{demo ? 'Reset sample records?' : 'Clear current records?'}</DialogTitle><DialogDescription>{demo ? 'Restore the original illustrative dataset.' : 'All invoices, receipts, allocations and cases will be removed from the current workspace. Save to make this permanent.'}</DialogDescription><Button variant="destructive" onClick={() => { change(demo ? initial : emptyWorkspace(), 'Workspace reset.'); setBatchMode('starter'); setProofTab('record'); void restoreDeskRecord(); setDeskEditing(false); setReset(false); }}>Confirm reset</Button></DialogContent></Dialog>
  </div>;
}
