import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TourStep = { target: string; title: string; text: string; cta?: string; run?: () => void };

/** Spotlight tour: dims the page, highlights [data-tour=target] and scrolls it into view. */
export function Tour({ steps, step, setStep }: { steps: TourStep[]; step: number | null; setStep: (n: number | null) => void }) {
  const current = step === null ? undefined : steps[step];
  const ran = useRef<number | null>(null);
  useEffect(() => {
    if (!current) return;
    let el: Element | null = null;
    const t = window.setTimeout(() => {
      el = document.querySelector(`[data-tour="${current.target}"]`);
      el?.classList.add('er-tour-hl');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    return () => { window.clearTimeout(t); el?.classList.remove('er-tour-hl'); };
  }, [current, step]);
  if (step === null || !current) return null;
  const last = step + 1 >= steps.length;
  const next = () => setStep(last ? null : step + 1);
  return <div role="dialog" aria-label="Guided tour" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg sm:right-6 sm:left-auto sm:bottom-6">
    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>60-second tour · step {step + 1} of {steps.length}</span><button type="button" className="underline" onClick={() => setStep(null)}>Close</button></div>
    <div className="mt-2 h-1 rounded-full bg-secondary"><div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
    <h2 className="mt-3 text-lg font-semibold">{current.title}</h2>
    <p className="mt-1 text-sm leading-6 text-muted-foreground">{current.text}</p>
    <div className="mt-4 flex flex-wrap justify-end gap-2">
      {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft />Back</Button>}
      {current.run && ran.current !== step ? <Button onClick={() => { current.run!(); ran.current = step; window.setTimeout(next, 700); }}>{current.cta} <ArrowRight /></Button>
        : <Button onClick={next}>{last ? 'Finish' : <>Next <ArrowRight /></>}</Button>}
    </div>
  </div>;
}

export function DeskSwitch({ active }: { active: 'receivables' | 'lender' }) {
  const item = (key: string, href: string, label: string) => <a href={href} aria-current={active === key ? 'page' : undefined} className={'rounded-md px-3 py-1.5 text-sm font-medium no-underline ' + (active === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</a>;
  return <nav aria-label="Switch workspace" className="flex rounded-lg bg-secondary p-1">{item('receivables', '/demo', 'Receivables desk')}{item('lender', '/lender-demo', 'Lender desk')}</nav>;
}
