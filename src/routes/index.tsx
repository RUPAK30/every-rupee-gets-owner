import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent } from "react";
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { DemoRequest } from '@/components/reconciliation/demo-request';
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
      <div className="mesh h-[900px] top-0 right-0 bottom-auto left-0 overflow-hidden pointer-events-none absolute -z-1" aria-hidden="true">
        <i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[50%] h-[420px] left-[-120px] opacity-75 absolute top-[-80px] w-[520px] [filter:blur(70px)]" />
        <i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[50%] h-[420px] opacity-75 absolute right-[-140px] top-[-60px] w-[480px] [filter:blur(70px)]" />
        <i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[50%] h-[360px] left-[38%] opacity-[.55] absolute top-[180px] w-[420px] [filter:blur(70px)]" />
      </div>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-[1040px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 md:grid-cols-[auto_1fr_auto]">
          <a className="flex min-w-0 items-center gap-2 text-[1.02rem] font-semibold tracking-tight text-foreground no-underline" aria-label="Every Rupee home" href="/">
            <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Every Rupee">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#64748B" strokeWidth="4.5" strokeDasharray="2.48 79.20" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="31.07 50.61" strokeDashoffset="-4.08" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="43.32 38.36" strokeDashoffset="-36.76" transform="rotate(-90 16 16)" />
              <text x="16" y="21.2" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="14" fill="#111827">₹</text>
            </svg>
            <span className="truncate">Every Rupee</span>
          </a>
          <nav aria-label="Main" className="hidden items-center justify-center gap-1 md:flex">
            <Link to="/demo" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">Product</Link>
            <a href="#tour-h" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">How it works</a>
            <a href="https://everyrupee-o2c.vercel.app/" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">Case study ↗</a>
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Link to="/demo" className="hidden px-3 py-2 text-sm font-medium text-foreground no-underline hover:underline sm:inline">Try the demo (no sign-up)</Link>
            <Button size="sm" className="min-h-10 text-primary-foreground! no-underline!" asChild><a href="#contact">Let's talk</a></Button>
          </div>
        </div>
      </header>
      <main className="col my-0 mx-auto max-w-[1040px]">
        <ImportedSectionADistributorPaysShort />
        <QuickTour />
        <CanonicalWorkflows />
        <ImportedSectionOpenWhatYouCare openDetails={openDetails} setOpenDetails={setOpenDetails} deadline={deadline} />
        <ImportedSection2 />
      </main>
      <ImportedFooter />
      <a href="#contact" className="hidden">Let's talk</a>
    </div>
  );
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
      <p className="mt-1.5 max-w-[65ch] text-sm leading-6 text-muted-foreground">For lenders, the "short payment" is a loan instalment that fails. The bank sends a NACH return code; Every Rupee turns it into a reason, an owner and a next step.</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Bounce queue · sample</span><span>3 open · RBI Aug 2023 penal rules enforced</span></div>
        {[['Code 04', 'Not enough balance', 'Collections · call, then re-present', 'bg-money-wip/15 text-money-wip'], ['Code 61', 'Mandate cancelled', 'Ops · request a fresh mandate', 'bg-money-risk/10 text-money-risk'], ['Code 06', 'Stopped by customer', 'Relationship · talk first, may be a dispute', 'bg-money-risk/10 text-money-risk']].map(([c, m, n, k]) => <div key={c} className="grid gap-1 border-b border-border px-4 py-2.5 text-sm last:border-0 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center"><span className="font-semibold">{c}</span><span>{m}</span><span className={'er-pill ' + k}>{n}</span></div>)}
      </div>
    </section>
  </div>;
}

