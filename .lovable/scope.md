# EveryRupee — agreed first release

## Outcome
Finance teams can match receipts to invoices, explain short payments, and track unresolved deductions to an ending.

## Public website
- Preserve the imported EveryRupee identity, sample cases and working cash-cost calculator.
- Add a clear path into an interactive reconciliation demo and a private workspace.
- Provide a working demo-request form with stored submissions.
- Publish an explicit capability-status page: working CSV reconciliation versus planned ERP/bank connections and unverified certifications.

## Reconciliation workspace
- Public illustrative dataset, separate from each signed-in account's private saved records.
- Invoice and receipt CSV import with validation, downloadable templates and error feedback.
- Deterministic exact invoice-reference matching; ambiguous receipts stay unmatched.
- Manual receipt allocation, including partial payments; never allocate beyond the receipt or invoice balance.
- Outstanding exceptions with reason, owner, notes and open/resolved state; resolution does not invent received cash.
- Computed receipt, allocated, unallocated and outstanding totals; search/filter; export records.
- Accounts only, no profile data. Sign-in, signup, password recovery and sign-out.

## Acceptance checks
1. Existing sample-case controls and calculator remain usable.
2. Public demo opens with clearly labelled sample records; changes do not affect private accounts.
3. Valid CSV imports; malformed amounts, missing references and duplicate identifiers are rejected without partial import.
4. Exact reference matching allocates available amounts, leaves ambiguous/missing references untouched, and cannot over-allocate.
5. Manual allocation updates balances; partial payments remain outstanding.
6. Exception reason/owner/notes survive private-workspace reload; resolving a case does not change payment totals.
7. Private records read back after save and remain inaccessible to another account.
8. Demo requests reach stored submissions; email notifications are claimed only after a verified successful send.
9. Desktop and phone pages remain usable, including tables, forms and navigation.
10. No live ERP/bank connections, automatic collection emails, certification badges, invented prices, or implied production readiness.

## Usage discipline
One bounded release; reuse current assets and controls, one concise investigation, targeted tests, no AI matching calls or image generation. Usage cannot be guaranteed against an unseen account limit. Further production work is a separate scope, not a prerequisite to this release.

## Outside this release
Live integrations, multi-company/team permissions, approval workflows, accounting write-back, legal/security certification, lender tools and imported linked PDFs. CSV matching is a review aid, not accounting advice or tax validation.