import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { money, autoMatch, benchmarkWorkspace, benchmarkApprovals, computeDeskImpact, type Workspace, type SalesApproval } from '@/lib/reconciliation/engine';
import { computePresentationNumbers } from '@/lib/reconciliation/presentation';

export const industrySources = [
  { text: 'Deductions can run 10–20% of revenue', source: 'Credit Research Foundation, via HighRadius', href: 'https://www.highradius.com/finsider/deduction-metrics-enterprises/' },
  { text: '41 days on average to resolve a deduction; 87% of enterprises auto-write off some short-pays', source: 'HighRadius analysis; Attain Consulting & Credit Research Foundation 2021 survey', href: 'https://www.highradius.com/finsider/deduction-metrics-enterprises/' },
  { text: 'Cello World FY26: revenue up 9% to ₹2,324 Cr', source: 'BW Retail World, 28 May 2026. The cited article does not establish receivables growth of 14% or revenue growth of 8.8%.', href: 'https://bwretailworld.com/companies/cello-worlds-fy26-profit-dips-9-revenue-at-rs-2324-cr' },
];

export function BuilderStrip({ compact = false }: { compact?: boolean }) {
  return <div className="er-app er-builder border-y border-border bg-background px-4 py-2 text-xs">
    <div className="mx-auto grid max-w-7xl gap-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <p className="m-0 min-w-0 leading-5">{compact ? 'Built' : 'Designed & built'} by Rupak Ghanpathi · ex-HDFC Bank BA · <a href="https://everyrupee-o2c.vercel.app/#proof" className="underline" title="Rules and acceptance tests belong to the linked full desk">16 finance rules · {compact ? '31 tests' : '31 acceptance tests'}</a></p>
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
              <details className="border-t border-border pt-2"><summary className="cursor-pointer py-3 text-sm font-medium">Sources</summary><ol className="grid gap-3 pl-4 text-xs leading-5"><li><a href={industrySources[1]?.href} target="_blank" rel="noreferrer" className="underline">HighRadius · Attain/CRF 2021 survey</a></li><li><a href={auditSource} target="_blank" rel="noreferrer" className="underline">ICAI · audit-trail requirements</a></li>{onTour && <li><span>20-minute saving per bill is my assumption, to validate in a pilot</span></li>}</ol></details>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}

export function IndustryHook() {
  return <section aria-label="Published industry data" className="er-industry border-b border-border pb-3">
    <h1 className="m-0 max-w-[85ch] text-base font-semibold leading-6 sm:text-xl sm:leading-7">Short-paid bills sit unowned for <a className="text-primary underline" href={industrySources[1]?.href} target="_blank" rel="noreferrer">41 days</a> on average, then get quietly written off. I built the desk that gives every missing rupee an owner on Day 0, with ₹0 silent write-offs.</h1>
    <p className="mb-0 mt-2 text-[10px] text-muted-foreground">41 days is published average resolution time, not measured time without an owner. Portfolio case study · sample data.</p>
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
  const monthlyLeakage = Math.round(Math.max(0, Number(shorts) || 0) * 100 * leakageRatio);
  const monthlyMinutes = Math.max(0, Number(bills) || 0) * triageRatio * 20;
  const tiles = [
    { label: 'Cash identified', value: n.cashIdentifiedPaise, meaning: 'Cash you can count on, so DSO drops.', how: 'How: sum of cash paired with bills; matching alone does not change DSO.' },
    { label: 'Leakage stopped', value: n.leakageStoppedPaise, meaning: 'Margin kept.', how: 'How: unapproved, over-cap or expired gaps flagged for Sales; not recovered cash.' },
    { label: 'Silent write-offs', value: n.silentWriteOffsPaise, meaning: 'Every short rupee has an owner (BR-4, BR-5).', how: 'How: no write-off action; unassigned gaps stay open until owned.' },
    { label: 'Team hours saved', value: n.manualMinutesSaved, meaning: '20 min saved per auto-triaged bill (my assumption, to test in a pilot).', how: `How: ${n.autoTriagedBills}/${n.totalBills} bills × 20 min; estimated, not measured.`, currency: false },
  ];
  return <section data-tour="numbers" aria-label="What this does to your numbers" className="er-numbers py-3">
    <h2 className="m-0 text-xs font-semibold uppercase">What this does to your numbers</h2><p className="mb-2 mt-1 text-[10px] text-muted-foreground">Estimated from this sample · updates as you work</p>
    <div className="grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-4">{tiles.map(tile => <div key={tile.label} className="min-w-0 border-l-2 border-border pl-2"><h3 className="m-0 text-xs font-semibold">{tile.label}</h3><p className="my-1 break-words text-lg font-bold tabular-nums sm:text-xl"><AnimatedNumber value={tile.value} currency={tile.currency} /></p><p className="m-0 text-xs leading-4">{tile.meaning}</p><p className="mb-0 mt-1 text-[10px] leading-3.5 text-muted-foreground">{tile.how}</p></div>)}</div>
    <details className="mt-2 border-t border-border"><summary className="cursor-pointer py-3 text-xs font-semibold">Scale to your business</summary><div className="grid gap-2 text-xs sm:grid-cols-2"><label>Monthly short-payment ₹<input className="er-input mt-1 w-full" type="number" min="0" value={shorts} onChange={e => setShorts(e.target.value)} /></label><label>Bills per month<input className="er-input mt-1 w-full" type="number" min="0" step="1" value={bills} onChange={e => setBills(e.target.value)} /></label></div><p className="my-2 text-xs">Per month: {money(monthlyLeakage)} flagged · {(monthlyMinutes / 60).toFixed(1)} h saved. Per year: {money(monthlyLeakage * 12)} flagged · {(monthlyMinutes / 60 * 12).toFixed(1)} h saved.</p><p className="text-[10px] leading-4 text-muted-foreground">Current matched-gap flag ratio {(leakageRatio * 100).toFixed(1)}%; {n.autoTriagedBills}/{n.totalBills} bills auto-triaged × 20 min; 12 months, unchanged mix; unmatched gaps excluded. Estimate, not a guarantee.</p></details>
  </section>;
}

