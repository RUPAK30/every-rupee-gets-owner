import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/site.css?raw";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Every Rupee · A distributor pays short. On day 31 it's still nobody's problem." }] }),
  staticData: { importedDocument: { html: { "lang": "en" }, body: {  } } },
  component: Index,
});

function Index() {
  return (
    <>
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
            <a href="/sourceshtml-4d61cecf944a5abe">Sources</a>
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
          <div className="hr items-center gap-[10px] justify-end"><a className="hlink font-semibold no-underline" href="/routehtml-14c6d47caa03a836">Quote to cash</a> <a className="hlink font-semibold no-underline" href="/lenderhtml-14a2640f9e23c19b?tour=1">Lender</a></div>
        </div>
      </header>
      <main className="col my-0 mx-auto max-w-[1040px]">
        <ImportedSectionADistributorPaysShort />
        <section className="q2c mt-[22px] mr-auto mb-[6px] ml-auto max-w-[1080px] py-0 px-[16px]" aria-label="Quote to cash, end to end">
          <a className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white border-2 border-solid border-site-import-accent rounded-[16px] py-[18px] px-[20px] no-underline" href="/routehtml-14c6d47caa03a836">{"\n  "}<span className="q2k text-site-import-accent tracking-[0.14em] mb-[6px] uppercase [font:700_0.7rem_Inter,Arial]">New · quote to cash, end to end</span>{"\n  "}<b className="text-site-import-foreground text-[1.25rem] leading-[1.3]">Follow one discount from the sales approval to closed books</b>{"\n  "}<span className="q2s text-[0.93rem] mt-[6px] mr-0 mb-[12px] ml-0">Rahul promises it, Kavita approves it, the distributor deducts it. Three outcomes, every date and ledger entry, until the invoice balances to the rupee.</span>{"\n  "}<span className="q2o items-center flex-wrap gap-[8px]"><i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#f0fdfa] rounded-[99px] text-site-import-accent text-[0.8rem] not-italic font-semibold py-[4px] px-[10px]">Clean match</i><i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#f0fdfa] rounded-[99px] text-site-import-accent text-[0.8rem] not-italic font-semibold py-[4px] px-[10px]">Over-deduction</i><i className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#f0fdfa] rounded-[99px] text-site-import-accent text-[0.8rem] not-italic font-semibold py-[4px] px-[10px]">Expired approval</i><em className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-primary rounded-[10px] text-white not-italic font-bold py-[8px] px-[14px] [@media(max-width:600px)]:text-center [@media(max-width:600px)]:w-full">See it end to end →</em></span>{"\n"}</a>
        </section>
        <ImportedSection />
        <section className="sec" id="now">
          <div className="nowst bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden"><a className={"text-center no-underline [&:hover]:bg-none [&:hover]:[background-position:0%_0%] [&:hover]:[background-size:auto_auto] [&:hover]:[background-repeat:repeat] [&:hover]:[background-origin:padding-box] [&:hover]:[background-clip:border-box] [&:hover]:[background-attachment:scroll] [&:hover]:bg-site-import-background"} href="#evidence"><b className="text-site-import-primary! tracking-[-.02em]">+14% vs +8.8%</b><span className="text-(--mut) [@media(max-width:640px)]:leading-[1.3]">Cello's receivables vs revenue, FY26</span></a><a className={"text-center no-underline [&:hover]:bg-none [&:hover]:[background-position:0%_0%] [&:hover]:[background-size:auto_auto] [&:hover]:[background-repeat:repeat] [&:hover]:[background-origin:padding-box] [&:hover]:[background-clip:border-box] [&:hover]:[background-attachment:scroll] [&:hover]:bg-site-import-background"} href="#evidence"><b className="text-site-import-primary! tracking-[-.02em]">₹3.5–5</b><span className="text-(--mut) [@media(max-width:640px)]:leading-[1.3]">distributor margin per ₹100</span></a><a className={"text-center no-underline [&:hover]:bg-none [&:hover]:[background-position:0%_0%] [&:hover]:[background-size:auto_auto] [&:hover]:[background-repeat:repeat] [&:hover]:[background-origin:padding-box] [&:hover]:[background-clip:border-box] [&:hover]:[background-attachment:scroll] [&:hover]:bg-site-import-background"} href="#evidence"><b className="text-site-import-primary! tracking-[-.02em]"><span className="[color:inherit]! [@media(max-width:640px)]:leading-[1.3]" id="xd2">23</span> days</b><span className="text-(--mut) [@media(max-width:640px)]:leading-[1.3]">to the credit-note deadline, 30 Nov</span></a></div>
        </section>
        <ImportedSectionOpenWhatYouCare />
        <ImportedSection2 />
      </main>
      <ImportedFooter />
    </>
  );
}

