import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FileCheck2,
  ShieldCheck,
  Target,
} from 'lucide-react';

export const Route = createFileRoute('/saas')({
  component: SaasControlRoom,
});

interface SaasDeal {
  id: string;
  account: string;
  arrList: number;
  discountPct: number;
  aiTokenCogsPct: number;
  approvedBy: string | null;
  rep: string;
  hasCustomSOW: boolean;
  poAccepted: boolean;
  stripeMatched: boolean;
}

const INITIAL_DEALS: SaasDeal[] = [
  {
    id: 'DEAL-801',
    account: 'FinServe Cloud India',
    arrList: 2400000,
    discountPct: 12,
    aiTokenCogsPct: 18,
    approvedBy: 'VP Sales (Vikram)',
    rep: 'Rahul (AE)',
    hasCustomSOW: false,
    poAccepted: true,
    stripeMatched: true,
  },
  {
    id: 'DEAL-802',
    account: 'Veloce Logistics AI',
    arrList: 1800000,
    discountPct: 32,
    aiTokenCogsPct: 24,
    approvedBy: null,
    rep: 'Rahul (AE)',
    hasCustomSOW: true,
    poAccepted: false,
    stripeMatched: false,
  },
];

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function SaasControlRoom() {
  const [deals, setDeals] = useState<SaasDeal[]>(INITIAL_DEALS);
  const [selectedId, setSelectedId] = useState<string>('DEAL-802');
  const [auditorOpen, setAuditorOpen] = useState(false);

  const active = deals.find(d => d.id === selectedId) ?? deals[0];
  const netArr = Math.round(active.arrList * (1 - active.discountPct / 100));
  const aiCogs = Math.round(active.arrList * (active.aiTokenCogsPct / 100));
  const grossMarginPct = Number((((netArr - aiCogs) / Math.max(1, netArr)) * 100).toFixed(1));

  const controls = [
    {
      id: 'C1',
      name: 'AI Margin Floor',
      ok: grossMarginPct >= 65,
      detail:
        grossMarginPct >= 65
          ? `Gross margin ${grossMarginPct}% ≥ 65% target after AI token COGS`
          : `Margin breach: ${grossMarginPct}% < 65% floor (${active.discountPct}% discount + ${active.aiTokenCogsPct}% AI COGS)`,
    },
    {
      id: 'C2',
      name: 'Deal-Desk Authority',
      ok: Boolean(active.approvedBy && active.approvedBy !== active.rep),
      detail: active.approvedBy ? `Approved by ${active.approvedBy}` : 'Blocked: >15% discount requires VP Sales sign-off',
    },
    {
      id: 'C3',
      name: 'RevRec Classification',
      ok: !active.hasCustomSOW,
      detail: active.hasCustomSOW
        ? 'Flagged for RevRec (ASC 606 / Ind AS 115): Custom AI onboarding SOW'
        : 'Standard SaaS subscription',
    },
    {
      id: 'C4',
      name: 'Tax & GST Route',
      ok: true,
      detail: '18% SAC 998314 SaaS e-Invoice + IRN validated',
    },
    {
      id: 'C5',
      name: 'Enterprise PO Gate',
      ok: active.poAccepted,
      detail: active.poAccepted ? 'Customer PO accepted in procurement portal' : 'PO pending — 48h Deal-Desk SLA active',
    },
    {
      id: 'C6',
      name: 'Cash / Stripe Match',
      ok: active.stripeMatched,
      detail: active.stripeMatched ? 'Wire / Stripe payout matched to net ARR' : 'Uncollected — AE commission held',
    },
    {
      id: 'C7',
      name: 'SOC2 / SOX Evidence',
      ok: Boolean(active.approvedBy && active.poAccepted),
      detail: active.approvedBy && active.poAccepted ? 'Complete quote-to-cash audit pack' : 'Incomplete audit trail',
    },
  ];

  const failedCount = controls.filter(c => !c.ok).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white shadow-sm">
              <Cpu className="size-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">Every Rupee · B2B SaaS FinOps</span>
              <span className="block text-[0.7rem] font-medium text-teal-700">
                AI-Usage &amp; Deal-Desk Billing Leakage Control Room
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/ecommerce"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 no-underline"
            >
              Quick-Commerce (Blinkit/Zepto) →
            </Link>
            <Link
              to="/demo"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 no-underline"
            >
              Core O2C Desk
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8 space-y-6">
        {/* OKR Banner */}
        <section className="rounded-2xl border border-teal-800/20 bg-gradient-to-br from-[#0F172A] to-[#134E4A] p-6 text-white shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-teal-200 border border-teal-300/30">
                <Target className="size-3.5" /> Quarterly FinOps OKRs · Hybrid Seat + AI Token Pricing
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
                Protect AI Gross Margin &amp; Eliminate Unapproved Deal-Desk Leakage.
              </h1>
            </div>
            <Button
              size="sm"
              onClick={() => setAuditorOpen(v => !v)}
              className="bg-white text-slate-900 hover:bg-teal-50 font-semibold text-xs"
            >
              <FileCheck2 className="size-3.5 mr-1.5" /> Sample 5 Deals Like an Auditor
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-teal-200">OKR 1 · ARR Leakage</span>
              <p className="mt-1 text-lg font-bold m-0">&lt; 1.5% Unapproved</p>
              <span className="text-xs text-teal-100/80">Maker-checker blocks rogue AE discounts</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-teal-200">OKR 2 · AI Gross Margin</span>
              <p className="mt-1 text-lg font-bold m-0">≥ 65.0% Floor</p>
              <span className="text-xs text-teal-100/80">Live inference COGS checked before quote</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-teal-200">OKR 3 · Audit &amp; SLA</span>
              <p className="mt-1 text-lg font-bold m-0">0 TAT Breaches</p>
              <span className="text-xs text-teal-100/80">SOC2 / SOX evidence pack per deal</span>
            </div>
          </div>
        </section>

        {auditorOpen && (
          <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 text-xs flex items-center justify-between">
            <div>
              <b className="text-teal-900 text-sm block">✓ SOC2 / SOX Audit Sample Ready</b>
              <span className="text-teal-800">
                5 random enterprise deals bundled with Deal-Desk approvals, AI COGS logs, IRN e-invoices, and SHA-256 seals.
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setAuditorOpen(false)}>Close</Button>
          </div>
        )}

        {/* Interactive Deal Simulator + 7 Controls */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 m-0">Select Enterprise Deal</h2>
            <div className="space-y-2">
              {deals.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    d.id === active.id ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between font-bold text-sm">
                    <span>{d.account}</span>
                    <span>{fmtINR(d.arrList)}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {d.id} · Discount: {d.discountPct}% · AI COGS: {d.aiTokenCogsPct}%
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Interactive Discount %: <b>{active.discountPct}%</b>
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={active.discountPct}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setDeals(prev => prev.map(d => (d.id === active.id ? { ...d, discountPct: val } : d)));
                  }}
                  className="mt-1 w-full accent-teal-700"
                />
              </label>
              <div className="rounded-lg bg-slate-50 p-3 text-xs flex justify-between">
                <span>Live Net ARR: <b>{fmtINR(netArr)}</b></span>
                <span>Gross Margin: <b className={grossMarginPct < 65 ? 'text-amber-700' : 'text-teal-700'}>{grossMarginPct}%</b></span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 m-0">
                7-Control Evaluation · {active.account}
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${failedCount === 0 ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-900'}`}>
                {failedCount === 0 ? '7/7 Passed' : `${failedCount} Failed`}
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {controls.map(c => (
                <div
                  key={c.id}
                  className={`rounded-xl border p-3 text-xs ${
                    c.ok ? 'border-teal-200 bg-teal-50/40' : 'border-amber-300 bg-amber-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{c.id} · {c.name}</span>
                    {c.ok ? <CheckCircle2 className="size-4 text-teal-600" /> : <AlertTriangle className="size-4 text-amber-600" />}
                  </div>
                  <p className="m-0 mt-1 text-slate-700">{c.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
