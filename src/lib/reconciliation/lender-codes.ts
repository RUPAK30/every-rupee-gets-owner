// Desk rules for bank return codes. Shared by the lender desk UI and the AI explainer.
export const RETURN_CODES: Record<string, { cause: string; owner: string; next: string; outcomes: string[] }> = {
  '04': { cause: 'Not enough balance in the account', owner: 'Collections', next: 'Call the borrower, then re-present', outcomes: ['Borrower called · re-presented', 'Promise to pay logged'] },
  '61': { cause: 'Auto-debit mandate was cancelled', owner: 'Operations', next: 'Ask for a fresh mandate', outcomes: ['Fresh mandate requested'] },
  '06': { cause: 'Payment stopped by the borrower', owner: 'Relationship manager', next: 'Talk first; it may be a dispute. Do not re-present yet', outcomes: ['Spoke to borrower · dispute logged', 'Spoke to borrower · agreed to pay'] },
};