export function DesignDecisions() {
  return <div className="mt-4 grid gap-3 lg:grid-cols-2"><details className="er-decisions rounded-lg border border-border bg-card px-3"><summary className="cursor-pointer py-3 text-sm font-semibold">Why I built it this way</summary><ul className="mb-3 grid list-none gap-2 p-0 text-xs leading-5">{[
    'No automatic write-offs: silent write-offs are where margin disappears.',
    'Strict bill-number matching, no guessing: a wrong match is worse than a held payment.',
    'Two people above ₹10,000: small gaps close fast, big ones get a second check.',
    'ServiceNow simulated, not integrated: shows the workflow shape without pretending to have access.',
    'Validate first: interview 3 AR teams on deduction ageing before building more.',
  ].map(text => <li key={text}>{text}</li>)}</ul><p className="mb-3 text-xs leading-5">What I'd do differently: I set the ₹10,000 two-person limit from experience, not data; a pilot would size it against the customer's gap distribution.</p></details><ReadyFromDayOne /></div>;
}

const auditSource = 'https://cajournal.icai.org/article-details/audit-trail-requirements-responsibilities';
export function BeforeAfterScorecard() {
  const impact = computeDeskImpact(autoMatch(benchmarkWorkspace()), benchmarkApprovals());
  const rows = [
    ['Short payment spotted', 'Days later · illustrative manual workflow', 'Day 0, when the bank file is imported and exact references are matched', 'Enforced', '/demo'],
    ['Bills checked by hand', `All ${impact.totalBills} · illustrative manual workflow`, `${impact.autoTriagedBills} of ${impact.totalBills} auto-triaged, ~${(impact.manualMinutesSaved / 60).toFixed(1)} h saved per ${impact.totalBills} bills · 20 min saving assumption`, 'Computed', '/demo?batch=25'],
    ['Silent write-offs', '87% of enterprises auto-write off some short-pays · Attain/CRF 2021 survey', '₹0, blocked by rule BR-4', 'Enforced', industrySources[1]?.href],
    ['Gaps over ₹10,000', 'One person decides · illustrative baseline, not published industry data', 'Two people, and nobody approves their own (BR-5); full workflow in linked canonical desk', 'Enforced', 'https://everyrupee-o2c.vercel.app/desk.html'],
    ['Edited history', 'Since FY24 auditors must report whether the audit trail “has not been tampered with”', 'Hash-chained history, daily anchor drill, caught in one click · auditor sharing simulated', 'Enforced', auditSource],
    ['Time to resolve a deduction', '41 days average · HighRadius', 'Owner on Day 0; 3–7 days · pilot target, not achieved customer results', 'Pilot target', industrySources[1]?.href],
  ];
  return <section className="er-scorecard py-3" aria-label="Before → after scorecard"><h2 className="mb-2 text-sm font-semibold">Before → after</h2><table className="w-full text-left text-xs"><thead><tr>{['What changes', 'Before / source', 'With Every Rupee', 'Type'].map(t => <th className="border-b border-border p-2" key={t}>{t}</th>)}</tr></thead><tbody>{rows.map(([what, before, after, type, href]) => <tr key={what}><th className="border-b border-border p-2 font-semibold" scope="row">{what}</th><td className="border-b border-border p-2" data-label="Before"><a href={href} target="_blank" rel="noreferrer" className="underline">{before}</a></td><td className="border-b border-border p-2" data-label="With Every Rupee">{after}</td><td className="border-b border-border p-2"><span className={`inline-block rounded px-2 py-1 font-semibold ${type === 'Enforced' ? 'bg-money-ok/10 text-money-ok' : type === 'Computed' ? 'er-computed-tag' : 'bg-money-wip/10 text-money-wip'}`}>{type}</span></td></tr>)}</tbody></table></section>;
}

