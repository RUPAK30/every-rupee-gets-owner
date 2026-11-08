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
  const [deadline, setDeadline] = useState(23);
  const openHash = (hash: string) => {
    const target = document.getElementById(hash.slice(1));
    const detail = target?.closest('details');
    if (detail?.id) setOpenDetails(previous => ({ ...previous, [detail.id]: true }));
    requestAnimationFrame(() => target?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  useEffect(() => {
    if (location.hash) openHash(location.hash);
    const now = new Date();
    let end = new Date(now.getFullYear(), 10, 30, 23, 59, 59);
    if (now > end) end = new Date(now.getFullYear() + 1, 10, 30, 23, 59, 59);
    setDeadline(Math.ceil((end.getTime() - now.getTime()) / 86400000));
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
      <header className="sticky top-0 z-30">
        <div className="col hin items-center h-[64px] my-0 mx-auto max-w-[1040px]">
          <nav className="hl items-center gap-[4px] [outline-color:#0F766E]!">
            <a href="#board">How it works</a>
            <a href="#thinking">The thinking</a>
            <a href="/capabilities">Sources</a>
          </nav>
          <a className="logo items-center text-[1.02rem] gap-[9px] tracking-[-.02em] no-underline [font-weight:650]" aria-label="Every Rupee home" href="/">
            <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Every Rupee">
              <circle cx="16" cy="16" r="13" fill="none" stroke="#64748B" strokeWidth="4.5" strokeDasharray="2.48 79.20" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="31.07 50.61" strokeDashoffset="-4.08" transform="rotate(-90 16 16)" />
              <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="43.32 38.36" strokeDashoffset="-36.76" transform="rotate(-90 16 16)" />
              <text x="16" y="21.2" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="14" fill="#111827">₹</text>
            </svg>
            <span>Every Rupee</span>
          </a>
          <div className="hr items-center gap-[10px] justify-end"><Button size="sm" className="text-primary-foreground! min-h-11" asChild><a href="#contact" className="no-underline">Let's talk</a></Button><Button size="sm" variant="outline" className="min-h-11 max-sm:hidden" asChild><Link to="/workspace">{signedIn ? "Your workspace" : "Sign in"}</Link></Button></div>
        </div>
      </header>
      <main className="col my-0 mx-auto max-w-[1040px]">
        <ImportedSectionADistributorPaysShort />
        <HeroLoop />
        <QuickTour />
        <CanonicalWorkflows />
        <h2 className="mt-12 text-2xl font-bold" id="go-deeper">Go deeper</h2>
        <p className="text-sm text-muted-foreground">The full case study, the evidence and the thinking behind it.</p>
        <ImportedSection />
        <section className="sec" id="now">
          <div className="nowst bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden"><a className={"text-center no-underline [&:hover]:bg-none [&:hover]:[background-position:0%_0%] [&:hover]:[background-size:auto_auto] [&:hover]:[background-repeat:repeat] [&:hover]:[background-origin:padding-box] [&:hover]:[background-clip:border-box] [&:hover]:[background-attachment:scroll] [&:hover]:bg-site-import-background"} href="#evidence"><b className="text-site-import-primary! tracking-[-.02em]">+14% vs +8.8%</b><span className="text-(--mut) [@media(max-width:640px)]:leading-[1.3]">Cello's receivables vs revenue, FY26</span></a><a className={"text-center no-underline [&:hover]:bg-none [&:hover]:[background-position:0%_0%] [&:hover]:[background-size:auto_auto] [&:hover]:[background-repeat:repeat] [&:hover]:[background-origin:padding-box] [&:hover]:[background-clip:border-box] [&:hover]:[background-attachment:scroll] [&:hover]:bg-site-import-background"} href="#evidence"><b className="text-site-import-primary! tracking-[-.02em]">₹3.5–5</b><span className="text-(--mut) [@media(max-width:640px)]:leading-[1.3]">distributor margin per ₹100</span></a><a className={"text-center no-underline [&:hover]:bg-none [&:hover]:[background-position:0%_0%] [&:hover]:[background-size:auto_auto] [&:hover]:[background-repeat:repeat] [&:hover]:[background-origin:padding-box] [&:hover]:[background-clip:border-box] [&:hover]:[background-attachment:scroll] [&:hover]:bg-site-import-background"} href="#evidence"><b className="text-site-import-primary! tracking-[-.02em]"><span className="[color:inherit]! [@media(max-width:640px)]:leading-[1.3]" id="xd2">{deadline}</span> days</b><span className="text-(--mut) [@media(max-width:640px)]:leading-[1.3]">to the credit-note deadline, 30 Nov</span></a></div>
        </section>
        <ImportedSectionOpenWhatYouCare openDetails={openDetails} setOpenDetails={setOpenDetails} deadline={deadline} />
        <ImportedSection2 />
      </main>
      <ImportedFooter />
      <a href="#contact" className="er-app fixed bottom-4 right-4 z-40 sm:hidden rounded-full no-underline bg-primary px-5 py-3 min-h-11 font-semibold text-primary-foreground shadow-lg">Let's talk</a>
    </div>
  );
}

const steps = [
  ["1", "Import", "Upload invoices and receipts as CSV files."],
  ["2", "Auto-match", "Exact reference matches are paired. Unclear ones are never guessed."],
  ["3", "Resolve", "Each gap gets an owner and a decision note. Accounting actions run in the canonical live desk."],
];
const audiences = [
  ["Finance ops", "Fewer spreadsheets. Every short payment is tracked to closure."],
  ["CFO", "You can see the money still recoverable and who owns each gap."],
  ["Product manager", "A scoped first release: strict matching over speed, with honest limits."],
  ["Hiring manager / TA", "Designed and built solo by Rupak Ghanpathi, from the problem framing to a working app."],
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
      <div>
        <h2 className="text-2xl font-bold">Built for</h2>
        <ul className="mt-4 list-none p-0 grid gap-4 sm:grid-cols-2">
          {audiences.map(([t, d]) => <li key={t} className="rounded-lg border border-border bg-card p-5"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></li>)}
        </ul>
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
      <h2 id="canonical-rules" className="mt-2 text-2xl font-semibold">16 business rules. 31 tests passing.</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">11 brand-mode rules (BR-1 to BR-11), 5 lender-mode rules (LR-1 to LR-5). The canonical product reports 31 tests passing: 19 brand, 12 lender, run in the browser. These are its test counts, not this workspace's.</p>
      <div className="mt-4 flex flex-wrap gap-3"><Button asChild variant="outline"><a href="https://everyrupee-o2c.vercel.app/desk.html?uat=1">Run brand tests ↗</a></Button><Button asChild variant="outline"><a href="https://everyrupee-o2c.vercel.app/lender.html">Open lender desk ↗</a></Button></div>
      <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer font-semibold">All 16 business rules</summary><div className="mt-4 grid gap-8 sm:grid-cols-2">{[['Brand mode', brandRules], ['Lender mode', lenderRules]].map(([title, rules]) => <div key={String(title)}><h3 className="font-semibold">{String(title)}</h3><dl className="mt-3 divide-y divide-border">{(rules as string[][]).map(([id, title, text]) => <div key={id} className="py-3"><dt className="text-sm font-semibold">{id} · {title}</dt>{text && <dd className="mt-1 text-sm leading-6 text-muted-foreground">{text}</dd>}</div>)}</dl></div>)}</div></details>
    </section>
    <section className="border-b border-border py-8" aria-labelledby="quote-cash"><p className="text-xs font-semibold uppercase text-muted-foreground">Sales → Finance</p><h2 id="quote-cash" className="mt-2 text-2xl font-semibold">Quote to cash: one discount, end to end</h2><p className="mt-3 max-w-[75ch] text-sm leading-7 text-muted-foreground">A sales approval in Ten Today becomes a shared record; the deduction clears up to the cap, the excess goes to the rep, an expired approval goes back to the approver. Three outcomes, every ledger entry, invoice balances to the rupee.</p><Button asChild className="mt-4"><a href="https://everyrupee-o2c.vercel.app/route.html">Open quote-to-cash workflow ↗</a></Button></section>
    <section className="border-b border-border py-8" aria-labelledby="lender-mode"><p className="text-xs font-semibold uppercase text-muted-foreground">Lender workflow</p><h2 id="lender-mode" className="mt-2 text-2xl font-semibold">Lender mode: EMI bounces</h2><p className="mt-3 text-sm text-muted-foreground">Each NACH return code gets an owner and a next step.</p><dl className="mt-4 grid gap-5 sm:grid-cols-3">{[['04', 'Insufficient balance', 'Contact, then re-present.'], ['61', 'Mandate cancelled', 'Fresh mandate.'], ['06', 'Stopped by customer', 'Talk first; may be a dispute.']].map(([code, label, next]) => <div key={code}><dt className="text-sm font-semibold">{code} · {label}</dt><dd className="mt-1 text-sm text-muted-foreground">{next}</dd></div>)}</dl><Button asChild className="mt-5"><a href="https://everyrupee-o2c.vercel.app/lender.html">Open lender workflow ↗</a></Button></section>
  </div>;
}

function ImportedSectionADistributorPaysShort() {
  return (
    <section className="er-app py-12 text-center sm:py-16" aria-labelledby="intro-title">
      <p className="text-sm font-medium text-muted-foreground">Portfolio case study by Rupak Ghanpathi · sample data</p>
      <h1 id="intro-title" className="mx-auto mt-4 max-w-[24ch] text-4xl font-semibold text-foreground sm:text-5xl">Every Rupee<span className="mt-3 block text-2xl font-medium sm:text-3xl">Short-payment reconciliation, from invoice to cash.</span></h1>
      <p className="mx-auto mt-5 max-w-[60ch] text-base leading-7 text-muted-foreground">Designed for Indian B2B finance teams to find, explain and resolve deductions from invoices. Every gap gets a reason, an owner and an ending.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild className="min-h-11"><Link to="/demo">Try the demo</Link></Button><Button asChild variant="outline" className="min-h-11"><a href="#contact">Let's talk</a></Button></div>
      <p className="mt-6 font-semibold">The hard part of a deduction isn't matching it. It's owning it.</p>
      <div className="mx-auto mt-5 max-w-[68ch] border-y border-border py-4 text-sm leading-6 text-muted-foreground"><b className="text-foreground">Enforced and tested in the live desk:</b> maker-checker above ₹10,000 with self-approval blocked (BR-5); no rule can ever write money off (BR-4).<br /><a className="font-semibold text-primary underline" href="https://everyrupee-o2c.vercel.app/desk.html">See it run ↗</a><p className="mt-2">The live desk is the canonical product. This app's single-account workspace blocks resolutions above ₹10,000; it does not provide a separate checker or accounting postings.</p></div>
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
      "Needs checker"
    ],
    "q": [
      [
        "What",
        "Deducted ₹3,150 for transit damage."
      ],
      [
        "Why",
        "Proof attached, but above his usual pattern, so a person checks (BR-3)."
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
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[999px] text-[#0071e3] text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">Needs checker</span>
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

function ImportedSectionOpenWhatYouCare({ openDetails, setOpenDetails, deadline }: { openDetails: Record<string, boolean>; setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; deadline: number }) {
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
            <p className="text-(--gd) text-[.85rem] font-semibold tracking-[.01em] mt-[14px] mr-auto mb-0 ml-auto text-center">Enforced and tested in the canonical live desk: no rule can ever write money off (BR-4); maker-checker above ₹10,000, self-approval blocked (BR-5).</p>
            <p className="trk text-[.72rem] font-bold tracking-[.08em] mt-[26px] mr-0 mb-[10px] ml-0 text-center uppercase" id="trace">Canonical live desk · from a public filing to a running control</p>
            <ol className="tr6 gap-[10px] list-none m-0 p-0 [counter-reset:t]">
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Filing</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">Receivables +14.0% vs revenue +8.8%</b>
                <span className="text-(--mut) text-[.76rem]">Cello World, FY25→FY26</span>
              </li>
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Assumption</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">Short-payments sit unowned</b>
                <span className="text-(--mut) text-[.76rem]">A reason to look, not a diagnosis</span>
              </li>
              <li className="p-[12px]">
                <small className="text-[.66rem] font-bold tracking-[.08em] mb-[4px] uppercase">Requirement</small>
                <b className="text-[.86rem] leading-[1.3] mb-[4px]">US-5: no self-approval above ₹10,000</b>
                <span className="text-(--mut) text-[.76rem]">In the BRD</span>
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
                  <b className="text-[#0071e3] text-[3.4rem] tracking-[-.04em] leading-none [font-variant-numeric:tabular-nums]" id="xd">{deadline}</b>
                  <span className="text-(--ink2) text-[.82rem] mt-[8px]" id="xl">days to the FY 2025-26 credit-note deadline</span>
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
            <div className="mt-[16px]" id="ask">
              <div className="hook [background:linear-gradient(135deg,#F5F5F7,#F5F5F7)] border border-solid border-[#e8e8ed] rounded-[18px] mt-0 mr-auto mb-[12px] ml-auto max-w-[720px] py-[16px] px-[20px]" id="hook" hidden>
                <small className="text-[#0071e3] text-[.7rem] font-bold tracking-[.08em] mb-[4px] uppercase" id="hookt" />
                <p className="text-(--ink) text-[1rem] leading-normal m-0" id="hookp" />
              </div>
              <div className="askq [background:linear-gradient(135deg,#F5F5F7,#F5F5F7)] my-0 mx-auto max-w-none p-[22px] text-center">
                <small className="text-[.72rem] font-bold tracking-[.08em] mb-[6px] uppercase">The question I'd ask you</small>
                <p className="text-(--ink) text-[1.15rem] leading-[1.4] mt-0 mr-0 mb-[14px] ml-0 [font-weight:650]" id="l3">Which deduction type creates the most tickets or manual work for your customers today?</p>
                <a className="btn g sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" href={"mailto:rupakr2g@gmail.com?subject=Every%20Rupee%3A%20let%27s%20talk&body=Hi%20Rupak%2C%0A%0AYour%20question%3A%20Which%20deduction%20type%20creates%20the%20most%20tickets%20or%20manual%20work%20for%20your%20customers%20today%3F%0AShort%20answer%3A%20%0A%0AFree%20for%2020%20minutes%20on%3A%20"} id="m5">Answer it in one line</a>
              </div>
              <span id="l1" hidden>Your customers' AR teams live in this queue. Every unexplained deduction is a ticket, a manual match or a churn reason for your product.</span>
              <span id="l2" hidden>Sit with support and implementation, map the top deduction types your customers raise, and write the rules and UAT cases for one of them.</span>
              <span id="lensh" hidden />
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
            <p className="k text-[.74rem] font-bold tracking-[.12em]! mt-0 mr-0 mb-[8px] ml-0 text-left! uppercase">The thinking</p>
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
              <p className="miss bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white rounded-[16px] text-(--ink2) text-[.95rem] m-0! max-w-none py-[14px] px-[18px] text-left [border:1px_solid_var(--line)]"><b className="text-(--ink)">What I got wrong:</b> v2 was a wall of text, so I rebuilt it as something you can run, because a spec nobody executes isn't a spec.</p>
            </div>
            <div className="two-up gap-[14px] [@media(min-width:820px)]:grid-cols-[1fr_1fr]">
              <div className="pane bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white pt-[22px] pr-[22px] pb-[10px] pl-[22px]">
                <h3 className="text-[1rem] mt-0 mr-0 mb-[12px] ml-0">How I'd work from week one</h3>
                <ol className="pts list-none m-0 p-0 [counter-reset:p]">
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Evidence first.</b> Every fact dated and sourced.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">One owner per gap.</b> One decision, one deadline.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Testable rules.</b> 16 business rules and 31 browser tests across the canonical brand and lender desks. See the live desk for the full controls.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Controls built in.</b> Maker-checker above ₹10,000 and no write-off by rule are enforced and tested in the canonical live desk. Product certifications are not claimed.</li>
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
      <div className="founder bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white gap-[22px] p-[24px] [@media(min-width:820px)]:items-center [@media(min-width:820px)]:grid-cols-[1.2fr_1fr]">
        <div className="me items-start gap-[16px]">
          <img className="rounded-[50%] flex-none h-[64px] object-cover w-[64px]" src="/site-assets/21263e0575cbfff1.jpg" alt="Rupak Ghanpathi" width="64" height="64" loading="lazy" />
          <div>
            <p className="text-(--ink2) text-[.95rem] mt-0 mr-0 mb-[8px] ml-0"><strong className="text-(--ink)">I'm Rupak.</strong> I spent 2.5 years as a Business Analyst at HDFC Bank: 25+ BRDs, 15+ releases on time, zero SOX findings. I built Every Rupee alone: from Cello's annual report to the rules, product and tests.</p>
            <p className="sig text-(--ink) text-[1.05rem] mt-0 mr-0 mb-[8px] ml-0">— Rupak</p>
          </div>
        </div>
        <div className="reply">
          <h3 className="text-[1.1rem] mt-0 mr-0 mb-[4px] ml-0" id="rh">Building for finance ops or fintech?</h3>
          <p className="text-(--mut) text-[.88rem] mt-0 mr-0 mb-[12px] ml-0" id="rp">Request a demo below, or email Rupak directly.</p>
          <div className="chips flex-wrap gap-[8px] [@media(max-width:640px)]:gap-[8px] [@media(max-width:640px)]:grid-cols-[1fr_1fr]"><a className="chip p items-center text-[.88rem] h-[40px] py-0 px-[15px] no-underline transition-all duration-150 [font-weight:550] [@media(max-width:640px)]:justify-center [@media(max-width:640px)]:text-center" href={"mailto:rupakr2g@gmail.com?subject=Every%20Rupee%3A%20let's%20talk&body=Hi%20Rupak%2C%0A%0AYour%20question%3A%20Which%20deduction%20type%20creates%20the%20most%20tickets%20or%20manual%20work%20for%20your%20customers%20today%3F%0AShort%20answer%3A%20%0A%0AFree%20for%2020%20minutes%20on%3A%20"} id="m1">Let's talk this week</a><a className="chip items-center text-[.88rem] h-[40px] py-0 px-[15px] no-underline transition-all duration-150 [font-weight:550] [@media(max-width:640px)]:justify-center [@media(max-width:640px)]:text-center" href={"mailto:rupakr2g@gmail.com?subject=Every%20Rupee%3A%20not%20a%20fit&body=Hi%20Rupak%2C%0A%0ANot%20a%20fit%20right%20now%2C%20because%3A%20"} id="m3">Not a fit, here's why</a></div>
          <div className="er-app mt-5"><DemoRequest /></div>
          <p className="small items-center text-(--mut) text-[.8rem] gap-[8px] mt-[12px] mr-0 mb-0 ml-0"><span className="dot bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#34c759] rounded-[50%] flex-none h-[8px] w-[8px]" />Open to BA and Product roles · fintech, BFSI, finance software · Bengaluru · immediate joiner</p>
        </div>
      </div>
    </section>
  );
}

function ImportedFooter() {
  return (
    <footer className="bg-none! [background-position:0%_0%]! [background-size:auto_auto]! [background-repeat:repeat]! [background-origin:padding-box]! [background-clip:border-box]! [background-attachment:scroll]! bg-white! text-(--ink2) text-[.86rem] mt-[40px]! pt-[40px] pr-0 pb-[20px] pl-0 pt-[30px]! [border-top:1px_solid_#E2E8F0]">
      <div className="col my-0 mx-auto max-w-[1040px]">
        <div className="fgrid">
          <div className="fbrand">
            <a className="logo items-center text-[1.02rem] gap-[9px] tracking-[-.02em] no-underline [font-weight:650]" href="/">
              <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Every Rupee">
                <circle cx="16" cy="16" r="13" fill="none" stroke="#64748B" strokeWidth="4.5" strokeDasharray="2.48 79.20" transform="rotate(-90 16 16)" />
                <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="31.07 50.61" strokeDashoffset="-4.08" transform="rotate(-90 16 16)" />
                <circle cx="16" cy="16" r="13" fill="none" stroke="#0071E3" strokeWidth="4.5" strokeDasharray="43.32 38.36" strokeDashoffset="-36.76" transform="rotate(-90 16 16)" />
                <text x="16" y="21.2" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="14" fill="#111827">₹</text>
              </svg>
              <span>Every Rupee</span>
            </a>
            <p className="text-(--mut) text-[.88rem] mt-[10px] mr-0 mb-[12px] ml-0 max-w-[30ch]">Every short-paid rupee gets a reason, an owner and an ending.</p>
            <a className="fmail text-[.88rem] font-semibold no-underline" href="mailto:rupakr2g@gmail.com">rupakr2g@gmail.com</a>
          </div>
          <div>
            <h4 className="text-(--mut) text-[.72rem] tracking-[.08em] mt-0 mr-0 mb-[10px] ml-0 uppercase">The work</h4>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/demo">Open the product</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href={"mailto:?subject=Worth%2090%20seconds%3A%20Every%20Rupee&body=A%20BA%20built%20a%20working%20deduction%20workflow%2C%20with%20rules%2C%20tests%20and%20the%20new%20GST%20credit-note%20rule%3A%0Ahttps%3A%2F%2Feveryrupee-o2c.vercel.app%2F%0A"} id="m4">Forward to a colleague</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://everyrupee-o2c.vercel.app/desk.html?uat=1">Original case-study tests ↗</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://everyrupee-o2c.vercel.app/route.html">Original sales → finance case study ↗</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://everyrupee-o2c.vercel.app/lender.html?tour=1">Original lender case study ↗</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://everyrupee-o2c.vercel.app/case-study.html">Original full case study ↗</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://everyrupee-o2c.vercel.app/Every_Rupee_Deck.pdf">Deck (PDF)</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://everyrupee-o2c.vercel.app/Cello_O2C_BRD.pdf">BRD (PDF)</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://everyrupee-o2c.vercel.app/Cello_O2C_One_Pager.pdf">One-pager (PDF)</a>
          </div>
          <div>
            <h4 className="text-(--mut) text-[.72rem] tracking-[.08em] mt-0 mr-0 mb-[10px] ml-0 uppercase">Trust</h4>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/capabilities">Sources</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="#privacy">Privacy</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://github.com/RUPAK30/Cello-O2C-Deduction-Workflow-Case-Study">GitHub</a>
          </div>
          <div>
            <h4 className="text-(--mut) text-[.72rem] tracking-[.08em] mt-0 mr-0 mb-[10px] ml-0 uppercase">More by Rupak</h4>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://rupak-lemon.vercel.app">Portfolio</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://lull-hr.vercel.app/">Viraam</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="https://tentoday.vercel.app/">Ten Today</a>
          </div>
        </div>
        <div className="fb text-(--mut) flex-wrap text-[.76rem] gap-[10px] justify-between mt-[28px] pt-[16px] [border-top:1px_solid_var(--line)]">
          <span>© 2026 Rupak Ghanpathi · Portfolio case study, not affiliated with Cello World. No brand uses it yet.</span>
          <span>Tax rules summarised from public sources, Oct 2026. Not tax advice.</span>
        </div>
      </div>
    </footer>
  );
}
