import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent } from "react";
import { Button } from '@/components/ui/button';
import { DemoRequest } from '@/components/reconciliation/demo-request';
import { useAccount } from '@/lib/account-context';
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
  const { signedIn } = useAccount();
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [deadline, setDeadline] = useState<number | null>(null);
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
    setDeadline(now > end ? null : Math.ceil((end - now) / 86400000));
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
            <Link to="/demo" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">Product</Link>
            <a href="#tour-h" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">How it works</a>
            <a href="https://everyrupee-o2c.vercel.app/route.html" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">Quote to cash</a>
            <a href="https://everyrupee-o2c.vercel.app/lender.html" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline hover:bg-muted hover:text-foreground">Lender</a>
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Link to="/workspace" className="hidden px-3 py-2 text-sm font-medium text-foreground no-underline hover:underline sm:inline">{signedIn ? "Workspace" : "Sign in"}</Link>
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
  ["3", "Resolve", "Each gap gets an owner and a decision note. Accounting actions run in the canonical live desk."],
];

const loop = [
  { label: 'Unexplained', cls: 'bg-money-risk/10 text-money-risk', owner: '—', note: 'Customer paid ₹4,87,600 against ₹5,00,000' },
  { label: 'Matched', cls: 'bg-money-wip/15 text-money-wip', owner: '—', note: 'Receipt matched to INV-2041 by reference' },
  { label: 'Owned', cls: 'bg-money-wip/15 text-money-wip', owner: 'Priya · AR', note: 'Gap assigned: promo deduction claimed' },
  { label: 'Closed', cls: 'bg-money-ok/15 text-money-ok', owner: 'Priya · AR', note: 'Credit note issued. Gap closed.' },
];
function HeroLoop() {
  const [i, setI] = useState(0);
  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setI(3); return; } const t = setInterval(() => setI(x => (x + 1) % loop.length), 1800); return () => clearInterval(t); }, []);
  const s = loop[i] ?? loop[0];
  if (!s) return null;
  return (
    <section className="er-app relative z-10 mx-auto -mt-8 max-w-[720px] rounded-xl border border-border bg-card p-5 shadow-xl" aria-label="How a short payment moves through Every Rupee">
      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Reconciliation desk · sample</span><span>Step {i + 1} of 4</span></div>
      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3 border-y border-border py-4 tabular-nums">
        <div><b>INV-2041</b> · Sample distributor<p key={i} className="er-rise mt-1 text-sm text-muted-foreground">{s.note}</p></div>
        <div className="text-right"><b className="text-lg">₹12,400</b><div className="mt-1"><span className={'er-pill ' + s.cls}>{s.label}</span></div></div>
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Owner: {s.owner}</span><span className="flex gap-1">{loop.map((_, n) => <i key={n} className={'h-1.5 w-6 rounded-full ' + (n <= i ? 'bg-accent' : 'bg-border')} />)}</span></div>
    </section>
  );
}

