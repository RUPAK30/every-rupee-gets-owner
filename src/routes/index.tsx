import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent } from "react";
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCheck, CircleDollarSign, History, ChevronDown } from 'lucide-react';
import { PhoneStory } from '@/components/reconciliation/phone-story';
import { PlainWords, NotBuilt } from '@/components/reconciliation/plain-words';
import { invoiceBalance, money } from '@/lib/reconciliation/engine';
import { DemoRequest } from '@/components/reconciliation/demo-request';
import { PresentationHeader, BuilderStrip, BeforeAfterScorecard, DesignDecisions } from '@/components/reconciliation/presentation';
import { autoMatch, benchmarkWorkspace, benchmarkApprovals, computeDeskImpact } from '@/lib/reconciliation/engine';
import capturedCSS from "../styles/site.css?raw";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Every Rupee · Short-payment reconciliation" },
    { name: "description", content: "Every Rupee is a short-payment reconciliation desk for FMCG finance teams. Every gap gets a reason, an owner and an ending." },
    { property: "og:title", content: "Every Rupee · Short-payment reconciliation" },
    { property: "og:description", content: "Explore the deduction workflow, sample cases and cash-cost calculator by Rupak Ghanpathi." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  staticData: { importedDocument: { html: { "lang": "en" }, body: {  } } },
  component: Index,
});

function Index() {
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [deadline, setDeadline] = useState<number | null | undefined>(undefined);
  const openHash = (hash: string) => {
    const target = document.getElementById(hash.slice(1));
    const detail = target?.closest('details');
    if (detail?.id) setOpenDetails(previous => ({ ...previous, [detail.id]: true }));
    requestAnimationFrame(() => target?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  useEffect(() => {
    if (location.hash) openHash(location.hash);
    // Deadline: 30 November 2026, end of day IST (UTC+5:30). Computed in UTC so it is correct from any timezone.
    const end = Date.UTC(2026, 10, 30, 18, 29, 59); // 2026-11-30 23:59:59 IST
    const now = Date.now();
    // Whole calendar days left, by IST date (30 Nov counts as the last day, 0 = today).
    const ist = new Date(now + 5.5 * 3600000);
    const todayIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
    setDeadline(now > end ? null : Math.round((Date.UTC(2026, 10, 30) - todayIst) / 86400000));
  }, []);
  const followAnchor = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href^="#"]');
    const hash = link?.getAttribute('href');
    if (!hash || !document.getElementById(hash.slice(1))?.closest('details')) return;
    event.preventDefault();
    history.replaceState(null, '', hash);
    openHash(hash);
  };
  return (
    <div onClick={followAnchor}>
      <style>{capturedCSS}</style>
      <PresentationHeader />
      <main className="col my-0 mx-auto max-w-[1200px]">
        <HomepagePromise /><PhoneStory />
        <ImportedSectionADistributorPaysShort />
        <details id="detail-how" className="er-app border-b border-border"><summary className="cursor-pointer py-3 text-sm font-semibold">How it works · 3 steps</summary><QuickTour /></details><div className="er-app"><DesignDecisions /></div>
        <details className="er-app border-y border-border"><summary className="cursor-pointer py-3 text-sm font-semibold">Lender desk</summary><CanonicalWorkflows /></details>
        <details className="er-app border-b border-border"><summary className="cursor-pointer py-3 text-sm font-semibold">ServiceNow simulated workflow</summary><ServiceNowITILSection /></details>
        <ImportedSectionOpenWhatYouCare openDetails={openDetails} setOpenDetails={setOpenDetails} deadline={deadline} /><div className="er-app"><PlainWords /><NotBuilt /></div>
        <ImportedSection2 />
      </main>
      <ImportedFooter />
      <a href="#contact" className="hidden">Let's talk</a>
    </div>
  );
}