export function AuditFraming() {
  return <div className="my-3 text-xs leading-5"><h3 className="text-sm font-semibold">SHA-256 record: the better fit</h3><p className="my-1">Designed around the MCA audit-trail standard for receivables and credit notes, which are books of account: since FY 2023-24, accounting software must keep an edit log that can't be disabled, and the auditor reports whether it was tampered with (<a href={auditSource} className="underline" target="_blank" rel="noreferrer">Rule 3(1), Rule 11(g); 8-year retention</a>).</p><p className="my-1">Tamper-evident, not tamper-proof: uses independent digest comparison, as in <a className="underline" href="https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview" target="_blank" rel="noreferrer">Microsoft's SQL Ledger</a>, not its full protection model. It supports the auditor's Rule 11(g) check; it is not a compliance certificate.</p><p className="my-1 text-muted-foreground">Daily anchor and auditor delivery are simulated in this session. No statutory delivery, disabled-log enforcement or 8-year retention service is implemented.</p></div>;
}

function ReadyFromDayOne() {
  const rows = [['Requirements', '25+ BRDs/FRDs; templates cut clarification queries 25%', '16 rules written as testable specs'], ['UAT & releases', '20+ UAT cycles, 95% of defects fixed pre-release', '31 acceptance tests, runnable on the canonical case study'], ['Controls', 'Maker-checker; zero findings across 4–5 SOX audits', 'Two-person approval, no write-offs, sealed record'], ['Change management', 'ServiceNow change requests with PVT sign-off', 'Rule change requests through ServiceNow ITIL Change · simulated'], ['KPIs & MIS', 'Weekly MIS of 15+ KPIs; prep 8h → 3h', 'The before → after scorecard']];
  return <details className="rounded-lg border border-border bg-card px-3"><summary className="cursor-pointer py-3 text-sm font-semibold">Ready from day one</summary><p className="text-[10px] text-muted-foreground">HDFC Bank figures: builder-reported experience. Rules and 31 acceptance tests: linked canonical desk, not customer results.</p><div className="er-readiness grid text-xs">{['Your team needs', 'I did it at HDFC Bank', 'Visible here'].map(h => <strong className="hidden border-b border-border py-2 lg:block" key={h}>{h}</strong>)}{rows.map(([need, did, visible]) => <div className="contents" key={need}><strong className="border-b border-border py-2">{need}</strong><p className="m-0 border-b border-border py-2">{did}</p><p className="m-0 border-b border-border py-2">{visible}</p></div>)}</div><p className="my-3 text-xs leading-5">Week one with your team: map your deduction flow, write the rules, run UAT with three users.</p><Button size="sm" variant="outline" asChild><a href="mailto:rupakr2g@gmail.com">Let's talk</a></Button></details>;
}