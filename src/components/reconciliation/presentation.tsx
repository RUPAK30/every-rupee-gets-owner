import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { money, type Workspace, type SalesApproval } from '@/lib/reconciliation/engine';
import { computePresentationNumbers } from '@/lib/reconciliation/presentation';

export const industrySources = [
  { text: 'Deductions can run 10–20% of revenue', source: 'Credit Research Foundation, via HighRadius', href: 'https://www.highradius.com/finsider/deduction-metrics-enterprises/' },
  { text: '41 days on average to resolve a deduction; 87% of enterprises auto-write off some short-pays', source: 'HighRadius analysis; Attain Consulting & Credit Research Foundation 2021 survey', href: 'https://www.highradius.com/finsider/deduction-metrics-enterprises/' },
  { text: 'Cello World FY26: revenue up 9% to ₹2,324 Cr', source: 'BW Retail World, 28 May 2026. The cited article does not establish receivables growth of 14% or revenue growth of 8.8%.', href: 'https://bwretailworld.com/companies/cello-worlds-fy26-profit-dips-9-revenue-at-rs-2324-cr' },
];

export function BuilderStrip() {
  return <div className="er-app er-builder border-y border-border bg-background px-4 py-2 text-xs">
    <div className="mx-auto grid max-w-7xl gap-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <p className="m-0 min-w-0 leading-5">Designed &amp; built by Rupak Ghanpathi · ex-HDFC Bank BA · <a href="https://everyrupee-o2c.vercel.app/#proof" className="underline" title="Rules and acceptance tests belong to the linked full desk">16 finance rules · 31 acceptance tests</a></p>
      <div className="flex items-center gap-1"><Button size="sm" variant="ghost" asChild><a href="mailto:rupakr2g@gmail.com">Let's talk</a></Button><Button size="sm" variant="ghost" asChild><a href="https://www.linkedin.com/in/rupak-ghanpathi" target="_blank" rel="noreferrer">LinkedIn</a></Button><Button size="sm" variant="ghost" asChild><a href="https://rupak-lemon.vercel.app" target="_blank" rel="noreferrer">Portfolio</a></Button></div>
    </div>
  </div>;
}

type HeaderProps = { onTour?: () => void; onBatch?: () => void; onReset?: () => void; onExport?: () => void; benchmark?: boolean };
export function PresentationHeader({ onTour, onBatch, onReset, onExport, benchmark }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const action = (run?: () => void) => { setOpen(false); run?.(); };
  return <header className="er-app er-presentation-header border-b border-border bg-card">
    <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-1 px-3 py-2 sm:px-8">
      <a href="/" aria-label="Every Rupee home" className="flex min-w-0 items-center gap-1.5 font-semibold text-foreground no-underline"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">₹</span><span className="text-xs sm:text-base">Every Rupee</span></a>
      <div className="flex shrink-0 items-center gap-1">
        {onTour ? <Button className="text-xs" onClick={onTour}>▶ 60-second tour</Button> : <Button className="text-xs" asChild><a href="/demo?tour=1">▶ 60-second tour</a></Button>}
        <Button variant="ghost" className="text-xs" asChild><a href="mailto:rupakr2g@gmail.com">Let's talk</a></Button>
        <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu" title="Menu"><Menu /></Button></SheetTrigger>
          <SheetContent side="right" className="er-app er-menu w-full max-w-none overflow-y-auto lg:w-[360px] lg:max-w-[360px]">
            <SheetTitle>Every Rupee</SheetTitle><SheetDescription>Desks, sample actions &amp; sources</SheetDescription>
            <nav aria-label="Side menu" className="mt-5 grid gap-1">
              {[['Receivables desk', '/demo'], ['Lender desk', '/lender-demo'], ['Capability status', '/capabilities'], ['Your workspace', '/workspace']].map(([label, href]) => <Button key={label} variant="ghost" className="justify-start" asChild><a href={href}>{label}</a></Button>)}
              {onBatch ? <Button variant="ghost" className="justify-start" onClick={() => action(onBatch)}>{benchmark ? 'Back to 4-bill sample' : 'Load 25-bill batch'}</Button> : <Button variant="ghost" className="justify-start" asChild><a href="/demo?batch=25">Load 25-bill batch</a></Button>}
              {onReset ? <Button variant="ghost" className="justify-start" onClick={() => action(onReset)}>Reset sample</Button> : <Button variant="ghost" className="justify-start" asChild><a href="/demo">Reset sample</a></Button>}
              {onExport ? <Button variant="ghost" className="justify-start" onClick={() => action(onExport)}>Export</Button> : <Button variant="ghost" className="justify-start" asChild><a href="/demo?export=1">Export</a></Button>}
              <Button variant="ghost" className="justify-start" asChild><a href="/capabilities">Release limitations</a></Button>
              <details className="border-t border-border pt-2"><summary className="cursor-pointer py-3 text-sm font-medium">Sources</summary><ol className="grid gap-3 pl-4 text-xs leading-5">{industrySources.map((source, i) => <li key={i}><a href={source.href} target="_blank" rel="noreferrer" className="underline">{source.source}</a></li>)}<li><a href="https://www.apqc.org/resource-library" className="underline">APQC resource library · cited 20-minute saving assumption, not a measured result</a></li></ol></details>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}