function HomepagePromise() {
  const w = autoMatch(benchmarkWorkspace());
  const short = w.invoices.filter(i => w.allocations.some(a => a.invoiceId === i.id) && invoiceBalance(w, i.id) > 0);
  const exception = (id: string) => w.exceptions.find(e => e.invoiceId === id);
  const billed = w.invoices.reduce((sum, i) => sum + i.amount, 0);
  const unowned = short.filter(i => !exception(i.id)?.owner).reduce((sum, i) => sum + invoiceBalance(w, i.id), 0);
  const unexplained = short.filter(i => !exception(i.id)?.reason || exception(i.id)?.reason === 'Unexplained').reduce((sum, i) => sum + invoiceBalance(w, i.id), 0);
  const sampleDay = [...w.receipts.map(r => r.date)].sort().at(-1) ?? '';
  const aged = short.filter(i => (Date.parse(sampleDay) - Date.parse(i.date)) / 86400000 > 15).reduce((sum, i) => sum + invoiceBalance(w, i.id), 0);
  const totalShort = short.reduce((sum, i) => sum + invoiceBalance(w, i.id), 0);
  const ownedPercent = totalShort ? Math.round((totalShort - unowned) / totalShort * 100) : 0;
  const tiles = [
    { value: money(unexplained), long: 'Short-paid with no recorded reason', short: 'No reason', id: 'INV-104' },
    { value: money(aged), long: 'Short-paid bills older than 15 days', short: '15+ days old', id: 'INV-101' },
    { value: '₹0', long: 'Silently written off in this desk', short: 'Silent write-offs', id: 'INV-102' },
    { value: `${ownedPercent}%`, long: 'Short-paid ₹ with an owner · Day 0 target: 100%', short: '₹ with an owner', id: 'INV-108' },
  ];
  return <section className="er-app er-money-hero" aria-label="Every Rupee at a glance">
    <div className="er-hero-grid"><div><p className="er-eyebrow">EVERY RUPEE · RECEIVABLES WORKBENCH</p><h1>Customers pay less than the bill. The missing money usually belongs to nobody.</h1><p className="er-hero-sub">Every Rupee gives every missing rupee a reason, an owner and a deadline on Day 0, and keeps proof nobody can quietly change.</p><p className="er-author-line">Built by Rupak Ghanpathi, ex-HDFC Bank BA: requirements → rules → tests → a working product.</p><div className="er-hero-actions"><Button asChild><Link to="/demo">Open the desk</Link></Button><Button variant="outline" asChild><a href="#walkthrough">See one case</a></Button><Button variant="ghost" asChild><a href="mailto:rupakr2g@gmail.com">Let’s talk</a></Button></div></div>
      <aside className="er-sample-money"><p className="text-xs font-semibold uppercase text-muted-foreground">Computed from existing sample data</p><h2>On {w.invoices.length} sample bills worth <b>{money(billed)}</b>, Every Rupee found <b className="text-money-risk">{money(unowned)} unowned</b></h2><div className="er-live-tiles">{tiles.map(t => <a key={t.id + t.short} href={`/demo?batch=25#case/${t.id}`}><strong>{t.value}</strong><span className="er-long-label">{t.long}</span><span className="er-short-label">{t.short}</span><span className="er-tile-arrow" aria-hidden="true">↗</span></a>)}</div><p className="er-explanation mt-3 text-[10px] leading-4 text-muted-foreground">Matched short-payments only; the unreferenced receipt stays held. Ageing is at {sampleDay}. Ownership is the current sample state, not timestamped proof of Day 0. ₹0 is actual write-offs, not hypothetical loss prevented.</p></aside>
    </div>
    <div className="er-outcome-chips">{[[UserCheck, 'Day 0 · every gap gets an owner'], [CircleDollarSign, '₹0 silent write-offs'], [History, 'Every edit shows']].map(([Icon, label]) => { const Symbol = Icon as typeof UserCheck; return <div key={String(label)}><Symbol size={20}/><b>{String(label)}</b></div>; })}</div>
    <details className="er-curiosity"><summary><span>A customer pays ₹1,00,000 short. How long can a deduction take to resolve?</span><ChevronDown size={18}/></summary><p><b>About 41 days on average</b> · <a href="https://www.highradius.com/finsider/deduction-metrics-enterprises/" target="_blank" rel="noreferrer" className="underline">HighRadius ↗</a>. Every Rupee’s goal: an owner on Day 0. The published figure is resolution time, not time without an owner.</p></details>
    <WorthCalculator />
    <BuilderStrip compact />
    <details className="border-b border-border"><summary className="cursor-pointer py-3 text-sm font-semibold">Sources, numbers &amp; trust tags</summary><BeforeAfterScorecard /></details>
  </section>;
}
function WorthCalculator() {
  const [v, setV] = useState([500, 2, 25, 10]);
  const annual = (v[0] ?? 0) * 10000000 * (v[1] ?? 0) / 100;
  const atRisk = annual * (v[2] ?? 0) / 100 * (v[3] ?? 0) / 100;
  const crore = (rupees: number) => `₹${(rupees / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} crore`;
  const sliders = [['Revenue (₹ crore / year)', 50, 2000, 50], ['Billing short-paid (%)', 0, 20, 0.5], ['Short-paid ₹ with no reason (%)', 0, 100, 1], ['Unexplained ₹ written off (%)', 0, 100, 1]] as const;
  return <section className="er-worth" id="worth"><p className="er-eyebrow">WHAT IT COULD BE WORTH · ESTIMATE</p><p className="er-worth-sentence">A {crore(v[0] ? v[0] * 10000000 : 0)} company with {v[1]}% of billing short-paid has <b>{crore(annual)} a year to chase</b>; <b className="text-money-risk">{money(Math.round(atRisk * 100))}</b> of it is at risk of silent write-off.</p><div className="er-worth-bar" aria-label="Annual short-paid money compared with assumed write-off risk"><div className="er-worth-safe" style={{ flexGrow: Math.max(1, annual - atRisk) }}/><div className="er-worth-risk" style={{ flexGrow: Math.max(1, atRisk) }}/></div><div className="er-worth-legend"><span>To chase · {crore(annual)}</span><span>At risk · {money(Math.round(atRisk * 100))}</span></div><div className="er-range-grid">{sliders.map(([label, min, max, step], i) => <label key={label}><span>{label}<b>{v[i]}</b></span><input aria-label={label} type="range" min={min} max={max} step={step} value={v[i]} onChange={e => setV(values => values.map((x, n) => n === i ? Number(e.target.value) : x))}/></label>)}</div><p className="er-assumptions text-[10px] text-muted-foreground">All defaults (₹500 crore, 2%, 25%, 10%) are illustrative assumptions, not published rates. <a href="https://www.highradius.com/finsider/deduction-metrics-enterprises/" className="underline" target="_blank" rel="noreferrer">HighRadius / Attain-CRF</a> reports prevalence of write-offs, not these percentages. Replace them with your own figures. Revenue × short-paid % × no-reason % × write-off %. Estimate, not a promise.</p></section>;
}

