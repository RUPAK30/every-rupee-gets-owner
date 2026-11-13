import { useEffect, useRef, useState } from 'react';
import { Check, Clock, ShieldCheck, Signal, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { autoMatch, benchmarkWorkspace, saveCase, handBack, resolveSmall, sealLog, invoiceBalance, money, type Workspace } from '@/lib/reconciliation/engine';
/* Every Rupee's own story: a short payment for transit damage, owned by the warehouse, closed with proof. */
const CASE = 'INV-110';
function storyStates(): Workspace[] {
  const matched = autoMatch(benchmarkWorkspace());
  const reason = saveCase(matched, CASE, { reason: 'Damage claim', owner: '', notes: 'Customer remittance note: 2 cartons damaged in transit, LR-8841.' }, 'Asha');
  const owned = saveCase(reason, CASE, { reason: 'Damage claim', owner: 'Priya', notes: 'Warehouse to check the delivery proof (POD) for LR-8841.' }, 'Asha');
  const proof = handBack(owned, CASE, 0, 'POD for LR-8841 shows a damage remark signed at unloading; photos attached.');
  const closed = resolveSmall(proof, CASE, 'Asha');
  return [matched, reason, owned, proof, proof, closed];
}
export function PhoneStory() {
  const chatRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null), remaining = useRef(0), stepStart = useRef(0);
  const [states, setStates] = useState<Workspace[]>([]), [step, setStep] = useState(0), [visible, setVisible] = useState(false), [manual, setManual] = useState(false), [typing, setTyping] = useState(false);
  useEffect(() => { let live = true; void Promise.all(storyStates().map(async w => ({ ...w, exceptions: await Promise.all(w.exceptions.map(async e => ({ ...e, log: await sealLog(e.invoiceId, e.log ?? []) }))) }))).then(s => { if (live) setStates(s); }); const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; setManual(reduced); const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), { threshold: 0.55 }); if (ref.current) observer.observe(ref.current); return () => { live = false; observer.disconnect(); }; }, []);
  const inv = states[0]?.invoices.find(i => i.id === CASE), short = states[0] ? invoiceBalance(states[0], CASE) : 0;
  const STORY: [string, string][] = [
    ['Bank file', `${inv?.customer ?? 'Deccan Retail Corp'} paid ${money(inv ? inv.amount - short : 0)} against ${money(inv?.amount ?? 0)}. ${money(short)} is missing. Day 0: Every Rupee opens a case.`],
    ['Asha · receivables', 'Customer\'s remittance note says 2 cartons were damaged in transit (LR-8841). Reason set: damage claim.'],
    ['Every Rupee', 'Damage claims belong to the warehouse, not sales. Owner: Priya, warehouse & logistics. Due in 3 days.'],
    ['Priya · warehouse', 'Checked the delivery proof (POD): damage remark signed at unloading, photos attached. Damage confirmed, a credit note is due.'],
    ['Every Rupee', `${money(short)} is under ₹10,000, so receivables can close it without a second approval. Above that, the finance head must approve.`],
    ['Asha · receivables', 'Credit note raised, case closed. Every step is sealed: if anyone edits it later, it shows.'],
  ];
  const messages = STORY.map(x => x[1]);
  useEffect(() => { remaining.current = Math.min(7000, 2400 + (messages[step]?.split(/\s+/).length ?? 0) * 170); }, [step, states]);
  useEffect(() => {
    if (!visible || manual || !states.length || step >= states.length - 1) { setTyping(false); return; }
    setTyping(true); const beat = window.setTimeout(() => setTyping(false), 500); stepStart.current = performance.now(); const timer = window.setTimeout(() => { remaining.current = 0; setStep(s => s + 1); }, Math.max(600, remaining.current));
    return () => { clearTimeout(beat); clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - stepStart.current)); };
  }, [visible, manual, step, states]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [step]);
  const labels = ['Payment', 'Reason', 'Owner', 'Proof', 'Rule', 'Closed'];
  return <section id="walkthrough" className="er-story-section grid items-center gap-10 py-10 lg:grid-cols-2"><div className="er-explanation"><p className="text-xs font-semibold uppercase text-primary">One gap. One clear next step.</p><h2 className="mt-3 text-3xl font-semibold">Watch ₹2,300 of missing money find its owner.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">A customer pays short. Instead of an email thread, it becomes a case with a reason, an owner who can actually fix it, proof, and a rule for who may close it.</p><p className="mt-3 text-xs text-muted-foreground">Illustrative walkthrough using INV-110 from the sample. The proof is supplied only inside this story, not added to your live desk. Chat-style display, not a WhatsApp connection.</p><Button asChild variant="outline" className="mt-5"><a href="/demo#case/INV-110">Open this case in the desk</a></Button></div>
    <div ref={ref} className="er-phone mx-auto" aria-label="Engine-driven case walkthrough"><div className="er-phone-status"><span>9:41</span><span className="er-notch"/><div className="flex gap-1"><Signal size={12}/><Battery size={14}/></div></div><div className="er-phone-chat-header"><span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">D</span><div><b>Deccan Retail Corp</b><p className="text-[10px] text-muted-foreground">INV-110 · short payment</p></div><ShieldCheck className="ml-auto size-5 text-primary"/></div><div className="er-phone-checks">{labels.map((label, i) => <span key={label} className={i <= step ? 'text-money-ok' : 'text-money-wip'}>{i <= step ? <Check size={13}/> : <Clock size={13}/>}<small>{label}</small></span>)}</div><div ref={chatRef} className="er-phone-messages" aria-live="polite">{messages.slice(0, step + 1).map((text, i) => <div className={'er-chat-message ' + (i % 2 ? 'er-chat-out' : '')} key={i}><b>{STORY[i]?.[0]}</b><p>{text}</p>{i === 5 && <span className="text-money-ok">✓ Closed with proof · ₹0 written off silently</span>}</div>)}{typing && <p className="text-xs text-muted-foreground">typing…</p>}</div><Button variant="ghost" className="er-phone-next w-full rounded-none" onClick={() => { setManual(true); setStep(s => s === 5 ? 0 : s + 1); }}>{step === 5 ? 'Replay the case' : 'Tap for the next step'}</Button><p className="px-3 py-2 text-center text-[9px] text-muted-foreground">Engine-driven sample · not connected to WhatsApp</p></div>
  </section>;
}