function QuickTour() {
  return (
    <section className="er-app my-10 grid gap-10" aria-labelledby="tour-h">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">How it works</p>
        <h2 id="tour-h" className="mt-1 text-2xl font-bold">From messy payments to owned gaps in 3 steps</h2>
        <ol className="mt-5 list-none p-0 grid gap-4 sm:grid-cols-3">
          {steps.map(([n, t, d]) => (
            <li key={n} className="rounded-lg border border-border bg-card p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{n}</span>
              <h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5">
        <div><p className="text-xs font-semibold uppercase text-muted-foreground">Sample case</p>
          <p className="mt-1 text-lg"><b>₹12,400 short payment:</b> unexplained and ownerless before, <b>matched, owned and closed</b> after.</p></div>
        <Button className="min-h-11 text-primary-foreground!" asChild><Link to="/demo">Try the live demo, no sign-up</Link></Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4 text-sm">
        <p><b>Working today:</b> CSV import, auto-match, manual allocation, exceptions, private saved workspaces. <b>Planned:</b> bank and ERP connections.</p>
        <Link to="/capabilities" className="font-semibold underline">Full status →</Link>
      </div>
    </section>
  );
}

function CanonicalWorkflows() {
  const brandRules = [
    ['BR-1', 'Identify', 'Virtual account per distributor.'],
    ['BR-2', 'Split', 'TDS u/s 194Q.'],
    ['BR-3', 'Validate', 'Auto-accept only with evidence, within budget, under tolerance.'],
    ['BR-4', 'No write-off by rule', 'No rule can ever write money off.'],
    ['BR-5', 'Maker-checker above ₹10,000', 'Self-approval blocked.'],
    ['BR-6', 'Credit notes', 'Reported to IRP within 30 days.'],
    ['BR-7', 'Credit flag', 'On the next order.'],
    ['BR-8', 'Verbal-promise scheme', 'Goes to Regional sales head within 3 days.'],
    ['BR-9', 'Balanced vouchers', 'Every movement posts a balanced voucher.'],
    ['BR-10', 'Sales approval and cap', 'Match a deduction to its sales approval and split at the cap; a pre-tax cap clears up to cap + 18% GST.'],
    ['BR-11', 'Rep-owned claims', "Only the rep's own claims older than 15 days block the next discount; Finance backlog never does."],
  ];
  const lenderRules = [
    ['LR-1', 'Match', ''], ['LR-2', 'Read the NACH return code', ''],
    ['LR-3', 'Charge fairly', 'RBI Aug 2023 penal charges: no capitalisation, no interest on penal.'],
    ['LR-4', 'Own the overdue', 'SMA-0/1/2 buckets.'], ['LR-5', 'Control', ''],
  ];
  return <div className="er-app my-10">
    <section className="border-y border-border py-7" aria-labelledby="canonical-rules">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Canonical product · external live desks</p>
      <p id="canonical-rules" className="text-xs font-semibold uppercase text-muted-foreground">Full tested desk</p>
      <div className="mt-3 flex flex-wrap gap-3"><Button asChild variant="outline"><a href="https://everyrupee-o2c.vercel.app/route.html">Quote to cash, end to end ↗</a></Button><Button asChild variant="outline"><a href="https://everyrupee-o2c.vercel.app/desk.html?uat=1">Run brand tests ↗</a></Button><Button asChild variant="outline"><a href="https://everyrupee-o2c.vercel.app/lender.html">Open lender desk ↗</a></Button></div>
      <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer font-semibold">All 16 business rules</summary><div className="mt-4 grid gap-8 sm:grid-cols-2">{[['Brand mode', brandRules], ['Lender mode', lenderRules]].map(([title, rules]) => <div key={String(title)}><h3 className="font-semibold">{String(title)}</h3><dl className="mt-3 divide-y divide-border">{(rules as string[][]).map(([id, title, text]) => <div key={id} className="py-3"><dt className="text-sm font-semibold">{id} · {title}</dt>{text && <dd className="mt-1 text-sm leading-6 text-muted-foreground">{text}</dd>}</div>)}</dl></div>)}</div></details>
    </section>
    <section className="border-b border-border py-10" aria-labelledby="lender-mode">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Same engine · second desk</p>
      <h2 id="lender-mode" className="mt-2 text-2xl font-semibold">Lender desk: when an EMI bounces</h2>
      <p className="mt-2 max-w-[62ch] text-sm leading-6 text-muted-foreground">For lenders, the "short payment" is a loan instalment that fails. The bank sends a return code; Every Rupee turns it into a reason, an owner and a next step, the same way it handles a short-paid invoice.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <ol className="m-0! grid list-none gap-2 p-0! text-sm">{[['Bank returns the EMI', 'with a NACH code'], ['Desk reads the code', 'and names the cause'], ['One owner, one next step', 'logged with a deadline']].map(([t, d], i) => <li key={t} className="flex gap-3 rounded-xl border border-border bg-card p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{i + 1}</span><span><b className="block">{t}</b><span className="text-muted-foreground">{d}</span></span></li>)}</ol>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Bounce queue · sample</span><span>3 open</span></div>
          {[['Code 04', 'Not enough balance', 'Collections · call, then re-present', 'bg-money-wip/15 text-money-wip'], ['Code 61', 'Mandate cancelled', 'Ops · request a fresh mandate', 'bg-money-risk/10 text-money-risk'], ['Code 06', 'Stopped by customer', 'Relationship · talk first, may be a dispute', 'bg-money-risk/10 text-money-risk']].map(([c, m, n, k]) => <div key={c} className="grid gap-1 border-b border-border px-4 py-3 text-sm last:border-0 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center"><span className="font-semibold">{c}</span><span>{m}</span><span className={'er-pill ' + k}>{n}</span></div>)}
        </div>
      </div>
      <Button asChild className="mt-5 text-primary-foreground! no-underline!"><a href="/lender-demo?tour=1">▶ Try the lender desk · 60-second tour</a></Button>
    </section>
  </div>;
}

function ImportedSectionADistributorPaysShort() {
  return (
    <section className="er-app py-12 text-center sm:py-16" aria-labelledby="intro-title">
      <p className="text-sm font-medium text-muted-foreground">Order-to-cash · Deduction management</p>
      <h1 id="intro-title" className="mx-auto mt-4 max-w-[24ch] text-4xl font-semibold text-foreground sm:text-5xl">Every Rupee<span className="mt-3 block text-2xl font-medium sm:text-3xl">Short-payment reconciliation, from invoice to cash.</span></h1>
      <p className="mx-auto mt-5 max-w-[60ch] text-base leading-7 text-muted-foreground">Designed for Indian B2B finance teams to find, explain and resolve deductions from invoices. Every gap gets a reason, an owner and an ending.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild className="min-h-11 text-primary-foreground! no-underline!"><a href="/demo?tour=1">▶ 60-second guided demo</a></Button><Button asChild variant="outline" className="min-h-11 no-underline!"><Link to="/demo">Explore on my own</Link></Button><Button asChild variant="outline" className="min-h-11"><a href="#contact">Let's talk</a></Button></div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">{['16 rules', '31/31 tests passing', '0 write-offs by rule'].map(label => <Button key={label} asChild variant="outline" size="sm" className="h-8 rounded-full text-xs no-underline!"><a href="https://everyrupee-o2c.vercel.app/desk.html?uat=1">{label}</a></Button>)}</div>
      <p className="mt-6 font-semibold">The hard part of a deduction isn't matching it. It's owning it.</p>
      <div className="mx-auto mt-5 max-w-[68ch] border-y border-border py-4 text-sm leading-6 text-muted-foreground">Maker-checker above ₹10,000 and zero write-offs by rule are enforced and tested in the <a className="font-semibold text-primary underline" href="https://everyrupee-o2c.vercel.app/desk.html">full desk</a> (16 rules, 31/31 tests). This lighter demo shows matching and exceptions.</div>
      <Link to="/demo" aria-label="Open the live reconciliation desk" className="mx-auto mt-8 block max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card text-left no-underline! shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Reconciliation desk</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-(--money-ok)" />Live sample</span></div>
        {[['INV-102 · Meera Trading', '₹5,000 · Paid in full', 'bg-money-ok/15 text-money-ok'], ['INV-101 · Aarav Distributors', '₹1,000 short · Scheme claim · Owner: Asha', 'bg-money-wip/15 text-money-wip'], ['INV-104 · Eastern Wholesale', '₹200 short · No reason yet · Unowned', 'bg-money-risk/10 text-money-risk']].map(([id, t, c]) => <div key={id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-sm last:border-0"><span className="font-medium text-foreground">{id}</span><span className={'er-pill ' + c}>{t}</span></div>)}
        <p className="px-4 py-2.5 text-center text-xs font-semibold text-primary">Open the live desk →</p>
      </Link>
    </section>
  );
}

const gaps = [
  {
    "a": "₹1,180",
    "r": "Scheme claim",
    "w": "Festival discount, budget approved",
    "st": [
      "s-done",
      "Closed"
    ],
    "q": [
      [
        "What",
        "Paid ₹10,620 on ₹11,800; took a 10% festival discount."
      ],
      [
        "Why",
        "Budget approved, evidence attached: valid (BR-3)."
      ],
      [
        "Who",
        "Asha, finance ops. Under ₹10,000, no checker."
      ],
      [
        "How",
        "GST credit note ₹1,180 (₹1,000 + ₹180 GST). Distributor reverses; brand recovers ₹180."
      ]
    ],
    "s": [
      "<b>Payment arrives.</b> ₹10,620 on a ₹11,800 bill.",
      "<b>Gap found.</b> ₹1,180 short. Payer matched (BR-1).",
      "<b>Reason.</b> Budgeted scheme claim: valid (BR-3).",
      "<b>Owner.</b> Asha, finance ops. SLA 7 days.",
      "<b>Closed.</b> GST credit note issued (BR-6); ₹180 GST back once the distributor reverses."
    ]
  },
  {
    "a": "₹12,400",
    "r": "Scheme claim",
    "w": "No approved budget: a verbal promise",
    "st": [
      "s-open",
      "1 day left"
    ],
    "q": [
      [
        "What",
        "Deducted ₹12,400 for a scheme a rep promised verbally."
      ],
      [
        "Why",
        "No approved budget, so no rule can accept it (BR-8)."
      ],
      [
        "Who",
        "Regional sales head, within 3 days."
      ],
      [
        "How",
        "Charge to trade budget, or recover. Never left unallocated."
      ]
    ],
    "s": [
      "<b>Payment arrives.</b> ₹12,400 short on the monthly bill.",
      "<b>Gap found.</b> Tagged to the distributor (BR-1).",
      "<b>Reason.</b> Scheme claim, but no approved budget (BR-8).",
      "<b>Owner.</b> Regional sales head. Clock: 3 days.",
      "<b>Decision.</b> Charge to budget or recover; checker signs above ₹10,000 (BR-5)."
    ]
  },
  {
    "a": "₹3,150",
    "r": "Damage claim",
    "w": "Proof of delivery attached",
    "st": [
      "s-chk",
      "Owner assigned"
    ],
    "q": [
      [
        "What",
        "Deducted ₹3,150 for transit damage."
      ],
      [
        "Why",
        "Proof attached, and under ₹10,000, so the owner resolves it directly (BR-3)."
      ],
      [
        "Who",
        "Finance ops recommends, checker approves (BR-5)."
      ],
      [
        "How",
        "Credit note if valid, recovery if not. Never auto written off (BR-4)."
      ]
    ],
    "s": [
      "<b>Payment arrives.</b> ₹3,150 short.",
      "<b>Gap found.</b> Matched to the payer (BR-1).",
      "<b>Reason.</b> Damage claim with proof of delivery.",
      "<b>Owner.</b> Asha recommends, Vikram (controller) checks.",
      "<b>Closed.</b> Credit note or recovery, logged."
    ]
  },
  {
    "a": "₹860",
    "r": "TDS",
    "w": "Tax withheld under section 194Q",
    "st": [
      "s-done",
      "Matched"
    ],
    "q": [
      [
        "What",
        "Withheld ₹860 as TDS, required above ₹50 lakh of purchases."
      ],
      [
        "Why",
        "It's a tax credit, not a loss (BR-2)."
      ],
      [
        "Who",
        "Finance ops, automatically."
      ],
      [
        "How",
        "Matched to Form 26AS and closed."
      ]
    ],
    "s": [
      "<b>Payment arrives.</b> ₹860 short.",
      "<b>Gap found.</b> 0.1% above ₹50 lakh: expected TDS.",
      "<b>Reason.</b> TDS under section 194Q (BR-2).",
      "<b>Owner.</b> Finance ops, auto-matched.",
      "<b>Closed.</b> Matched to Form 26AS as a tax credit."
    ]
  }
];

function ImportedSection() {
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(0);
  const gap = gaps[current] ?? gaps[0];
  if (!gap) return null;
  return (
    <section className="board bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white mt-[34px] mr-0 mb-0 ml-0 overflow-hidden" id="board">
      <div className="bh items-center [background:linear-gradient(180deg,#FDFDFE,#fff)] flex-wrap gap-[12px] justify-between py-[16px] px-[20px] [border-bottom:1px_solid_var(--line)]">
        <div>
          <b className="text-[1rem]">Today's short-payments</b>
          <br />
          <small className="text-(--mut) text-[.82rem]">Click a gap: what, why, who, how it ends.</small>
        </div>
        <small className="text-(--mut) text-[.82rem]">Sample data · 4 gaps · ₹17,590</small>
      </div>
      <div className="bg [@media(min-width:880px)]:grid-cols-[1.05fr_1fr]">
        <ul className="rows list-none m-0 p-[8px]" role="tablist" id="rows">
          <li>
            <button role="tab" aria-selected={current === 0} onClick={() => { setCurrent(0); setStep(0); }}>
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹1,180</span>
              <span className="rs text-[.88rem]">Scheme claim<small className="text-(--mut) text-[.78rem]">Festival discount, budget approved</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[999px] text-(--gd) text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">Closed</span>
            </button>
          </li>
          <li>
            <button role="tab" aria-selected={current === 1} onClick={() => { setCurrent(1); setStep(0); }}>
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹12,400</span>
              <span className="rs text-[.88rem]">Scheme claim<small className="text-(--mut) text-[.78rem]">No approved budget: a verbal promise</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-(--gold-s) rounded-[999px] text-(--gold) text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">1 day left</span>
            </button>
          </li>
          <li>
            <button role="tab" aria-selected={current === 2} onClick={() => { setCurrent(2); setStep(0); }}>
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹3,150</span>
              <span className="rs text-[.88rem]">Damage claim<small className="text-(--mut) text-[.78rem]">Proof of delivery attached</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[999px] text-[#0071e3] text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">Owner assigned</span>
            </button>
          </li>
          <li>
            <button role="tab" aria-selected={current === 3} onClick={() => { setCurrent(3); setStep(0); }}>
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹860</span>
              <span className="rs text-[.88rem]">TDS<small className="text-(--mut) text-[.78rem]">Tax withheld under section 194Q</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[999px] text-(--gd) text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">Matched</span>
            </button>
          </li>
        </ul>
        <div className="det [background:linear-gradient(160deg,#FBFBFD,#FAFAFC)] py-[20px] px-[22px]" role="tabpanel" aria-live="polite">
          <h3 className="text-[1.15rem] tracking-[-.02em] mt-0 mr-0 mb-[4px] ml-0" id="dt">{gap.a} · {gap.r}</h3>
          <p className="text-(--mut) text-[.86rem] mt-0 mr-0 mb-[14px] ml-0" id="ds">{gap.w}</p>
          <div className="qa gap-[8px] mt-0 mr-0 mb-[16px] ml-0" id="qa">
            {gap.q.map(([label, text]) => <div className="text-[.9rem]" key={label}><b className="text-(--gd) text-[.7rem] tracking-[.07em] pt-[2px] uppercase">{label}</b><span>{text}</span></div>)}
          </div>
          <div className="track gap-[6px] mt-0 mr-0 mb-[10px] ml-0" id="tr">
            {gap.s.map((_, index) => <span key={index} className={index <= step ? 'on' : ''} />)}
          </div>
          <p className="text-(--ink2) text-[.86rem] mt-0 mr-0 mb-[12px] ml-0 min-h-[2.6em]" id="sg">Step {step + 1} of {gap.s.length} · <span dangerouslySetInnerHTML={{ __html: gap.s[step] ?? '' }} /></p>
          <div className="ctl flex-wrap gap-[8px]">
            <button className="btn g sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" id="nx" type="button" hidden={step >= gap.s.length - 1} onClick={() => setStep(value => Math.min(value + 1, gap.s.length - 1))}>Next step <svg className="h-[15px] transition-transform duration-150 w-[15px]" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <button className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" id="rs" type="button" onClick={() => setStep(0)}>Replay</button>
            <a className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" href="/demo">Do it in the product</a>
            <a className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" href="https://everyrupee-o2c.vercel.app/route.html">Where the deduction started: the sales promise →</a>
            <a className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" href="https://everyrupee-o2c.vercel.app/lender.html?tour=1">Same discipline for a lender: NACH bounces →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImportedSectionOpenWhatYouCare({ openDetails, setOpenDetails, deadline }: { openDetails: Record<string, boolean>; setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; deadline: number | null }) {
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
                  <b className="text-[#0071e3] text-[3.4rem] tracking-[-.04em] leading-none [font-variant-numeric:tabular-nums]" id="xd">{deadline === null ? 'Passed' : deadline}</b>
                  <span className="text-(--ink2) text-[.82rem] mt-[8px]" id="xl">{deadline === null ? 'Deadline passed: GST credit notes for FY 2025-26 are no longer allowed' : 'days to the FY 2025-26 credit-note deadline'}</span>
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
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Testable rules.</b> The full desk runs 16 rules with 31 passing tests, including every "must block" case. This demo enforces matching and exceptions only.</li>
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
        <div className="grid gap-8 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <a className="flex items-center gap-2 font-semibold text-foreground no-underline" href="/"><svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Every Rupee">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#64748B" strokeWidth="4.5" strokeDasharray="2.48 79.20" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="31.07 50.61" strokeDashoffset="-4.08" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="43.32 38.36" strokeDashoffset="-36.76" transform="rotate(-90 16 16)" />
              <text x="16" y="21.2" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="14" fill="#111827">₹</text>
            </svg><span>Every Rupee</span></a>
            <p className="mt-2 mb-0 max-w-[30ch] text-sm text-muted-foreground">Every short-paid rupee gets a reason, an owner and an ending.</p>
          </div>
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Product</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="/demo">Open the demo</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://everyrupee-o2c.vercel.app/desk.html?uat=1">Full desk ↗</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://everyrupee-o2c.vercel.app/route.html">Quote to cash ↗</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://everyrupee-o2c.vercel.app/lender.html">Lender ↗</a></div>
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Resources</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="#tour-h">How it works</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="/capabilities">Sources</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://everyrupee-o2c.vercel.app/case-study.html">Documentation ↗</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="#privacy">Privacy</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://github.com/RUPAK30/Cello-O2C-Deduction-Workflow-Case-Study">GitHub ↗</a></div>
          <div><h4 className="mt-0 mb-2 text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted-foreground">Rupak</h4><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://rupak-lemon.vercel.app">Portfolio</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://lull-hr.vercel.app/">Viraam</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="https://tentoday.vercel.app/">Ten Today</a><a className="block py-1 text-sm text-muted-foreground no-underline hover:text-foreground" href="mailto:rupakr2g@gmail.com">rupakr2g@gmail.com</a></div>
        </div>
        <p className="mt-6 mb-0 border-t border-border pt-4 text-xs text-muted-foreground">© 2026 Every Rupee · Independent product by Rupak Ghanpathi · Not affiliated with any brand named in samples · Tax rules summarised from public sources, Oct 2026. Not tax advice.</p>
      </div>
    </footer>
  );
}
