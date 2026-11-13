import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  evaluateControls,
  SAMPLE_MARKETPLACE_DEDUCTIONS,
  type MarketplaceDeduction,
} from '@/lib/reconciliation/controls-engine';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileCheck2,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Route = createFileRoute('/ecommerce')({
  component: EcommerceControlRoom,
});

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function EcommerceControlRoom() {
  const [deductions, setDeductions] = useState<MarketplaceDeduction[]>(SAMPLE_MARKETPLACE_DEDUCTIONS);
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_MARKETPLACE_DEDUCTIONS[1].id);
  const [showPayload, setShowPayload] = useState<'servicenow' | 'jira' | null>(null);
  const [auditSample, setAuditSample] = useState<string[] | null>(null);

  const evaluations = deductions.map(d => ({ d, res: evaluateControls(d) }));
  const totalDeductions = deductions.reduce((s, d) => s + d.deductionAmount, 0);
  const totalGstAtRisk = evaluations.reduce((s, e) => s + e.res.gstAtRisk, 0);
  const passCount = evaluations.filter(e => e.res.allPassed).length;
  const passRate = Math.round((passCount / deductions.length) * 100);
  const allTickets = evaluations.flatMap(e => e.res.tickets);

  const activeEval = evaluations.find(e => e.d.id === selectedId) ?? evaluations[0];

  const triggerFailure = (kind: 'reject_ims' | 'margin_burn' | 'reset') => {
    if (kind === 'reset') {
      setDeductions(SAMPLE_MARKETPLACE_DEDUCTIONS);
      return;
    }
    setDeductions(prev =>
      prev.map(d => {
        if (d.id !== selectedId) return d;
        if (kind === 'reject_ims') return { ...d, imsStatus: 'REJECTED' };
        return { ...d, discountPct: 22, extraVolumePct: 5 };
      })
    );
  };

  const exportMisCsv = () => {
    const rows = [
      ['Deduction ID', 'Platform', 'SKU', 'Deduction (INR)', 'GST at Risk (INR)', 'All 7 Controls Passed', 'Open Tickets'],
      ...evaluations.map(({ d, res }) => [
        d.id,
        d.platform,
        d.sku,
        String(d.deductionAmount),
        String(res.gstAtRisk),
        res.allPassed ? 'PASS' : 'FAIL',
        String(res.tickets.length),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quick-commerce-weekly-mis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F6FBF9] text-[#0F172A] font-sans">
      {/* E-Commerce Top Bar */}
      <header className="sticky top-0 z-30 border-b border-emerald-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#059669] to-[#10B981] text-white shadow-sm">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#064E3B]">Every Rupee · Quick-Commerce</span>
              <span className="block text-[0.7rem] font-medium text-emerald-700">
                Blinkit · Zepto · Amazon · Flipkart Payout Control Room
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/saas"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 no-underline"
            >
              Switch to B2B SaaS (Option 2) →
            </Link>
            <Link
              to="/demo"
              className="rounded-lg bg-[#064E3B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#047857] no-underline"
            >
              Core O2C Desk
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8 space-y-6">
        {/* Hero / Layman + Executive Summary */}
        <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#047857] p-6 text-white shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-emerald-200 border border-emerald-300/30">
                <Zap className="size-3.5" /> D2C &amp; Quick-Commerce Deduction Control Room
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
                Stop losing 5–12% of marketplace payouts to silent Blinkit &amp; Zepto deductions.
              </h1>
              <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed m-0">
                Every marketplace deduction—visibility ads, weight overcharges, or damaged returns—runs through{' '}
                <b>7 automated controls</b>. If a control fails, an exception ticket opens with an owner and a{' '}
                <b>settlement-window deadline</b>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={exportMisCsv}
                className="bg-white text-[#064E3B] hover:bg-emerald-50 font-semibold text-xs"
              >
                <Download className="size-3.5 mr-1.5" /> Export Weekly MIS (CSV)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAuditSample(deductions.map(d => d.id))}
                className="border-emerald-300/40 bg-emerald-800/40 text-white hover:bg-emerald-800/70 font-semibold text-xs"
              >
                <FileCheck2 className="size-3.5 mr-1.5" /> Sample Like an Auditor
              </Button>
            </div>
          </div>

          {/* Above-the-Fold 4 CFO/Ops Numbers */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-emerald-200">
                Marketplace Deductions
              </span>
              <p className="mt-1 text-xl font-bold tabular-nums m-0">{fmtINR(totalDeductions)}</p>
              <span className="text-[0.7rem] text-emerald-100/80">Across {deductions.length} active payouts</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-emerald-200">
                GST at Risk (Rule 67B)
              </span>
              <p className="mt-1 text-xl font-bold tabular-nums text-amber-300 m-0">{fmtINR(totalGstAtRisk)}</p>
              <span className="text-[0.7rem] text-emerald-100/80">30 Nov / GSTR-9 statutory cap</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-emerald-200">
                7-Control Pass Rate
              </span>
              <p className="mt-1 text-xl font-bold tabular-nums m-0">{passRate}%</p>
              <span className="text-[0.7rem] text-emerald-100/80">{allTickets.length} exception tickets open</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 border border-white/15">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-emerald-200">
                TAT Breaches
              </span>
              <p className="mt-1 text-xl font-bold tabular-nums text-emerald-300 m-0">0</p>
              <span className="text-[0.7rem] text-emerald-100/80">7–15d marketplace dispute SLA</span>
            </div>
          </div>
        </section>

        {/* Auditor Sample Banner */}
        {auditSample && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <b className="text-emerald-900 text-sm block">✓ Auditor Pack Sampled ({auditSample.length} Payouts)</b>
              <span className="text-emerald-800">
                Bundled: Rate-card / POD, C1–C7 Control Logs, IMS Status, Bank UTRs, and SHA-256 tamper-evident seals for{' '}
                <b>{auditSample.join(', ')}</b>.
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setAuditSample(null)} className="text-xs">
              Dismiss
            </Button>
          </div>
        )}

        {/* Payout Selector + 7-Control Matrix */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Left: Marketplace Payout Queue */}
          <section className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Package className="size-4 text-emerald-600" /> Marketplace Payout Queue
              </h2>
              <span className="text-[0.7rem] font-semibold text-slate-500">Click a payout to inspect</span>
            </div>

            <div className="space-y-2.5">
              {evaluations.map(({ d, res }) => {
                const active = d.id === activeEval.d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[0.68rem] font-bold text-white">
                          {d.platform}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{d.id}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold ${
                          res.allPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {res.allPassed ? '7/7 Passed' : `${res.tickets.length} Controls Failed`}
                      </span>
                    </div>
                    <p className="m-0 mt-1.5 text-xs font-medium text-slate-700">{d.sku}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Deduction: <b className="text-slate-900">{fmtINR(d.deductionAmount)}</b></span>
                      <span>Settlement SLA: <b>{d.daysToSettlementDeadline}d left</b></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right: 7-Control Live Evaluation + Break-the-Control */}
          <section className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 m-0">
                  7-Control Gate: {activeEval.d.platform} · {activeEval.d.id}
                </h2>
                <p className="m-0 text-xs text-slate-500">{activeEval.d.sku}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-[0.72rem]" onClick={() => triggerFailure('reject_ims')}>
                  Simulate IMS Reject
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[0.72rem]" onClick={() => triggerFailure('margin_burn')}>
                  Simulate Margin Burn
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[0.72rem]" onClick={() => triggerFailure('reset')}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {activeEval.res.controls.map(c => (
                <div
                  key={c.id}
                  className={`rounded-xl border p-3 text-xs ${
                    c.passed ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-300 bg-amber-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">
                      {c.id} · {c.name}
                    </span>
                    {c.passed ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-4 text-amber-600" />
                    )}
                  </div>
                  <p className="m-0 mt-1 text-slate-700 leading-relaxed">{c.summary}</p>
                  {!c.passed && c.consequenceRupees ? (
                    <span className="mt-1.5 inline-block font-bold text-amber-900">
                      Exposure: {fmtINR(c.consequenceRupees)} · Owner: {c.owner}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            {/* ServiceNow / JIRA Sample Payload Preview */}
            {activeEval.res.tickets.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">
                    ⚡ {activeEval.res.tickets.length} Exception Ticket(s) Auto-Spawned
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPayload(p => (p === 'servicenow' ? null : 'servicenow'))}
                      className="font-semibold text-emerald-700 underline"
                    >
                      {showPayload === 'servicenow' ? 'Hide' : 'Preview'} ServiceNow Payload
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPayload(p => (p === 'jira' ? null : 'jira'))}
                      className="font-semibold text-emerald-700 underline"
                    >
                      {showPayload === 'jira' ? 'Hide' : 'Preview'} JIRA Payload
                    </button>
                  </div>
                </div>

                {showPayload && (
                  <pre className="rounded-lg bg-slate-950 p-3 text-[0.68rem] text-emerald-300 overflow-x-auto m-0">
                    {JSON.stringify(
                      {
                        _note: 'Sample payload, not sent',
                        target: showPayload === 'servicenow' ? 'POST /api/now/table/incident' : 'POST /rest/api/3/issue',
                        ticket: activeEval.res.tickets[0],
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