function ImportedSectionADistributorPaysShort() {
  return (
    <section className="hero bg-none! [background-position:0%_0%]! [background-size:auto_auto]! [background-repeat:repeat]! [background-origin:padding-box]! [background-clip:border-box]! [background-attachment:scroll]! bg-site-import-primary! text-white text-center [clip-path:inset(0_-100vmax)]"><span style={{ display: "none" }} id="forchip" hidden /><span className="eye2 bg-none! [background-position:0%_0%]! [background-size:auto_auto]! [background-repeat:repeat]! [background-origin:padding-box]! [background-clip:border-box]! [background-attachment:scroll]! bg-[#ffffff14]! border-[#ffffff2e]! rounded-[999px] text-site-import-border! [border:1px_solid_var(--line)] [font-weight:550]">Portfolio case study by Rupak Ghanpathi<span className="hm"> · built solo · sample data</span></span><h1 className="text-white! font-[family-name:Inter,system-ui,sans-serif] font-bold tracking-[-.03em]! max-w-[22ch]">A distributor pays short. <em className="not-italic">On day 31 it's still nobody's problem.</em></h1><p className="lead text-[#cbd5e1]! max-w-[56ch]">Every Rupee is a short-payment reconciliation desk for FMCG finance teams, built from Cello World's public filings.<span className="hm"> Every gap gets one owner and ends in a credit note or a recovery.</span></p><div className="cta flex-wrap justify-center [@media(max-width:640px)]:grid-cols-[1fr_1fr] [@media(max-width:640px)]:mt-0! [@media(max-width:640px)]:w-full"><a className="btn g items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline [@media(max-width:640px)]:justify-center" href="/deskhtml-3389631ed0142b9e?tour=1">Try the live desk<svg className="h-[15px] transition-transform duration-150 w-[15px]" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a><a className="btn items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline [@media(max-width:640px)]:justify-center" href="#contact">Talk to Rupak</a></div><p className="thesis text-white! font-bold tracking-[-.01em]">The hard part of a deduction isn't matching it. It's owning it.</p><p className="dec bg-none! [background-position:0%_0%]! [background-size:auto_auto]! [background-repeat:repeat]! [background-origin:padding-box]! [background-clip:border-box]! [background-attachment:scroll]! bg-[#ffffff0f]! text-site-import-border! max-w-[640px] text-left"><b className="text-white!">The call I made:</b> control over speed. No auto write-offs, maker-checker above ₹10,000, strict matching at launch. Fewer auto-matches and more manual work, on purpose.</p></section>
  );
}