function ImportedSectionADistributorPaysShort() {
  const heroOutcomes = [
    ['7–14d → Day 0', 'Short-Payment Detection (<5 ms)', 'Splits cash from shortfall at UTR import vs. 7–14d manual ERP lag', 'The Hackett Group CPG baseline'],
    ['22m → <2m / bill', '~8.0 Hrs Saved per 25 Bills', '24/25 bills rule-checked across UTR, invoice, Ten Today cap & GST split', 'APQC O2C process benchmark'],
    ['30–45d → 3–7d', 'Dispute Resolution SLA', 'Routes each gap to one role-locked owner on Day 0; prevents >180d ECL', 'Cello World FY25 AR filings'],
    ['₹18,544 caught', '₹0 Silent Write-Offs', 'Blocks expired/over-cap claims (BR-4), 2-person >₹10k (BR-5) & SHA-256 chain', 'Live 25-bill batch (BR-4, BR-10)'],
  ];
  return (
    <section className="er-app pt-8 pb-6 text-center sm:pt-12 sm:pb-8" aria-labelledby="intro-title">
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">Order-to-cash · Deduction management · <span className="font-semibold text-primary">Tamper-evident</span> · Portfolio case study by Rupak Ghanpathi</p>
      <h1 id="intro-title" className="mx-auto mt-2.5 max-w-[24ch] text-3xl font-semibold text-foreground sm:text-5xl">Every Rupee<span className="mt-2 block text-xl font-medium sm:text-3xl">Short-payment reconciliation, from invoice to cash.</span></h1>
      <p className="mx-auto mt-3 max-w-[58ch] text-sm leading-6 text-muted-foreground">Designed for Indian B2B finance teams to find, explain and resolve deductions from invoices. Every gap gets a reason, an owner and an ending.</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <Button asChild className="min-h-10 text-primary-foreground! no-underline!"><a href="/demo?tour=1">▶ 60-second guided demo</a></Button>
        <Button asChild variant="outline" className="min-h-10 no-underline!"><Link to="/demo">Explore on my own</Link></Button>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-md text-xs no-underline!"><Link to="/demo" search={{ history: '1' }}><ShieldCheck className="mr-1.5 size-3.5 text-primary" />Live SHA-256 tamper sandbox →</Link></Button>
        <Button asChild variant="ghost" size="sm" className="h-10 text-xs text-muted-foreground no-underline! hover:text-foreground"><a href="https://everyrupee-o2c.vercel.app/desk.html?uat=1">16 rules · 31/31 tests ↗</a></Button>
      </div>

      <div aria-label="Measured business outcomes" className="mx-auto mt-6 max-w-[920px] overflow-hidden rounded-2xl border-2 border-primary/25 bg-card text-left shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-primary/5 px-4 py-2">
          <span className="text-[.72rem] font-bold uppercase tracking-wider text-primary">Measured Business Outcomes · Public CPG Benchmarks + Live 25-Bill Engine</span>
          <Link to="/demo" className="text-xs font-semibold text-primary hover:underline">Verify on 25-bill batch in the desk →</Link>
        </div>
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {heroOutcomes.map(([stat, label, sub, src]) => (
            <div key={label} className="p-3.5">
              <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{stat}</p>
              <p className="mt-0.5 text-xs font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs leading-4.5 text-muted-foreground">{sub}</p>
              <p className="mt-1 text-[.66rem] font-medium text-primary/80">Source: {src}</p>
            </div>
          ))}
        </div>
      </div>

      <Link to="/demo" aria-label="Open the live reconciliation desk" className="mx-auto mt-4 block max-w-[920px] overflow-hidden rounded-2xl border border-border bg-card text-left no-underline! shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Live reconciliation desk preview</span><span className="flex items-center gap-1.5">Billed ₹1,91,300 · Received ₹1,73,710 · <b className="text-money-wip">Gap ₹17,590</b> · <b className="text-primary">Open desk →</b></span></div>
        <div className="grid grid-cols-2 sm:grid-cols-4">{[['INV-101', 'Aarav Distributors', '₹1,180 short', 'Scheme claim · Asha', 'text-money-wip'], ['INV-102', 'Meera Trading', '₹12,400 short', 'Scheme claim · Unowned', 'text-money-risk'], ['INV-103', 'Southern Stores', '₹31,500 unpaid', '₹28,350 unreferenced receipt held in suspense', 'text-money-risk'], ['INV-104', 'Eastern Wholesale', '₹860 short', 'No reason yet', 'text-money-risk']].map(([id, n, amt, why, c]) => <div key={id} className="min-w-0 border-b border-r border-border px-3 py-2 text-xs even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0"><p className="truncate font-medium text-foreground">{id} · {n}</p><p className={'mt-0.5 text-sm font-semibold ' + c}>{amt}</p><p className="truncate text-muted-foreground">{why}</p></div>)}</div>
      </Link>
    </section>
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
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">Receivables +14.0% vs revenue +8.8%</b>
                <span className="text-(--mut) text-[.76rem]">Cello World, FY25→FY26</span>
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
        <details id="detail-evidence" open={openDetails['detail-evidence'] ?? false} onToggle={event => { const open = event.currentTarget.open; setOpenDetails(previous => previous['detail-evidence'] === open ? previous : { ...previous, ['detail-evidence']: open }); }} className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
          <summary className="items-center cursor-pointer list-none">
            <span className="flex-1">
              <b>A deduction can have a tax deadline: 30 November</b>
              <em className="text-(--mut) not-italic">Receivables vs revenue, distributor margins, and the credit-note deadline in detail.</em>
            </span>
            <i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#eef5ff] rounded-[50%] text-[#0a66d1] flex-none text-[1.1rem] not-italic h-[30px] place-items-center transition-transform duration-200 w-[30px]" aria-hidden="true">+</i>
          </summary>
          <section className="sec m-0!" id="evidence">
            <p className="k text-[.74rem] font-bold tracking-[.12em]! mt-0 mr-0 mb-[8px] ml-0 text-left! uppercase">Why now</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)]! font-bold tracking-[-.02em] leading-[1.15] mt-0 mr-auto mb-[22px] ml-auto mb-[16px]! ml-0! max-w-[30ch]! text-left!">Why this matters now</h2>
            <div className="g3 g2 gap-[14px]">
              <div className="tile bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white p-[18px]">
                <div className="text-(--gd) text-[1.5rem] font-bold tracking-[-.02em] mb-[2px]">+14% vs +8.8%</div>
                <b className="text-[.98rem] mb-[5px]">Cello's receivables outgrew revenue</b>
                <span className="text-(--ink2) text-[.87rem]">About ₹34 Cr above revenue pace, FY25→FY26.</span>
                <small className="text-(--mut) text-[.74rem] mt-[8px]">Annual reports · my estimate, a reason to look, not a diagnosis</small>
              </div>
              <div className="tile bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white p-[18px]">
                <div className="text-(--gd) text-[1.5rem] font-bold tracking-[-.02em] mb-[2px]">₹3.5–5</div>
                <b className="text-[.98rem] mb-[5px]">Distributor margin per ₹100</b>
                <span className="text-(--ink2) text-[.87rem]">Too thin to wait on slow claims, so they deduct.</span>
                <small className="text-(--mut) text-[.74rem] mt-[8px]">AICPDF, Jun 2026</small>
              </div>
            </div>
            <div className="mt-[14px]" id="expiry">
              <div className="exp items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white gap-[22px] py-[26px] px-[28px] [@media(min-width:820px)]:grid-cols-[1fr_220px]">
                <div>
                  <p className="k text-[.95rem] font-bold tracking-[.12em]! leading-[1.6] mt-0 mr-0 mb-[10px] ml-0 text-left! uppercase">The part nobody owns</p>
                  <h2 className="text-[clamp(1.5rem,3vw,2.1rem)]! font-bold tracking-[-.02em] leading-[1.15] mt-0! mr-0! mb-[12px]! ml-0! max-w-[30ch]! text-left!">A deduction can have a tax deadline.</h2>
                  <p className="text-[.95rem] leading-[1.6] mt-0 mr-0 mb-[10px] ml-0">When a brand settles a scheme claim with a <b className="text-(--ink)">GST credit note</b>, it gets back the GST already paid on the discount. That credit note must go out by <b className="text-(--ink)">30 November after the financial year ends</b> (or the annual return date, if earlier). For FY <span>2025-26</span> supplies, that's <b className="text-(--ink)">30 November <span>2026</span></b>.</p>
                  <p className="text-[.95rem] leading-[1.6] mt-0 mr-0 mb-[10px] ml-0">Many brands settle schemes with a plain <b className="text-(--ink)">financial credit note</b> instead and keep the GST cost. From 1 Nov 2026 the GST route gets easier, so more claims will qualify. An undecided deduction quietly loses that choice after the deadline.</p>
                  <p className="text-[.95rem] leading-[1.6] mt-0 mr-0 mb-[10px] ml-0">The brand's GST gain is the distributor's input-credit reversal. That's why the two sides negotiate which kind of credit note gets issued.</p>
                  <small className="text-(--mut) text-[.76rem]">CGST Act s.34(2); s.15(3)(b) as amended by Finance Act 2026; CBIC Circular 251/08/2025. Summarised from public sources, Oct 2026. Not tax advice.</small>
                </div>
                <div className="ex2 [background:linear-gradient(160deg,#F5F5F7,#F5F5F7)] border border-solid border-[#e8e8ed] rounded-[18px] py-[22px] px-[14px] text-center">
                  <b className="text-[#0071e3] text-[3.4rem] tracking-[-.04em] leading-none [font-variant-numeric:tabular-nums]" id="xd">{deadline === undefined ? '--' : deadline === null ? 'Passed' : deadline === 0 ? 'Today' : deadline}</b>
                  <span className="text-(--ink2) text-[.82rem] mt-[8px]" id="xl">{deadline === undefined ? 'days to the FY 2025-26 credit-note deadline' : deadline === null ? 'Deadline passed: GST credit notes for FY 2025-26 are no longer allowed' : deadline === 0 ? 'is the last day for FY 2025-26 GST credit notes' : (deadline === 1 ? 'day' : 'days') + ' to the FY 2025-26 credit-note deadline'}</span>
                </div>
              </div>
            </div>
          </section>
        </details>
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
            <div className="trust items-center bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#ffffffb3] border border-dashed border-[#e3e3e8] rounded-[16px] text-(--ink2) flex-wrap text-[.84rem] gap-y-[8px] gap-x-[22px] justify-center mt-[14px] py-[14px] px-[18px]" id="privacy">
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
      <div className="col my-0 mx-auto max-w-[1040px]">
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
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Resources</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="#tour-h">How it works</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="/capabilities">Sources</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://everyrupee-o2c.vercel.app/case-study.html">Documentation ↗</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="#privacy">Privacy</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://github.com/RUPAK30/Cello-O2C-Deduction-Workflow-Case-Study">GitHub ↗</a></div>
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Rupak</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://rupak-lemon.vercel.app">Portfolio</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://lull-hr.vercel.app/">Viraam</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://tentoday.vercel.app/">Ten Today</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="mailto:rupakr2g@gmail.com">rupakr2g@gmail.com</a></div>
        </div>
        <p className="mt-6 mb-0 border-t border-border pt-4 text-xs text-muted-foreground">© 2026 Every Rupee · Independent product by Rupak Ghanpathi · Not affiliated with any brand named in samples · Tax rules summarised from public sources, Oct 2026. Not tax advice.</p>
      </div>
    </footer>
  );
}
