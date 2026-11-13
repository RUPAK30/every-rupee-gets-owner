import { useEffect, useRef, useState } from 'react';
import { Check, Clock, ShieldCheck, Signal, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { autoMatch, sampleWorkspace, saveCase, handBack, submitForApproval, approveCase, sealLog, invoiceBalance, money, type Workspace } from '@/lib/reconciliation/engine';
function storyStates(): Workspace[] {
  const matched = autoMatch(sampleWorkspace());
  const reason = saveCase(matched, 'INV-102', { reason: 'Scheme claim · not approved', owner: '', notes: 'Verbal sales promise; no approved budget attached.' }, 'Asha');
  const owned = saveCase(reason, 'INV-102', { reason: 'Scheme claim · not approved', owner: 'Rahul', notes: 'Sales must check the verbal promise within 3 days (BR-8).' }, 'Asha');
  const evidence = handBack(owned, 'INV-102', 0, 'Walkthrough only: Rahul supplies the approval evidence; Finance reviews it.');
  const pending = submitForApproval(evidence, 'INV-102', 'Asha');
  const approved = approveCase(pending, 'INV-102', 'Vikram');
  return [matched, reason, owned, evidence, pending, approved];
}
export function PhoneStory() {
  const ref = useRef<HTMLDivElement>(null), remaining = useRef(0), stepStart = useRef(0);
  const [states, setStates] = useState<Workspace[]>([]), [step, setStep] = useState(0), [visible, setVisible] = useState(false), [manual, setManual] = useState(false), [typing, setTyping] = useState(false);
  useEffect(() => { let live = true; void Promise.all(storyStates().map(async w => ({ ...w, exceptions: await Promise.all(w.exceptions.map(async e => ({ ...e, log: await sealLog(e.invoiceId, e.log ?? []) }))) }))).then(s => { if (live) setStates(s); }); const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; setManual(reduced); const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), { threshold: 0.55 }); if (ref.current) observer.observe(ref.current); return () => { live = false; observer.disconnect(); }; }, []);
  const messages = states.map((w, index) => { const e = w.exceptions.find(e => e.invoiceId === 'INV-102'); const invoice = w.invoices.find(i => i.id === 'INV-102'); return index === 0 ? `${invoice?.customer} paid ${money(invoice ? invoice.amount - invoiceBalance(w, invoice.id) : 0)}. ${money(invoiceBalance(w, 'INV-102'))} is missing.` : e?.log?.at(-1)?.text ?? ''; });
  useEffect(() => { remaining.current = Math.min(7000, 2400 + (messages[step]?.split(/\s+/).length ?? 0) * 170); }, [step, states]);
  useEffect(() => {
    if (!visible || manual || !states.length || step >= states.length - 1) { setTyping(false); return; }
    setTyping(true); const beat = window.setTimeout(() => setTyping(false), 500); stepStart.current = performance.now(); const timer = window.setTimeout(() => { remaining.current = 0; setStep(s => s + 1); }, Math.max(600, remaining.current));
    return () => { clearTimeout(beat); clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - stepStart.current)); };
  }, [visible, manual, step, states]);
  const labels = ['Payment', 'Reason', 'Owner', 'Proof', 'Review', 'Closed'];
  return <section id="walkthrough" className="er-story-section grid items-center gap-10 py-10 lg:grid-cols-2"><div className="er-explanation"><p className="text-xs font-semibold uppercase text-primary">One gap. One clear next step.</p><h2 className="mt-3 text-3xl font-semibold">Watch Meera’s missing money find its owner.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">A short payment becomes a case, not another email thread. The real desk rules decide which actions are allowed and when a second person must approve.</p><p className="mt-3 text-xs text-muted-foreground">Illustrative walkthrough using INV-102. Approval evidence is supplied only inside this isolated story, not added to your live desk. Chat-style display, not a WhatsApp connection.</p><Button asChild variant="outline" className="mt-5"><a href="/demo#case/INV-102">Open Meera’s actual case</a></Button></div>
    <div ref={ref} className="er-phone mx-auto" aria-label="Engine-driven case walkthrough"><div className="er-phone-status"><span>9:41</span><span className="er-notch"/><div className="flex gap-1"><Signal size={12}/><Battery size={14}/></div></div><div className="er-phone-chat-header"><span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">M</span><div><b>Meera Trading</b><p className="text-[10px] text-muted-foreground">INV-102 · sample case</p></div><ShieldCheck className="ml-auto size-5 text-primary"/></div><div className="er-phone-checks">{labels.map((label, i) => <span key={label} className={i <= step ? 'text-money-ok' : 'text-money-wip'}>{i <= step ? <Check size={13}/> : <Clock size={13}/>}<small>{label}</small></span>)}</div><div className="er-phone-messages" aria-live="polite">{messages.slice(0, step + 1).map((text, i) => <div className={'er-chat-message ' + (i % 2 ? 'er-chat-out' : '')} key={i}><b>{i === 0 ? 'Bank file' : states[i]?.exceptions.find(e => e.invoiceId === 'INV-102')?.log?.at(-1)?.who}</b><p>{text}</p>{i === 5 && <span className="text-money-ok">✓ Second-person approval · closed</span>}</div>)}{typing && <p className="text-xs text-muted-foreground">typing…</p>}</div><Button variant="ghost" className="er-phone-next w-full rounded-none" onClick={() => { setManual(true); setStep(s => s === 5 ? 0 : s + 1); }}>{step === 5 ? 'Replay the case' : 'Tap for the next step'}</Button><p className="px-3 py-2 text-center text-[9px] text-muted-foreground">Engine-driven sample · not connected to WhatsApp</p></div>
  </section>;
}