function ImportedSection() {
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
            <button role="tab" aria-selected="true">
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹1,180</span>
              <span className="rs text-[.88rem]">Scheme claim<small className="text-(--mut) text-[.78rem]">Festival discount, budget approved</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[999px] text-(--gd) text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">Closed</span>
            </button>
          </li>
          <li>
            <button role="tab" aria-selected="false">
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹12,400</span>
              <span className="rs text-[.88rem]">Scheme claim<small className="text-(--mut) text-[.78rem]">No approved budget: a verbal promise</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-(--gold-s) rounded-[999px] text-(--gold) text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">1 day left</span>
            </button>
          </li>
          <li>
            <button role="tab" aria-selected="false">
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹3,150</span>
              <span className="rs text-[.88rem]">Damage claim<small className="text-(--mut) text-[.78rem]">Proof of delivery attached</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[999px] text-[#0071e3] text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">Needs checker</span>
            </button>
          </li>
          <li>
            <button role="tab" aria-selected="false">
              <span className="text-[1rem] font-bold [font-variant-numeric:tabular-nums]">₹860</span>
              <span className="rs text-[.88rem]">TDS<small className="text-(--mut) text-[.78rem]">Tax withheld under section 194Q</small></span>
              <span className="st bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-muted rounded-[999px] text-(--gd) text-[.7rem] font-semibold py-[3px] px-[9px] whitespace-nowrap [@media(max-width:560px)]:col-start-2">Matched</span>
            </button>
          </li>
        </ul>
        <div className="det [background:linear-gradient(160deg,#FBFBFD,#FAFAFC)] py-[20px] px-[22px]" role="tabpanel" aria-live="polite">
          <h3 className="text-[1.15rem] tracking-[-.02em] mt-0 mr-0 mb-[4px] ml-0" id="dt">₹1,180 · Scheme claim</h3>
          <p className="text-(--mut) text-[.86rem] mt-0 mr-0 mb-[14px] ml-0" id="ds">Festival discount, budget approved</p>
          <div className="qa gap-[8px] mt-0 mr-0 mb-[16px] ml-0" id="qa">
            <div className="text-[.9rem]">
              <b className="text-(--gd) text-[.7rem] tracking-[.07em] pt-[2px] uppercase">What</b>
              <span>Paid ₹10,620 on ₹11,800; took a 10% festival discount.</span>
            </div>
            <div className="text-[.9rem]">
              <b className="text-(--gd) text-[.7rem] tracking-[.07em] pt-[2px] uppercase">Why</b>
              <span>Budget approved, evidence attached: valid (BR-3).</span>
            </div>
            <div className="text-[.9rem]">
              <b className="text-(--gd) text-[.7rem] tracking-[.07em] pt-[2px] uppercase">Who</b>
              <span>Asha, finance ops. Under ₹10,000, no checker.</span>
            </div>
            <div className="text-[.9rem]">
              <b className="text-(--gd) text-[.7rem] tracking-[.07em] pt-[2px] uppercase">How</b>
              <span>GST credit note ₹1,180 (₹1,000 + ₹180 GST). Distributor reverses; brand recovers ₹180.</span>
            </div>
          </div>
          <div className="track gap-[6px] mt-0 mr-0 mb-[10px] ml-0" id="tr">
            <span className="on [background:linear-gradient(90deg,#34C759,#0071E3)] rounded-[9px] flex-1 h-[6px] [transition:background_.3s]" />
            <span className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#f2f2f4] rounded-[9px] flex-1 h-[6px] [transition:background_.3s]" />
            <span className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#f2f2f4] rounded-[9px] flex-1 h-[6px] [transition:background_.3s]" />
            <span className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#f2f2f4] rounded-[9px] flex-1 h-[6px] [transition:background_.3s]" />
            <span className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-[#f2f2f4] rounded-[9px] flex-1 h-[6px] [transition:background_.3s]" />
          </div>
          <p className="text-(--ink2) text-[.86rem] mt-0 mr-0 mb-[12px] ml-0 min-h-[2.6em]" id="sg">Step 1 of 5 · <b className="text-(--ink)">Payment arrives.</b> ₹10,620 on a ₹11,800 bill.</p>
          <div className="ctl flex-wrap gap-[8px]">
            <button className="btn g sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" id="nx" type="button">Next step <svg className="h-[15px] transition-transform duration-150 w-[15px]" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <button className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" id="rs" type="button">Replay</button>
            <a className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" href="/deskhtml-3389631ed0142b9e">Do it in the product</a>
            <a className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" href="/routehtml-14c6d47caa03a836">Where the deduction started: the sales promise →</a>
            <a className="btn sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" href="/lenderhtml-14a2640f9e23c19b?tour=1">Same discipline for a lender: NACH bounces →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImportedSectionOpenWhatYouCare() {
  return (
    <section className="sec" id="deep">
      <p className="k text-[.74rem] font-bold tracking-[.12em]! mt-0 mr-0 mb-[8px] ml-0 text-left! uppercase">Go deeper</p>
      <h2 className="text-[clamp(1.5rem,3vw,2.1rem)]! font-bold tracking-[-.02em] leading-[1.15] mt-0 mr-auto mb-[22px] ml-auto mb-[16px]! ml-0! max-w-[30ch]! text-left!">Open what you care about</h2>
      <div className="deep gap-[10px]">
        <details className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
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
                    <th className="bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-site-import-card text-(--mut) tracking-[.06em] text-left uppercase">On the desk</th>
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
            <p className="text-(--gd) text-[.85rem] font-semibold tracking-[.01em] mt-[14px] mr-auto mb-0 ml-auto text-center">0 auto write-offs · maker-checker above ₹10,000 · 16 rules, 31 tests across brand and lender modes, run in the browser</p>
            <p className="trk text-[.72rem] font-bold tracking-[.08em] mt-[26px] mr-0 mb-[10px] ml-0 text-center uppercase" id="trace">Traceability · from a public filing to a running control</p>
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
        <details className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
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
                  <b className="text-[#0071e3] text-[3.4rem] tracking-[-.04em] leading-none [font-variant-numeric:tabular-nums]" id="xd">23</b>
                  <span className="text-(--ink2) text-[.82rem] mt-[8px]" id="xl">days to the FY 2025-26 credit-note deadline</span>
                </div>
              </div>
            </div>
          </section>
        </details>
        <details className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
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
              <div><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Monthly billing to distributors (₹ lakh)<input className="py-[8px] px-[10px] text-right w-full" id="bill" type="number" min="0" defaultValue="500" /></label><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Share short-paid (%)<input className="py-[8px] px-[10px] text-right w-full" id="pct" type="number" min="0" step="0.5" defaultValue="3" /></label><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Days to settle<input className="py-[8px] px-[10px] text-right w-full" id="days" type="number" min="0" defaultValue="60" /></label><label className="items-center text-[.9rem] gap-[10px] py-[6px] px-0">Cost of money (% a year)<input className="py-[8px] px-[10px] text-right w-full" id="rate" type="number" min="0" step="0.5" defaultValue="12" /></label></div>
              <div className="out gap-[10px]">
                <div className="[background:linear-gradient(135deg,#F5F5F7,#F5F5F7)] rounded-[16px] p-[16px]">
                  <b className="text-(--gd) text-[1.7rem] tracking-[-.02em]" id="o1">₹30 lakh</b>
                  <span className="text-(--ink2) text-[.84rem]">cash stuck at any time</span>
                </div>
                <div className="[background:linear-gradient(135deg,#F5F5F7,#F5F5F7)] rounded-[16px] p-[16px]">
                  <b className="text-(--gd) text-[1.7rem] tracking-[-.02em]" id="o2">₹3.6 lakh</b>
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
        <details className="dp bg-none [background-position:0%_0%] [background-size:auto_auto] [background-repeat:repeat] [background-origin:padding-box] [background-clip:border-box] [background-attachment:scroll] bg-white overflow-hidden">
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
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Testable rules.</b> 16 rules, 31 tests, "must block" cases included.</li>
                  <li className="pt-0 pr-0 pb-[12px] pl-[36px] [counter-increment:p]"><b className="text-(--ink)">Controls built in.</b> Maker-checker, no auto write-offs. Zero SOX findings at HDFC.</li>
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
              <span><b className="text-(--ink)">Runs in your browser.</b> Uploaded files never leave your device.</span>
              <span>
                <b className="text-(--ink)">No sign-up, no tracking.</b>
              </span>
              <span>
                <b className="text-(--ink)">Sample data only.</b>
              </span>
              <a className="items-center font-semibold gap-[4px] no-underline" href="/sourceshtml-4d61cecf944a5abe">Sources, and what I don't claim <svg className="h-[13px] w-[13px]" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
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
          <p className="text-(--mut) text-[.88rem] mt-0 mr-0 mb-[12px] ml-0" id="rp">One tap, email pre-filled.</p>
          <div className="chips flex-wrap gap-[8px] [@media(max-width:640px)]:gap-[8px] [@media(max-width:640px)]:grid-cols-[1fr_1fr]"><a className="chip p items-center text-[.88rem] h-[40px] py-0 px-[15px] no-underline transition-all duration-150 [font-weight:550] [@media(max-width:640px)]:justify-center [@media(max-width:640px)]:text-center" href={"mailto:rupakr2g@gmail.com?subject=Every%20Rupee%3A%20let's%20talk&body=Hi%20Rupak%2C%0A%0AYour%20question%3A%20Which%20deduction%20type%20creates%20the%20most%20tickets%20or%20manual%20work%20for%20your%20customers%20today%3F%0AShort%20answer%3A%20%0A%0AFree%20for%2020%20minutes%20on%3A%20"} id="m1">Let's talk this week</a><a className="chip items-center text-[.88rem] h-[40px] py-0 px-[15px] no-underline transition-all duration-150 [font-weight:550] [@media(max-width:640px)]:justify-center [@media(max-width:640px)]:text-center" href={"mailto:rupakr2g@gmail.com?subject=Every%20Rupee%3A%20not%20a%20fit&body=Hi%20Rupak%2C%0A%0ANot%20a%20fit%20right%20now%2C%20because%3A%20"} id="m3">Not a fit, here's why</a></div>
          <form className="ask gap-[8px] mt-[12px] mr-0 mb-[4px] ml-0" id="askf">
            <input className="flex-1 h-[44px] min-w-0 py-0 px-[14px]" id="askq" maxLength={200} placeholder="Or ask one question. I reply within a day." aria-label="Your question" />
            <button className="btn g sm items-center cursor-pointer gap-[8px] tracking-[-.01em] no-underline" type="submit">Ask</button>
          </form>
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
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/deskhtml-3389631ed0142b9e">Open the product</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href={"mailto:?subject=Worth%2090%20seconds%3A%20Every%20Rupee&body=A%20BA%20built%20a%20working%20deduction%20workflow%2C%20with%20rules%2C%20tests%20and%20the%20new%20GST%20credit-note%20rule%3A%0Ahttps%3A%2F%2Feveryrupee-o2c.vercel.app%2F%0A"} id="m4">Forward to a colleague</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/deskhtml-3389631ed0142b9e?uat=1">Run the brand tests</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/routehtml-14c6d47caa03a836">Sales → finance route</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/lenderhtml-14a2640f9e23c19b?tour=1">Lender mode</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/case-studyhtml-1bb901a464cb168d">Full case study</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="Every_Rupee_Deck.pdf">Deck (PDF)</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="Cello_O2C_BRD.pdf">BRD (PDF)</a>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="Cello_O2C_One_Pager.pdf">One-pager (PDF)</a>
          </div>
          <div>
            <h4 className="text-(--mut) text-[.72rem] tracking-[.08em] mt-0 mr-0 mb-[10px] ml-0 uppercase">Trust</h4>
            <a className="text-[.88rem] py-[4px] px-0 no-underline" href="/sourceshtml-4d61cecf944a5abe">Sources</a>
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
