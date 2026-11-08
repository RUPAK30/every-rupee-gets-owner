# EveryRupee

Order-to-cash reconciliation, explained in plain language. Every rupee billed gets an owner, a reason, or a receipt — never a guess.

**Live:** https://every-rupee-finance-guide.lovable.app

A portfolio case study by Rupak Ghanpathi, built with sample data.

---

## What it does

Finance teams lose money in the gap between what was billed and what the bank received. EveryRupee closes that gap:

1. **Match payments to bills** — receipts are paired to invoices deterministically. Unclear payments are held in suspense, never guessed.
2. **Explain the gaps** — every short payment gets a reason (scheme claim, damage claim, TDS) and a named owner.
3. **Record the decision** — outcomes are logged only after a person confirms. Maker-checker applies above ₹10,000; write-offs are rejected by rule.

## The two desks

| Desk | Route | What it shows |
|---|---|---|
| **Receivables** | `/demo` | Four sample bills (billed ₹1,91,300, received ₹1,73,710, gap ₹17,590). Match, explain, resolve — with a 60-second guided tour. |
| **Lender** | `/lender-demo` | Bounced EMIs with bank return codes (04, 61, 06). Each code is explained in plain words; suggested actions require human confirmation. |

## Engineering rules

- **Money is integer paise** — no floating-point rounding, ever.
- **One shared engine** (`src/lib/reconciliation/engine.ts`) — the same validation runs in the browser and on the server. Over-allocation is impossible.
- **16 business rules, 31 tests** — including BR-5: no single account can approve a high-value exception without a separate checker.
- **Lender return codes live in one module** (`lender-codes.ts`) — AI explanations may only reword the desk's rule, and suggestions must be one of the allowed outcomes, logged only after a person confirms.
- **Honesty by design** — bank/ERP integrations and compliance certifications are labelled "planned", never claimed as live.

## Stack

- **TanStack Start** (React 19, SSR) + **TypeScript**
- **Tailwind CSS v4** + shadcn components
- **Lovable Cloud** (auth + Postgres, row-level security) for private workspaces and demo requests
- **Lovable AI Gateway** for plain-language return-code explanations
- **Zod** schemas shared across client and server

## Run locally

```sh
npm i
npm run dev
```

Tests:

```sh
npx vitest run src/lib/reconciliation/engine.test.ts
```

## Project layout

```
src/routes/            pages: /, /demo, /lender-demo, /capabilities, /auth, /workspace
src/lib/reconciliation/  engine (matching, allocation, CSV), lender codes, server functions, tests
src/components/reconciliation/  workspace, lender desk, guided tour, demo request form
```

---

*Portfolio case study · sample data · not affiliated with any company named in the samples.*
