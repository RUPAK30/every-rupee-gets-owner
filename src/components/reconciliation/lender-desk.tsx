import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { RotateCcw, ScanSearch, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/reconciliation/engine';
import { useServerFn } from '@tanstack/react-start';
import { RETURN_CODES } from '@/lib/reconciliation/lender-codes';
import { explainReturnCode } from '@/lib/reconciliation/lender.functions';
import { Tour, DeskSwitch, type TourStep } from './tour';

type Emi = { id: string; borrower: string; amount: number; status: 'cleared' | 'bounced'; code?: string; read?: boolean; owner?: string; outcome?: string };
const CODES = RETURN_CODES;
const sample = (): Emi[] => [
  { id: 'EMI-201', borrower: 'Ravi K.', amount: 500000, status: 'bounced', code: '04' },
  { id: 'EMI-202', borrower: 'Priya S.', amount: 400000, status: 'bounced', code: '61' },
  { id: 'EMI-203', borrower: 'Arjun M.', amount: 600000, status: 'bounced', code: '06' },
  { id: 'EMI-204', borrower: 'Neha P.', amount: 300000, status: 'cleared' },
];

export function LenderDesk() {
  const [rows, setRows] = useState(sample);
  const explainFn = useServerFn(explainReturnCode);
  const [ai, setAi] = useState<Record<string, { explanation: string; suggestion: string; error: string | null } | 'loading'>>({});
  const explain = async (code: string) => { setAi(a => ({ ...a, [code]: 'loading' })); try { const r = await explainFn({ data: { code } }); setAi(a => ({ ...a, [code]: r })); } catch { setAi(a => ({ ...a, [code]: { explanation: '', suggestion: '', error: 'The AI explanation is unavailable right now.' } })); } };
  const [tour, setTour] = useState<number | null>(null);
  useEffect(() => { if (new URLSearchParams(window.location.search).get('tour') === '1') setTour(0); }, []);
  const due = rows.reduce((s, r) => s + r.amount, 0);
  const collected = rows.filter(r => r.status === 'cleared').reduce((s, r) => s + r.amount, 0);
  const open = rows.filter(r => r.status === 'bounced' && !r.outcome);
  const readCodes = () => { setRows(rs => rs.map(r => r.code ? { ...r, read: true, owner: CODES[r.code]!.owner } : r)); toast.success('Return codes read. Each bounce now has a cause, an owner and a next step.'); };
  const record = (id: string, outcome: string) => { setRows(rs => rs.map(r => r.id === id ? { ...r, outcome } : r)); toast.success(`${id}: outcome logged.`); };
  const steps: TourStep[] = [
    { target: 'emis', title: 'Four loan instalments were due', text: 'Each borrower owes a monthly EMI, collected by auto-debit. One cleared. Three came back unpaid. That is called a bounce.' },
    { target: 'codes', title: 'The bank says why, in code', text: 'Every bounce returns a short code like 04 or 61. On their own, they mean nothing to most people.' },
    { target: 'read', title: 'Turn codes into plain answers', text: 'One click reads each code and names the cause, the person responsible and the right next step.', cta: 'Read the codes for me', run: readCodes },
    { target: 'emis', title: 'Different causes, different actions', text: 'No balance? Call and retry. Mandate cancelled? Get a new one. Stopped by the borrower? Talk first. Retrying blindly could be a dispute.' },
    { target: 'emis', title: 'Close the loop', text: 'The owner logs what happened. Only outcomes that fit the cause are offered, so nobody retries a stopped payment by mistake.', cta: 'Log the first outcome', run: () => record('EMI-201', CODES['04']!.outcomes[0]!) },
    { target: 'totals', title: 'Every rupee accounted for', text: 'Totals show what was due, what came in and what is still being chased, with a name against each. Same engine as the receivables desk.' },
  ];
  return <div className="er-app min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
      <Link to="/" className="flex items-center gap-2 text-lg font-semibold"><span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">₹</span>Every Rupee</Link>
      <div className="flex flex-wrap items-center gap-2"><DeskSwitch active="lender" /><Button variant="ghost" asChild><Link to="/capabilities">Capability status</Link></Button></div>
    </div></header>
    <div className="border-b border-border bg-secondary px-4 py-2 text-center text-xs text-secondary-foreground">Illustrative records · changes stay in this session · no connected banks or lending systems</div>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Lending / EMI collections</p>
      <h1 className="mt-2 text-3xl font-semibold">Lender desk</h1>
      <p className="mt-2 max-w-[60ch] text-sm leading-6 text-muted-foreground">When a loan instalment fails, the bank sends a code. This desk turns each code into a cause, an owner and a next step, so no missed EMI sits unexplained.</p>
      <div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => { setRows(sample()); setTour(0); }}>▶ 60-second guided tour</Button><Button variant="outline" onClick={() => setRows(sample())}><RotateCcw />Reset sample</Button></div>
      <div data-tour="totals" className="mt-7 grid grid-cols-2 border-y border-border py-5 md:grid-cols-4">{[['EMIs due', money(due), 'This cycle'], ['Collected', money(collected), 'Cleared by auto-debit'], ['Bounced', money(due - collected), 'Came back unpaid'], ['Still open', String(open.length), 'Bounces without an outcome']].map(([l, v, h]) => <div key={l} className="px-2 py-3 sm:px-4"><p className="text-xs font-medium">{l}</p><p className="text-[.7rem] text-muted-foreground">{h}</p><p className="mt-2 text-xl font-semibold tabular-nums">{v}</p></div>)}</div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">This month's instalments</h2><p className="text-xs text-muted-foreground">Bounced rows need a cause, an owner and an outcome</p></div><Button data-tour="read" onClick={readCodes} disabled={rows.every(r => !r.code || r.read)}><ScanSearch />Read return codes</Button></div>
      <div data-tour="emis" className="mt-3 overflow-x-auto rounded-xl border-y border-border"><table className="er-table"><thead><tr><th>EMI / borrower</th><th>Amount</th><th data-tour="codes">Bank code</th><th>Cause and next step</th><th>Owner</th><th>Outcome</th></tr></thead><tbody>{rows.map(r => { const c = r.code ? CODES[r.code] : undefined; return <tr key={r.id}>
        <td><strong>{r.id}</strong><span className="block text-xs text-muted-foreground">{r.borrower}</span></td><td>{money(r.amount)}</td>
        <td>{r.code ? <span className="er-pill bg-money-risk/10 text-money-risk">Code {r.code}</span> : <span className="er-pill bg-money-ok/15 text-money-ok">Cleared</span>}</td>
        <td className="text-sm">{c ? (r.read ? <><b>{c.cause}</b><span className="block text-xs text-muted-foreground">{c.next}</span>{(() => { const x = ai[r.code!]; if (!x) return <button className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline" onClick={() => explain(r.code!)}><Sparkles className="size-3" />Explain in plain words</button>; if (x === 'loading') return <span className="mt-1 block text-xs text-muted-foreground">Explaining…</span>; if (x.error) return <span className="mt-1 block text-xs text-muted-foreground">{x.error}</span>; return <div className="mt-2 rounded-md border border-border bg-secondary p-2 text-xs"><p><Sparkles className="mr-1 inline size-3" />{x.explanation}</p>{!r.outcome && <p className="mt-1">AI suggests: <b>{x.suggestion}</b>. Nothing happens until a person confirms. <Button size="sm" variant="outline" className="ml-1 h-6 px-2 text-xs" onClick={() => record(r.id, x.suggestion)}>Confirm</Button></p>}<p className="mt-1 text-[.65rem] text-muted-foreground">AI wording based on the desk rule · check before acting</p></div>; })()}</> : <span className="text-muted-foreground">Not read yet</span>) : '—'}</td>
        <td>{r.owner ?? (c ? 'Unassigned' : '—')}</td>
        <td>{r.outcome ? <span className="er-pill bg-money-ok/15 text-money-ok"><Check className="size-3" />{r.outcome}</span> : c && r.read ? <select aria-label={`Outcome for ${r.id}`} className="er-input" value="" onChange={e => e.target.value && record(r.id, e.target.value)}><option value="">Log outcome…</option>{c.outcomes.map(o => <option key={o}>{o}</option>)}</select> : '—'}</td>
      </tr>; })}</tbody></table></div>
      <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><span>Stopped payments are never re-presented before contact</span><a className="underline" href="https://everyrupee-o2c.vercel.app/lender.html">Full lender desk ↗</a></footer>
    </main>
    <Tour steps={steps} step={tour} setStep={setTour} />
  </div>;
}
