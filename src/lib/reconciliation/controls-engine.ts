export type ControlId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7';

export interface ControlResult {
  id: ControlId;
  name: string;
  passed: boolean;
  summary: string;
  consequenceRupees?: number;
  owner?: string;
  slaHours?: number;
}

export interface MarketplaceDeduction {
  id: string;
  platform: 'Blinkit' | 'Zepto' | 'Amazon' | 'Flipkart';
  sku: string;
  grossBilled: number;
  payoutReceived: number;
  deductionAmount: number;
  marginPct: number;
  discountPct: number;
  extraVolumePct: number;
  approvedBy: string | null;
  requestedBy: string;
  isMarketingService: boolean;
  taxRoute: 'GST_CN' | 'FINANCIAL_CN' | 'UNSET';
  imsStatus: 'ACCEPTED' | 'PENDING_PAST_PERIOD' | 'REJECTED' | 'OPEN';
  daysToSettlementDeadline: number;
  utrMatched: boolean;
  auditPackComplete: boolean;
}

export interface ExceptionTicket {
  ticketId: string;
  deductionId: string;
  platform: string;
  controlId: ControlId;
  title: string;
  owner: string;
  slaHours: number;
  tatBreached: boolean;
  rupeesAtRisk: number;
  status: 'OPEN' | 'RESOLVED';
}

/**
 * Evaluates all 7 controls (C1-C7) for a Quick-Commerce / E-Commerce marketplace deduction.
 */
export function evaluateControls(d: MarketplaceDeduction): {
  controls: ControlResult[];
  tickets: ExceptionTicket[];
  allPassed: boolean;
  gstAtRisk: number;
} {
  const gstRate = 0.18;
  const gstAmount = Math.round(d.deductionAmount * gstRate);

  // C1: Economics — Break-even volume check
  const breakEvenVolumePct = Number(((d.discountPct / Math.max(1, d.marginPct - d.discountPct)) * 100).toFixed(1));
  const c1Pass = d.extraVolumePct >= breakEvenVolumePct;

  // C2: Authority — Maker-checker (cannot self-approve)
  const c2Pass = Boolean(d.approvedBy && d.approvedBy !== d.requestedBy);

  // C3: Classification — Price cut vs. Marketing/Co-op Ad Service (never auto-decided)
  const c3Pass = !d.isMarketingService;

  // C4: Tax Route — GST Credit Note vs. Financial Note fallback if settlement/statutory window missed
  const c4Pass = d.taxRoute !== 'UNSET';

  // C5: Recovery — IMS / Marketplace dispute acceptance (Pending past period = Deemed Accepted; Rejected = Rule 67B tax snap-back)
  const c5Pass = d.imsStatus === 'ACCEPTED' || d.imsStatus === 'PENDING_PAST_PERIOD';
  const gstAtRisk = d.imsStatus === 'REJECTED' ? gstAmount : d.imsStatus === 'OPEN' ? gstAmount : 0;

  // C6: Cash — Net payout UTR matched
  const c6Pass = d.utrMatched;

  // C7: Evidence — Complete audit pack
  const c7Pass = d.auditPackComplete;

  const controls: ControlResult[] = [
    {
      id: 'C1',
      name: 'Economics',
      passed: c1Pass,
      summary: c1Pass
        ? `Break-even met (+${d.extraVolumePct}% vol ≥ +${breakEvenVolumePct}% needed at ${d.marginPct}% margin)`
        : `Margin erosion: ${d.discountPct}% cut needs +${breakEvenVolumePct}% vol, got +${d.extraVolumePct}%`,
      consequenceRupees: c1Pass ? 0 : Math.round(d.deductionAmount * 0.35),
      owner: 'Growth / Category Lead',
      slaHours: 24,
    },
    {
      id: 'C2',
      name: 'Authority',
      passed: c2Pass,
      summary: c2Pass ? `Approved by ${d.approvedBy} (maker-checker held)` : 'Blocked: missing manager sign-off or self-approved',
      consequenceRupees: c2Pass ? 0 : d.deductionAmount,
      owner: 'Vikram (Finance Controller)',
      slaHours: 24,
    },
    {
      id: 'C3',
      name: 'Classification',
      passed: c3Pass,
      summary: c3Pass ? 'Confirmed pure trade discount' : 'Flagged for Tax Review: Co-op Ad/Visibility fee (separate GST service)',
      consequenceRupees: c3Pass ? 0 : gstAmount,
      owner: 'Tax Review Desk',
      slaHours: 48,
    },
    {
      id: 'C4',
      name: 'Tax Route',
      passed: c4Pass,
      summary:
        d.taxRoute === 'GST_CN'
          ? 'GST Credit Note (with ITC reversal)'
          : d.taxRoute === 'FINANCIAL_CN'
            ? 'Financial Credit Note (Circular 251 · GST unchanged)'
            : 'Tax route unset — blocked',
      consequenceRupees: c4Pass ? 0 : gstAmount,
      owner: 'Asha (AR Ops)',
      slaHours: 24,
    },
    {
      id: 'C5',
      name: 'Recovery & IMS',
      passed: c5Pass,
      summary:
        d.imsStatus === 'ACCEPTED'
          ? 'Accepted in IMS / Marketplace portal'
          : d.imsStatus === 'PENDING_PAST_PERIOD'
            ? 'Deemed Accepted (pending past 1 tax period)'
            : d.imsStatus === 'REJECTED'
              ? `Rejected in IMS: ₹${gstAmount.toLocaleString('en-IN')} GST snaps back (Rule 67B)`
              : `Open dispute (${d.daysToSettlementDeadline}d left in settlement window)`,
      consequenceRupees: gstAtRisk,
      owner: 'Asha (AR Ops)',
      slaHours: 48,
    },
    {
      id: 'C6',
      name: 'Cash Match',
      passed: c6Pass,
      summary: c6Pass ? 'Bank UTR matched to net payout' : 'Short-payout unrecovered — 15-day cure window active',
      consequenceRupees: c6Pass ? 0 : d.deductionAmount,
      owner: 'Rohan (Marketplace Collections)',
      slaHours: 72,
    },
    {
      id: 'C7',
      name: 'Evidence',
      passed: c7Pass,
      summary: c7Pass ? 'Audit pack complete · SHA-256 chain intact' : 'Missing POD / Rate-card proof in audit pack',
      consequenceRupees: 0,
      owner: 'Asha (AR Ops)',
      slaHours: 24,
    },
  ];

  const tickets: ExceptionTicket[] = controls
    .filter(c => !c.passed)
    .map((c, idx) => ({
      ticketId: `INC-${d.platform.slice(0, 3).toUpperCase()}-${d.id.replace(/\D/g, '')}-${c.id}`,
      deductionId: d.id,
      platform: d.platform,
      controlId: c.id,
      title: `${c.id} ${c.name} Failed · ${d.platform} (${d.sku})`,
      owner: c.owner ?? 'Asha (AR Ops)',
      slaHours: c.slaHours ?? 24,
      tatBreached: false,
      rupeesAtRisk: c.consequenceRupees ?? 0,
      status: 'OPEN',
    }));

  return {
    controls,
    tickets,
    allPassed: controls.every(c => c.passed),
    gstAtRisk,
  };
}

