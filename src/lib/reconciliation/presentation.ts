import { approvalCheck, computeDeskImpact, invoiceBalance, type SalesApproval, type Workspace } from './engine';

/** Operational estimates use current allocations, never a speculative auto-match. */
export function computePresentationNumbers(w: Workspace, approvals?: SalesApproval[]) {
  const impact = computeDeskImpact(w, approvals);
  const cashIdentifiedPaise = w.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  let unapprovedPaise = 0, overCapPaise = 0, expiredPaise = 0, salesOwnedPaise = 0;
  for (const invoice of w.invoices) {
    const check = approvalCheck(w, invoice.id, approvals);
    if (check.status === 'none') unapprovedPaise += check.short;
    if (check.status === 'excess') overCapPaise += check.excess;
    if (check.status === 'expired') expiredPaise += check.short;
    const exception = w.exceptions.find(e => e.invoiceId === invoice.id);
    if (exception?.owner === 'Rahul' || exception?.owner === 'Kavita') {
      salesOwnedPaise += check.status === 'excess' ? check.excess : invoiceBalance(w, invoice.id);
    }
  }
  return { ...impact, cashIdentifiedPaise, unapprovedPaise, overCapPaise, expiredPaise,
    leakageStoppedPaise: unapprovedPaise + overCapPaise + expiredPaise, salesOwnedPaise,
    silentWriteOffsPaise: 0, hoursSaved: impact.manualMinutesSaved / 60 };
}