export function IndustryHook() {
  return <section aria-label="Published industry data" className="er-industry border-b border-border pb-3">
    <h1 className="m-0 max-w-[85ch] text-base font-semibold leading-6 sm:text-xl sm:leading-7">Distributors pay short. The gap sits unowned for weeks, then quietly gets written off. This desk gives every missing rupee an owner on Day 0.</h1>
    <p className="mb-1 mt-3 text-[10px] font-semibold uppercase text-muted-foreground">Published industry data</p>
    <ul className="m-0 grid list-none gap-1 p-0 text-xs leading-4 lg:grid-cols-3 lg:gap-4">{industrySources.map((source, i) => <li key={i} className="min-w-0">{source.text}<sup><a href={source.href} target="_blank" rel="noreferrer" aria-label={`Source ${i + 1}: ${source.source}`} title={source.source} className="er-source inline-flex min-h-11 min-w-6 items-center justify-center font-semibold text-primary underline">{i + 1}</a></sup></li>)}</ul>
  </section>;
}

function AnimatedNumber({ value, currency = true }: { value: number; currency?: boolean | undefined }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(value); return; }
    const start = performance.now(), from = shown;
    let frame = 0;
    const tick = (now: number) => { const t = Math.min(1, (now - start) / 450); setShown(Math.round(from + (value - from) * t)); if (t < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span>{currency ? money(shown) : `${(shown / 60).toFixed(1)} h`}</span>;
}

export function NumbersBand({ w, approvals }: { w: Workspace; approvals?: SalesApproval[] }) {
  const n = computePresentationNumbers(w, approvals);
  const [shorts, setShorts] = useState(''), [bills, setBills] = useState('');
  const identifiedGaps = w.invoices.filter(i => w.allocations.some(a => a.invoiceId === i.id)).reduce((s, i) => s + i.amount - w.allocations.filter(a => a.invoiceId === i.id).reduce((sum, a) => sum + a.amount, 0), 0);
  const leakageRatio = identifiedGaps > 0 ? n.leakageStoppedPaise / identifiedGaps : 0;
  const triageRatio = n.totalBills > 0 ? n.autoTriagedBills / n.totalBills : 0;
  const monthlyLeakage = Math.round((Number(shorts) || 0) * 100 * leakageRatio);
  const monthlyMinutes = (Number(bills) || 0) * triageRatio * 20;
  const tiles = [
    { label: 'Cash identified', value: n.cashIdentifiedPaise, meaning: 'Cash you can count on, so DSO drops.', how: 'How: sum of cash paired with bills; matching alone does not change DSO.' },
    { label: 'Leakage stopped', value: n.leakageStoppedPaise, meaning: 'Margin kept.', how: 'How: unapproved, over-cap or expired gaps flagged for Sales; not recovered cash.' },
    { label: 'Silent write-offs', value: n.silentWriteOffsPaise, meaning: 'Every short rupee has an owner (BR-4, BR-5).', how: 'How: no write-off action; unassigned gaps stay open until owned.' },
    { label: 'Team hours saved', value: n.manualMinutesSaved, meaning: '20 min saved per auto-triaged bill (APQC).', how: `How: ${n.autoTriagedBills}/${n.totalBills} bills × 20 min; estimated, not measured.`, currency: false },
  ];
  return <section data-tour="numbers" aria-label="What this does to your numbers" className="er-numbers py-3">
    <h2 className="m-0 text-xs font-semibold uppercase">What this does to your numbers</h2><p className="mb-2 mt-1 text-[10px] text-muted-foreground">Estimated from this sample · updates as you work</p>
    <div className="grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-4">{tiles.map(tile => <div key={tile.label} className="min-w-0 border-l-2 border-border pl-2"><h3 className="m-0 text-xs font-semibold">{tile.label}</h3><p className="my-1 break-words text-lg font-bold tabular-nums sm:text-xl"><AnimatedNumber value={tile.value} currency={tile.currency} /></p><p className="m-0 text-xs leading-4">{tile.meaning}</p><p className="mb-0 mt-1 text-[10px] leading-3.5 text-muted-foreground">{tile.how}</p></div>)}</div>
    <details className="mt-2 border-t border-border"><summary className="cursor-pointer py-3 text-xs font-semibold">Scale to your business</summary><div className="grid gap-2 text-xs sm:grid-cols-2"><label>Monthly short-payment ₹<input className="er-input mt-1 w-full" type="number" min="0" value={shorts} onChange={e => setShorts(e.target.value)} /></label><label>Bills per month<input className="er-input mt-1 w-full" type="number" min="0" step="1" value={bills} onChange={e => setBills(e.target.value)} /></label></div><p className="my-2 text-xs">Per month: {money(monthlyLeakage)} flagged · {(monthlyMinutes / 60).toFixed(1)} h saved. Per year: {money(monthlyLeakage * 12)} flagged · {(monthlyMinutes / 60 * 12).toFixed(1)} h saved.</p><p className="text-[10px] leading-4 text-muted-foreground">Current matched-gap flag ratio {(leakageRatio * 100).toFixed(1)}%; {n.autoTriagedBills}/{n.totalBills} bills auto-triaged × 20 min; 12 months, unchanged mix; unmatched gaps excluded. Estimate, not a guarantee.</p></details>
  </section>;
}

export function DesignDecisions() {
  return <details className="er-decisions mt-4 rounded-lg border border-border bg-card px-3"><summary className="cursor-pointer py-3 text-sm font-semibold">Why I built it this way</summary><ul className="mb-3 grid list-none gap-2 p-0 text-xs leading-5">{[
    'No automatic write-offs: silent write-offs are where margin disappears.',
    'Strict bill-number matching, no guessing: a wrong match is worse than a held payment.',
    'Two people above ₹10,000: small gaps close fast, big ones get a second check.',
    'ServiceNow simulated, not integrated: shows the workflow shape without pretending to have access.',
    'Validate first: interview 3 AR teams on deduction ageing before building more.',
  ].map(text => <li key={text}>{text}</li>)}</ul></details>;
}