const steps = [
  ["1", "Import", "Upload invoices and receipts as CSV files."],
  ["2", "Auto-match", "Exact reference matches are paired. Unclear ones are never guessed."],
  ["3", "Resolve", "Each gap gets an owner who handles that kind of problem. Above ₹10,000, a second person approves. Every action is logged."],
];

function QuickTour() {
  return (
    <section className="er-app my-6 grid gap-4" aria-labelledby="tour-h">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">How it works</p>
        <h2 id="tour-h" className="mt-1 text-xl font-bold sm:text-2xl">From messy payments to owned gaps in 3 steps</h2>
        <ol className="mt-3 list-none p-0 grid gap-2 sm:gap-4 sm:grid-cols-3">
          {steps.map(([n, t, d]) => (
            <li key={n} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 rounded-lg border border-border bg-card p-3 sm:block sm:p-4">
              <span className="row-span-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground sm:h-8 sm:w-8">{n}</span>
              <h3 className="font-semibold sm:mt-2.5">{t}</h3><p className="mt-0.5 text-sm text-muted-foreground sm:mt-1">{d}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-3 text-xs sm:text-sm text-muted-foreground">
        <p><b className="text-foreground">Working today:</b> CSV import, auto-match, manual allocation, exceptions, private saved workspaces. <b className="text-foreground">Planned:</b> bank &amp; ERP connections.</p>
        <Link to="/capabilities" className="font-semibold text-foreground underline">Full status →</Link>
      </div>
    </section>
  );
}

function ServiceNowITILSection() {
  return (
    <div className="er-app my-6">
      <section className="rounded-2xl border-2 border-primary/30 bg-card p-5 sm:p-6 shadow-sm" aria-labelledby="sn-mode">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Enterprise ITIL Architecture · ServiceNow Table API</p>
            <h2 id="sn-mode" className="mt-1 text-xl font-bold sm:text-2xl text-foreground">Dispute cases &amp; finance rule changes</h2>
          </div>
          <Button asChild size="sm" className="min-h-9 text-primary-foreground! no-underline!"><a href="/demo?sn=1">▶ Open Interactive ServiceNow Hub ↗</a></Button>
        </div>
        <p className="mt-2 max-w-[70ch] text-sm leading-6 text-muted-foreground">
          Short payments become dispute cases, modelled on SAP S/4HANA Dispute Management: residual item, reason, cause, amount and owner. ServiceNow ITIL <code>change_request</code> is reserved for changes to finance rules; both workflows here are simulations.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-3.5">
            <span className="text-xs font-bold text-primary">1 · Dispute SLA tiers</span>
            <p className="mt-1 text-xs font-semibold text-foreground">Normal vs. Emergency disputes</p>
            <p className="mt-1 text-xs text-muted-foreground">7-day standard SLA vs. 2-day compressed emergency SLA with illustrative TAT monitoring.</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3.5">
            <span className="text-xs font-bold text-primary">2 · Mandatory Proof Gate</span>
            <p className="mt-1 text-xs font-semibold text-foreground">Signed GRN / POD Upload</p>
            <p className="mt-1 text-xs text-muted-foreground">The simulated case can’t close until delivery proof is attached via <code>sys_attachment</code>.</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-3.5">
            <span className="text-xs font-bold text-primary">3 · HoD &amp; PVT Sign-off</span>
            <p className="mt-1 text-xs font-semibold text-foreground">Post-Validation Testing Gate</p>
            <p className="mt-1 text-xs text-muted-foreground">Requires Finance Head (Vikram) approval + mandatory PVT validation before state transitions to Closed (Resolved).</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CanonicalWorkflows() {
  return <div className="er-app my-6">
    <section className="border-b border-border pb-6" aria-labelledby="lender-mode">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Same engine · second desk</p>
          <h2 id="lender-mode" className="mt-1 text-xl font-semibold sm:text-2xl">Lender desk: when an EMI bounces</h2>
        </div>
        <Button asChild size="sm" className="text-primary-foreground! no-underline!"><a href="/lender-demo?tour=1">▶ Try the lender desk · 60-second tour</a></Button>
      </div>
      <p className="mt-1.5 max-w-[65ch] text-sm leading-6 text-muted-foreground">For lenders, the "short payment" is a loan instalment that fails. The bank sends a NACH return code (its reason the EMI bounced); Every Rupee turns it into a reason, an owner and a next step.</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Bounce queue · sample</span><span>3 open · RBI Aug 2023 penal rules enforced</span></div>
        {[['Code 04', 'Not enough balance', 'Collections · call, then re-present', 'bg-money-wip/15 text-money-wip'], ['Code 61', 'Mandate cancelled', 'Ops · request a fresh mandate', 'bg-money-risk/10 text-money-risk'], ['Code 06', 'Stopped by customer', 'Relationship · talk first, may be a dispute', 'bg-money-risk/10 text-money-risk']].map(([c, m, n, k]) => <div key={c} className="grid gap-1 border-b border-border px-4 py-2.5 text-sm last:border-0 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center"><span className="font-semibold">{c}</span><span>{m}</span><span className={'er-pill ' + k}>{n}</span></div>)}
      </div>
    </section>
  </div>;
}

function ImportedSectionADistributorPaysShort() {
  return (
    <details className="er-app border-b border-border" aria-labelledby="intro-title"><summary id="intro-title" className="cursor-pointer py-3 text-sm font-semibold">Explore the reconciliation sample &amp; controls</summary>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <Button asChild className="min-h-10 text-primary-foreground! no-underline!"><a href="/demo?tour=1">▶ 60-second guided demo</a></Button>
        <Button asChild variant="outline" className="min-h-10 no-underline!"><Link to="/demo">Explore on my own</Link></Button>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-md text-xs no-underline!"><Link to="/demo" search={{ history: '1' }}><ShieldCheck className="mr-1.5 size-3.5 text-primary" />SHA-256 tampering sample →</Link></Button>
        <Button asChild variant="outline" size="sm" className="h-10 border-primary/40 bg-primary/5 text-xs font-semibold text-primary no-underline! hover:bg-primary/10"><a href="/demo?sn=1">⚡ Dispute cases &amp; rule changes ↗</a></Button>
        <Button asChild variant="ghost" size="sm" className="h-10 text-xs text-muted-foreground no-underline! hover:text-foreground"><a href="https://everyrupee-o2c.vercel.app/#proof">16 rules · 31/31 tests ↗</a></Button>
      </div>

      <Link to="/demo" aria-label="Open the reconciliation sample" className="mx-auto mt-4 block max-w-[920px] overflow-hidden rounded-2xl border border-border bg-card text-left no-underline! shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Reconciliation sample preview</span><span className="flex items-center gap-1.5">Billed ₹1,91,300 · Received ₹1,73,710 · <b className="text-money-wip">Gap ₹17,590</b> · <b className="text-primary">Open desk →</b></span></div>
        <div className="grid grid-cols-2 sm:grid-cols-4">{[['INV-101', 'Aarav Distributors', '₹1,180 short', 'Scheme claim · Asha', 'text-money-wip'], ['INV-102', 'Meera Trading', '₹12,400 short', 'Scheme claim · Unowned', 'text-money-risk'], ['INV-103', 'Southern Stores', '₹31,500 unpaid', '₹28,350 unreferenced receipt held in suspense', 'text-money-risk'], ['INV-104', 'Eastern Wholesale', '₹860 short', 'No reason yet', 'text-money-risk']].map(([id, n, amt, why, c]) => <div key={id} className="min-w-0 border-b border-r border-border px-3 py-2 text-xs even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0"><p className="truncate font-medium text-foreground">{id} · {n}</p><p className={'mt-0.5 text-sm font-semibold ' + c}>{amt}</p><p className="text-muted-foreground">{why}</p></div>)}</div>
      </Link>
    </details>
  );
}

function ImportedSectionOpenWhatYouCare({ openDetails, setOpenDetails, deadline }: { openDetails: Record<string, boolean>; setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; deadline: number | null | undefined }) {
  const [values, setValues] = useState({ bill: 500, pct: 3, days: 60, rate: 12 });
  const cash = values.bill * values.pct / 100 * values.days / 30;
  const money = (value: number) => value >= 100 ? '₹' + (value / 100).toFixed(2).replace(/\.00$/, '') + ' crore' : '₹' + value.toFixed(1).replace(/\.0$/, '') + ' lakh';
  return (
    <section className="sec" id="deep">
      <p className="k text-[.74rem] font-bold tracking-[.12em]! mt-0 mr-0 mb-[8px] ml-0 text-left! uppercase">Go deeper</p>
      <h2 className="text-[clamp(1.5rem,3vw,2.1rem)]! font-bold tracking-[-.02em] leading-[1.15] mt-0 mr-auto mb-[22px] ml-auto mb-[16px]! ml-0! max-w-[30ch]! text-left!">Open what you care about</h2>
      <div className="deep gap-[10px]">
        <details id="detail-gap" open={openDetails['detail-gap'] ?? false} onToggle={event => { const open = event.currentTarget.open; setOpenDetails(previous => previous['detail-gap'] === open ? previous : { ...previous, ['detail-gap']: open }); }} className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
          <summary className="items-center cursor-pointer list-none">
            <span className="flex-1">
              <b>The gap, two ways</b>
              <em className="text-(--mut) not-italic">The same ₹12,400 gap two ways, and the chain from a public filing to a passing test.</em>
            </span>
            <i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#eef5ff] rounded-[50%] text-[#0a66d1] flex-none text-[1.1rem] not-italic h-[30px] place-items-center transition-transform duration-200 w-[30px]" aria-hidden="true">+</i>
          </summary>
          <section className="sec m-0!" id="delta">
            <p className="k text-[.74rem] font-bold tracking-[.12em]! mt-0 mr-0 mb-[8px] ml-0 text-left! uppercase">Before and after</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)]! font-bold tracking-[-.02em] leading-[1.15] mt-0 mr-auto mb-[22px] ml-auto mb-[16px]! ml-0! max-w-[30ch]! text-left!">The same ₹12,400 gap, two ways</h2>
            <div className="ba my-0 mx-auto max-w-[860px]">
              <table className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white text-[.92rem] overflow-hidden w-full">
                <thead>
                  <tr>
                    <th className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-card text-(--mut) tracking-[.06em] text-left uppercase" />
                    <th className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-card text-(--mut) tracking-[.06em] text-left uppercase">How it often runs today</th>
                    <th className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-card text-(--mut) tracking-[.06em] text-left uppercase">Canonical live desk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="text-(--ink2) font-semibold text-left w-[22%]">Explained</th>
                    <td className="text-[#8a6f6f] text-left">Day 31, if ever</td>
                    <td className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background text-(--ink) text-left [font-weight:550]">Same day, by rule</td>
                  </tr>
                  <tr>
                    <th className="text-(--ink2) font-semibold text-left w-[22%]">Where it lives</th>
                    <td className="text-[#8a6f6f] text-left">Email threads, no owner</td>
                    <td className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background text-(--ink) text-left [font-weight:550]">One case, one owner, one deadline</td>
                  </tr>
                  <tr>
                    <th className="text-(--ink2) font-semibold text-left w-[22%]">Who decides</th>
                    <td className="text-[#8a6f6f] text-left">Whoever replies first</td>
                    <td className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background text-(--ink) text-left [font-weight:550]">Regional sales head, 3-day SLA (BR-8)</td>
                  </tr>
                  <tr>
                    <th className="text-(--ink2) font-semibold text-left w-[22%]">How it ends</th>
                    <td className="text-[#8a6f6f] text-left">Silent write-off, or never</td>
                    <td className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background text-(--ink) text-left [font-weight:550]">Credit note or recovery, with a posting reference</td>
                  </tr>
                  <tr>
                    <th className="text-(--ink2) font-semibold text-left w-[22%]">Audit trail</th>
                    <td className="text-[#8a6f6f] text-left">Rebuilt from inboxes</td>
                    <td className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-background text-(--ink) text-left [font-weight:550]">Every action logged by name and time</td>
                  </tr>
                </tbody>
              </table>
              <p className="cap text-(--mut) text-[.78rem] mt-[8px] mr-[2px] mb-0 ml-[2px]">Illustrative: one gap from the sample data, traced through the workflow. "Today" is the common manual pattern, not a measured baseline.</p>
            </div>
            <p className="text-(--gd) text-[.85rem] font-semibold tracking-[.01em] mt-[14px] mr-auto mb-0 ml-auto text-center">0 write-offs by rule · maker-checker above ₹10,000. Enforced and tested in the full desk.</p>
            <p className="trk text-[.72rem] font-bold tracking-[.08em] mt-[26px] mr-0 mb-[10px] ml-0 text-center uppercase" id="trace">Traceability · every control traced from signal to screen</p>
            <ol className="tr6 gap-[10px] list-none m-0 p-0 [counter-reset:t]">
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Signal</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">Revenue up 9% to ₹2,324 Cr</b>
                <span className="text-(--mut) text-[.76rem]">Cello World FY26 · BW Retail World</span>
              </li>
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Risk</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">Short-payments sit unowned</b>
                <span className="text-(--mut) text-[.76rem]">A reason to look, not a diagnosis</span>
              </li>
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Control spec</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">US-5: no self-approval above ₹10,000</b>
                <span className="text-(--mut) text-[.76rem]">Specified, not optional</span>
              </li>
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Rule</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">BR-5 maker-checker</b>
                <span className="text-(--mut) text-[.76rem]">Blocked, logged, routed</span>
              </li>
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Test</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">UAT-06 passes</b>
                <span className="text-(--mut) text-[.76rem]">Maker tries to approve own case</span>
              </li>
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Screen</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">Vikram approves</b>
                <span className="text-(--mut) text-[.76rem]">Finance controller, in the desk</span>
              </li>
            </ol>
          </section>
        </details>
        <div className="er-app border-b border-border py-4 text-sm"><a href="https://tentoday.vercel.app/app.html#controls" className="underline">Post-sale discounts and GST credit notes are handled in Ten Today ↗</a></div>
        <details id="detail-calc" open={openDetails['detail-calc'] ?? false} onToggle={event => { const open = event.currentTarget.open; setOpenDetails(previous => previous['detail-calc'] === open ? previous : { ...previous, ['detail-calc']: open }); }} className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
          <summary className="items-center cursor-pointer list-none">
            <span className="flex-1">
              <b>What it's costing you</b>
              <em className="text-(--mut) not-italic">Plug in your own numbers, plus the one question I'd ask your team.</em>
            </span>
            <i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#eef5ff] rounded-[50%] text-[#0a66d1] flex-none text-[1.1rem] not-italic h-[30px] place-items-center transition-transform duration-200 w-[30px]" aria-hidden="true">+</i>
          </summary>
          <section className="sec m-0!" id="calc">
            <p className="k text-[.74rem] font-bold tracking-[.12em]! mt-0 mr-0 mb-[8px] ml-0 text-left! uppercase">What it's worth</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)]! font-bold tracking-[-.02em] leading-[1.15] mt-0 mr-auto mb-[22px] ml-auto mb-[16px]! ml-0! max-w-[30ch]! text-left!">See what short-payments cost you</h2>
            <div className="calc bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white rounded-[20px] gap-[18px] p-[20px] [border:1px_solid_var(--line)] [@media(min-width:780px)]:items-center [@media(min-width:780px)]:grid-cols-[1.2fr_1fr]">
              <div><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Monthly billing to distributors (₹ lakh)<input className="py-[8px] px-[10px] text-right w-full" id="bill" type="number" min="0" value={values.bill} onChange={event => setValues(previous => ({ ...previous, bill: Number(event.target.value) || 0 }))} /></label><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Share short-paid (%)<input className="py-[8px] px-[10px] text-right w-full" id="pct" type="number" min="0" step="0.5" value={values.pct} onChange={event => setValues(previous => ({ ...previous, pct: Number(event.target.value) || 0 }))} /></label><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Days to settle<input className="py-[8px] px-[10px] text-right w-full" id="days" type="number" min="0" value={values.days} onChange={event => setValues(previous => ({ ...previous, days: Number(event.target.value) || 0 }))} /></label><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Cost of money (% a year)<input className="py-[8px] px-[10px] text-right w-full" id="rate" type="number" min="0" step="0.5" value={values.rate} onChange={event => setValues(previous => ({ ...previous, rate: Number(event.target.value) || 0 }))} /></label></div>
              <div className="out gap-[10px]">
                <div className="[background:linear-gradient(135deg,#F5F5F7,#F5F5F7)] rounded-[16px] p-[16px]">
                  <b className="text-(--gd) text-[1.7rem] tracking-[-.02em]" id="o1">{money(cash)}</b>
                  <span className="text-(--ink2) text-[.84rem]">cash stuck at any time</span>
                </div>
                <div className="[background:linear-gradient(135deg,#F5F5F7,#F5F5F7)] rounded-[16px] p-[16px]">
                  <b className="text-(--gd) text-[1.7rem] tracking-[-.02em]" id="o2">{money(cash * values.rate / 100)}</b>
                  <span className="text-(--ink2) text-[.84rem]">yearly interest cost</span>
                </div>
              </div>
              <p className="text-(--mut) text-[.75rem] col-start-1 col-end-[-1] m-0">Billing × share × days÷30 = cash stuck. Try your own numbers.</p>
            </div>

          </section>
        </details>
        <details id="detail-thinking" open={openDetails['detail-thinking'] ?? false} onToggle={event => { const open = event.currentTarget.open; setOpenDetails(previous => previous['detail-thinking'] === open ? previous : { ...previous, ['detail-thinking']: open }); }} className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
          <summary className="items-center cursor-pointer list-none">
            <span className="flex-1">
              <b>Costs, mistakes, risks</b>
              <em className="text-(--mut) not-italic">What this design costs, what I got wrong, and where it could fail.</em>
            </span>
            <i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#eef5ff] rounded-[50%] text-[#0a66d1] flex-none text-[1.1rem] not-italic h-[30px] place-items-center transition-transform duration-200 w-[30px]" aria-hidden="true">+</i>
          </summary>
          <section className="sec m-0!" id="thinking">
            <p className="k text-[.74rem] font-bold tracking-[.12em]! mt-0 mr-0 mb-[8px] ml-0 text-left! uppercase">Design principles</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)]! font-bold tracking-[-.02em] leading-[1.15] mt-0 mr-auto mb-[22px] ml-auto mb-[16px]! ml-0! max-w-[30ch]! text-left!">Controls first, failure planned for</h2>
            <div className="cm gap-[12px] mt-0 mr-0 mb-[14px] ml-0 max-w-none [@media(min-width:820px)]:items-stretch [@media(min-width:820px)]:grid-cols-[1.2fr_1fr]">
              <div className="cost bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white rounded-[16px] m-0! max-w-none py-[14px] px-[18px] [border:1px_solid_var(--line)]">
                <b className="mb-[6px]">What this costs</b>
                <ul className="text-(--ink2) text-[.92rem] m-0 pl-[18px]">
                  <li className="my-[3px] mx-0">Fewer auto-matches at launch: strict matching rejects fuzzy ones.</li>
                  <li className="my-[3px] mx-0">More manual review: anything above ₹10,000 needs a second person.</li>
                  <li className="my-[3px] mx-0">A slower first close: Sales must enter scheme dates and budgets before rules can accept a claim.</li>
                </ul>
              </div>
              <p className="miss bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white rounded-[16px] text-(--ink2) text-[.95rem] m-0! max-w-none py-[14px] px-[18px] text-left [border:1px_solid_var(--line)]"><b className="text-(--ink)">Why it runs:</b> a spec nobody executes isn't a spec, so every rule ships as a working, tested control.</p>
            </div>
            <div className="two-up gap-[14px] [@media(min-width:820px)]:grid-cols-[1fr_1fr]">
              <div className="pane bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white pt-[22px] pr-[22px] pb-[10px] pl-[22px]">
                <h3 className="text-[1rem] mt-0 mr-0 mb-[12px] ml-0">How the product works</h3>
                <ol className="pts list-none m-0 p-0 [counter-reset:p]">
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Evidence first.</b> Every fact dated and sourced.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">One owner per gap.</b> One decision, one deadline.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Testable rules.</b> The full desk runs 16 rules with 31 passing tests, including every "must block" case. This app enforces matching, owners by role, the Ten Today approval check and two-person approval above ₹10,000.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Controls built in.</b> Maker-checker and no write-offs by rule: enforced and tested in the full desk. Product certifications are not claimed.</li>
                </ol>
              </div>
              <div className="pane bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white pt-[22px] pr-[22px] pb-[10px] pl-[22px]">
                <h3 className="text-[1rem] mt-0 mr-0 mb-[12px] ml-0">Where it could fail, and the fix</h3>
                <ol className="pts r list-none m-0 p-0 [counter-reset:p]">
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Distributors pay the old account.</b> Keep it open a quarter; Sales gets a weekly list.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Schemes change mid-quarter.</b> No dates and budget from Sales, no valid scheme.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Sales overrides the credit flag.</b> It never blocks an order; overrides are logged by name.</li>
                </ol>
              </div>
            </div>
            <div id="privacy" className="trust items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#ffffffb3] border border-dashed border-[#e3e3e8] rounded-[16px] text-(--ink2) flex-wrap text-[.84rem] gap-y-[8px] gap-x-[22px] justify-center mt-[14px] py-[14px] px-[18px]">
              <span><b className="text-(--ink)">Runs in your browser.</b> Public demo changes are session-only; private records are sent to Lovable Cloud when saved.</span>
              <span>
                <b className="text-(--ink)">Accounts are required for private saved work.</b>
              </span>
              <span>
                <b className="text-(--ink)">Public walkthrough uses sample data.</b>
              </span>
              <a className="items-center font-semibold gap-[4px] no-underline" href="/capabilities">Sources, and what I don't claim <svg className="h-[13px] w-[13px]" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            </div>
          </section>
        </details>
      </div>
    </section>
  );
}

function ImportedSection2() {
  return (
    <section className="sec" id="contact">
      <div className="er-app mx-auto max-w-[760px] rounded-xl border border-border bg-card p-5 sm:p-7">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border pb-4">
          <img className="h-11 w-11 shrink-0 rounded-full object-cover" src="/site-assets/21263e0575cbfff1.jpg" alt="Rupak Ghanpathi" width="44" height="44" loading="lazy" />
          <p className="m-0 min-w-0 text-sm text-muted-foreground"><strong className="text-foreground">Rupak Ghanpathi</strong> · Ex-HDFC Bank BA · 25+ BRDs · zero SOX findings</p>
        </div>
        <h2 className="mt-4 mb-1 text-xl font-semibold" id="rh">Let's talk this week</h2>
        <p className="mb-4 text-sm text-muted-foreground">Replies within 24 hours by email · or write to <a className="font-medium" href="mailto:rupakr2g@gmail.com">rupakr2g@gmail.com</a></p>
        <DemoRequest />
        <p className="mt-3 mb-0 flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 shrink-0 rounded-full bg-(--money-ok)" />Architected by Rupak Ghanpathi · ex-HDFC Bank BA (25+ BRDs, 0 SOX findings) · open to Product & BA roles in fintech and BFSI</p>
      </div>
    </section>
  );
}

function ImportedFooter() {
  return (
    <footer className="bg-none! [background-position:0%_0%]! [background-size:auto_auto]! [background-repeat:repeat]! [background-origin:padding-box]! [background-clip:border-box]! [background-attachment:scroll]! bg-white! text-(--ink2) text-[.86rem] mt-[32px]! pt-[28px] pr-0 pb-[20px] pl-0 [border-top:1px_solid_#E2E8F0]">
      <div className="col my-0 mx-auto max-w-[1200px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-[1.3fr_1fr_1fr_1fr] sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <a className="flex items-center gap-2 font-semibold text-foreground no-underline" href="/"><svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Every Rupee">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#64748B" strokeWidth="4.5" strokeDasharray="2.48 79.20" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="31.07 50.61" strokeDashoffset="-4.08" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="43.32 38.36" strokeDashoffset="-36.76" transform="rotate(-90 16 16)" />
              <text x="16" y="21.2" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="14" fill="#111827">₹</text>
            </svg><span>Every Rupee</span></a>
            <p className="mt-2 mb-0 max-w-[30ch] text-sm text-muted-foreground">Every short-paid rupee gets a reason, an owner and an ending.</p>
          </div>
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Product</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="/demo">Open the demo</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="/workspace">Your private workspace</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="/lender-demo">Lender desk demo</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://everyrupee-o2c.vercel.app/">Case study ↗</a></div>
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Resources</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="#tour-h">How it works</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="/capabilities">Sources</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://everyrupee-o2c.vercel.app/#proof">Documentation ↗</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="#privacy">Privacy</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://github.com/RUPAK30/every-rupee-gets-owner">GitHub ↗</a></div>
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Rupak</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://rupak-lemon.vercel.app">Portfolio</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://lull-hr.vercel.app/">Viraam</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://tentoday.vercel.app/">Ten Today</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="mailto:rupakr2g@gmail.com">rupakr2g@gmail.com</a></div>
        </div>
        <p className="mt-6 mb-0 border-t border-border pt-4 text-xs text-muted-foreground">© 2026 Every Rupee · Independent product by Rupak Ghanpathi · Not affiliated with any brand named in samples · Tax rules summarised from public sources, Oct 2026. Not tax advice.</p>
      </div>
    </footer>
  );
}