export const SAMPLE_MARKETPLACE_DEDUCTIONS: MarketplaceDeduction[] = [
  {
    id: 'BLK-901',
    platform: 'Blinkit',
    sku: 'HydraGlow Serum 50ml',
    grossBilled: 400000,
    payoutReceived: 364000,
    deductionAmount: 36000,
    marginPct: 52,
    discountPct: 6,
    extraVolumePct: 14.5,
    approvedBy: 'Kavita (Growth Head)',
    requestedBy: 'Rahul (KAM)',
    isMarketingService: false,
    taxRoute: 'GST_CN',
    imsStatus: 'ACCEPTED',
    daysToSettlementDeadline: 9,
    utrMatched: true,
    auditPackComplete: true,
  },
  {
    id: 'ZEP-402',
    platform: 'Zepto',
    sku: 'Protein Crunch Box (12x)',
    grossBilled: 500000,
    payoutReceived: 400000,
    deductionAmount: 100000,
    marginPct: 44,
    discountPct: 12,
    extraVolumePct: 10,
    approvedBy: null,
    requestedBy: 'Rahul (KAM)',
    isMarketingService: true,
    taxRoute: 'GST_CN',
    imsStatus: 'REJECTED',
    daysToSettlementDeadline: 3,
    utrMatched: false,
    auditPackComplete: false,
  },
  {
    id: 'AMZ-718',
    platform: 'Amazon',
    sku: 'Daily Electrolytes 30s',
    grossBilled: 250000,
    payoutReceived: 232000,
    deductionAmount: 18000,
    marginPct: 48,
    discountPct: 5,
    extraVolumePct: 12,
    approvedBy: 'Vikram (Finance)',
    requestedBy: 'Rahul (KAM)',
    isMarketingService: false,
    taxRoute: 'FINANCIAL_CN',
    imsStatus: 'PENDING_PAST_PERIOD',
    daysToSettlementDeadline: 6,
    utrMatched: true,
    auditPackComplete: true,
  },
];
