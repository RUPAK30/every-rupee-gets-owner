import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { money, personLabel, type Workspace as Data } from '@/lib/reconciliation/engine';
import { AlertCircle, CheckCircle2, Clock, FileUp, ShieldAlert, Sparkles, X } from 'lucide-react';

export interface ServiceNowTicket {
  sys_id: string;
  number: string;
  invoiceId: string;
  customer: string;
  shortAmount: number;
  type: 'Normal' | 'Emergency';
  state: 'Open' | 'Under Review' | 'Closed (Resolved)';
  startDate: string;
  endDate: string;
  slaDays: number;
  tatBreached: boolean;
  mandatoryProof: {
    fileName: string;
    uploadedAt: string;
    fileSize: string;
  } | null;
  approvals: {
    role: string;
    person: string;
    status: 'Approved' | 'Pending';
    approvedAt?: string;
  }[];
  pvtSignoff: {
    signedBy: string;
    signedAt: string;
    note: string;
  } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  caseId: string | null;
  w: Data;
  actor: string;
  onTicketUpdated?: (ticket: ServiceNowTicket) => void;
}

export function ServiceNowModal({ open, onClose, caseId, w, actor, onTicketUpdated }: Props) {
  const inv = caseId ? w.invoices.find(i => i.id === caseId) : undefined;
  const exc = caseId ? w.exceptions.find(e => e.invoiceId === caseId) : undefined;
  
  // Calculate outstanding balance
  const allocated = caseId ? w.allocations.filter(a => a.invoiceId === caseId).reduce((s, a) => s + a.amount, 0) : 0;
  const shortPaise = inv ? Math.max(0, inv.amount - allocated) : 0;
  const isEmergencyDefault = caseId === 'INV-102' || shortPaise > 1000000;

  const [ticketType, setTicketType] = useState<'Normal' | 'Emergency'>(isEmergencyDefault ? 'Emergency' : 'Normal');
  const [proofFile, setProofFile] = useState<{ fileName: string; uploadedAt: string; fileSize: string } | null>(
    caseId === 'INV-101' ? { fileName: 'Signed_POD_Aarav_031.pdf', uploadedAt: '10 Nov 2026, 09:30 AM', fileSize: '245 KB' } : null
  );
  const [financeApproved, setFinanceApproved] = useState(caseId === 'INV-101');
  const [pvtSigned, setPvtSigned] = useState(caseId === 'INV-101');
  const [pvtNote, setPvtNote] = useState(caseId === 'INV-101' ? 'Ledger verified: discrepancy accounted in GST & discount reserve.' : '');
  const [showPayload, setShowPayload] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!open || !caseId || !inv) return null;

  const slaDays = ticketType === 'Emergency' ? 2 : 7;
  const ticketNumber = `CHG-${ticketType === 'Emergency' ? 'EMG' : 'NRM'}-${caseId.replace('INV-', '')}`;
  const sysId = `sn_${caseId.toLowerCase()}_9412`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setProofFile({
        fileName: file.name,
        uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        fileSize: `${Math.round(file.size / 1024)} KB`
      });
      setUploading(false);
    }, 400);
  };

  const isClosed = Boolean(proofFile && financeApproved && pvtSigned);

  const payload = {
    sys_id: sysId,
    number: ticketNumber,
    short_description: `Dispute Short-payment: ${caseId} (${inv.customer})`,
    category: "Financial Deduction",
    type: ticketType.toLowerCase(),
    priority: ticketType === 'Emergency' ? "1 - Critical" : "3 - Moderate",
    state: isClosed ? "Closed Complete" : (proofFile ? "Work in Progress" : "New"),
    start_date: "2026-11-10 09:00:00",
    end_date: ticketType === 'Emergency' ? "2026-11-12 18:00:00" : "2026-11-17 18:00:00",
    tat_breached: false,
    sys_attachment: proofFile ? {
      file_name: proofFile.fileName,
      size_bytes: proofFile.fileSize,
      state: "verified"
    } : null,
    u_department_approval: {
      head: "Vikram (Head of Finance)",
      approved: financeApproved
    },
    u_pvt_signoff: pvtSigned ? {
      signed_by: actor,
      resolution_confirmed: true,
      notes: pvtNote
    } : null
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border border-border bg-card">
        {/* Header Banner */}
        <div className="bg-[#0f172a] text-white p-5 rounded-t-2xl border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#0284c7] font-bold text-white text-sm">
                sn
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white m-0 tracking-tight">ServiceNow ITIL Change Management</h2>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-400 border border-emerald-500/30">
                    LIVE REST API SYNC
                  </span>
                </div>
                <p className="text-xs text-slate-400 m-0 mt-0.5">
                  Automated Ticket for <b>{caseId}</b> · {inv.customer} · <span className="text-sky-300 font-semibold">{money(shortPaise)}</span> gap
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${ticketType === 'Emergency' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                {ticketNumber} ({ticketType})
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Change Classification Selector */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-foreground block text-sm">Change Classification &amp; Priority</span>
              <span className="text-muted-foreground text-xs">
                Emergency tickets require accelerated 2-day TAT; Normal changes follow 7-day standard SLA.
              </span>
            </div>
            <div className="inline-flex rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setTicketType('Normal')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${ticketType === 'Normal' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Normal (7-day TAT)
              </button>
              <button
                type="button"
                onClick={() => setTicketType('Emergency')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${ticketType === 'Emergency' ? 'bg-destructive text-destructive-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
              >
                ⚡ Emergency (2-day TAT)
              </button>
            </div>
          </div>

          {/* SLA & TAT Countdown Gate */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-3 bg-background">
              <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                <span>START DATE</span>
                <Clock className="size-3.5 text-sky-600" />
              </div>
              <p className="m-0 mt-1 font-bold text-foreground text-xs">10 Nov 2026 (Today)</p>
              <p className="m-0 text-[0.68rem] text-emerald-600 font-semibold mt-0.5">Dispatched automatically</p>
            </div>

            <div className="rounded-xl border border-border p-3 bg-background">
              <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                <span>TARGET RESOLUTION</span>
                <span className="font-mono text-primary font-bold">{slaDays} Days</span>
              </div>
              <p className="m-0 mt-1 font-bold text-foreground text-xs">
                {ticketType === 'Emergency' ? '12 Nov 2026' : '17 Nov 2026'}
              </p>
              <p className="m-0 text-[0.68rem] text-muted-foreground mt-0.5">SLA TAT Active</p>
            </div>

            <div className={`rounded-xl border p-3 ${isClosed ? 'border-emerald-500/40 bg-emerald-50/50' : 'border-amber-500/40 bg-amber-50/40'}`}>
              <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                <span>GATE STATUS</span>
                {isClosed ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <AlertCircle className="size-3.5 text-amber-600" />}
              </div>
              <p className="m-0 mt-1 font-bold text-foreground text-xs">
                {isClosed ? 'Closed (Resolved)' : 'Pending Gate Sign-off'}
              </p>
              <p className={`m-0 text-[0.68rem] mt-0.5 font-semibold ${isClosed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isClosed ? '✓ Ready to settle' : 'Closure blocked until 3 gates met'}
              </p>
            </div>
          </div>

          {/* The 3 Strict ITIL Governance Gates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">
              Mandatory ITIL Closure Gates (Zero Hollow Form)
            </h4>

            {/* Gate 1: Mandatory Attachment / Document Proof */}
            <div className="rounded-xl border border-border p-3.5 bg-background">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Gate 1 · Mandatory Proof of Delivery / Signed GRN
                  </span>
                  <span className="text-[0.72rem] text-muted-foreground">
                    Required document proof via ServiceNow <code>sys_attachment</code> table before dispute can be recognized.
                  </span>
                </div>
                {proofFile ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="size-3.5" /> Attached: {proofFile.fileName}
                  </span>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs">
                    <FileUp className="size-3.5" />
                    <span>{uploading ? 'Attaching...' : 'Attach Proof (PDF/JPG)'}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>

              {proofFile && (
                <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-primary font-bold">📄 {proofFile.fileName}</span>
                    <span className="text-muted-foreground text-[0.7rem]">({proofFile.fileSize} · uploaded {proofFile.uploadedAt})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProofFile(null)}
                    className="text-xs text-destructive hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Gate 2: Department / Finance Head Approval */}
            <div className="rounded-xl border border-border p-3.5 bg-background">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Gate 2 · Department Head Approval (Vikram)
                  </span>
                  <span className="text-[0.72rem] text-muted-foreground">
                    Head of Finance sign-off required for commercial deductions &gt;₹10,000 or trade-discount writebacks.
                  </span>
                </div>
                {financeApproved ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="size-3.5" /> Approved by Vikram
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold border-primary/40 text-primary"
                    onClick={() => setFinanceApproved(true)}
                  >
                    Approve as Head of Finance
                  </Button>
                )}
              </div>
            </div>

            {/* Gate 3: PVT (Post-Validation Testing) Sign-off */}
            <div className="rounded-xl border border-border p-3.5 bg-background">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Gate 3 · PVT Sign-off (Issue Resolved Verification)
                  </span>
                  <span className="text-[0.72rem] text-muted-foreground">
                    Post-Validation Testing confirms accounting adjustment &amp; GST ledger balance before ticket closes.
                  </span>
                </div>
                {pvtSigned ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="size-3.5" /> PVT Signed by {actor}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                      disabled={!proofFile}
                      onClick={() => {
                        setPvtSigned(true);
                        if (!pvtNote) setPvtNote(`Verified by ${actor}: deduction cross-referenced with bank UTR and tax credit.`);
                      }}
                    >
                      Sign off PVT
                    </Button>
                  </div>
                )}
              </div>

              {!pvtSigned && !proofFile && (
                <p className="m-0 mt-2 text-[0.7rem] text-amber-700">
                  ⚠️ Gate locked: You must attach proof (Gate 1) before PVT sign-off can be completed.
                </p>
              )}

              {pvtSigned && (
                <div className="mt-2.5 rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">PVT Verification Note: </span>
                  {pvtNote || `PVT verified by ${actor}. Ledger balanced.`}
                </div>
              )}
            </div>
          </div>

          {/* Collapsible ServiceNow REST Payload Inspector */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPayload(p => !p)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>{showPayload ? '▼ Hide' : '▶ Inspect'} ServiceNow Table API Request (change_request &amp; sys_attachment)</span>
            </button>

            {showPayload && (
              <pre className="mt-2 rounded-xl bg-slate-950 p-3 text-[0.68rem] text-sky-400 font-mono overflow-x-auto border border-slate-800">
                {JSON.stringify(payload, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isClosed ? (
              <span className="font-semibold text-emerald-700">✓ All 3 gates passed. Ticket is closed and resolved.</span>
            ) : (
              <span>Fulfill all 3 gates to achieve ServiceNow closed-resolved signoff.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close Window
            </Button>
            <Button
              size="sm"
              disabled={!isClosed}
              onClick={() => {
                if (onTicketUpdated) {
                  onTicketUpdated({
                    sys_id: sysId,
                    number: ticketNumber,
                    invoiceId: caseId,
                    customer: inv.customer,
                    shortAmount: shortPaise,
                    type: ticketType,
                    state: isClosed ? 'Closed (Resolved)' : 'Under Review',
                    startDate: '2026-11-10',
                    endDate: ticketType === 'Emergency' ? '2026-11-12' : '2026-11-17',
                    slaDays,
                    tatBreached: false,
                    mandatoryProof: proofFile,
                    approvals: [{ role: 'Head of Finance', person: 'Vikram', status: financeApproved ? 'Approved' : 'Pending' }],
                    pvtSignoff: pvtSigned ? { signedBy: actor, signedAt: new Date().toISOString(), note: pvtNote } : null
                  });
                }
                onClose();
              }}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isClosed ? 'Confirm Ticket Resolution ✓' : 'Save Progress'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
