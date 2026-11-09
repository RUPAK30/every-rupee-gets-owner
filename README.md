# EveryRupee

Order-to-cash reconciliation, explained in plain language. Every rupee billed gets an owner, a reason, or a receipt — never a guess.

**Live:** https://every-rupee-gets-owner.lovable.app

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
- **Tested here: 15 tests** — matching, no over-allocation, atomic CSV import, BR-4 (write-offs rejected), BR-5 (no resolution above ₹10,000 without a separate checker), and BR-10, the link to Ten Today: a discount claim is checked against the sales approval (covered, split at the cap, expired, or no approval).
- **The full tested desk** (16 business rules, 31 tests, brand and lender modes) runs at https://everyrupee-o2c.vercel.app — this app is its lighter, interactive front end.
- **Lender return codes live in one module** (`lender-codes.ts`) — AI explanations may only reword the desk's rule, and suggestions must be one of the allowed outcomes, logged only after a person confirms.
- **Honesty by design** — bank/ERP integrations and compliance certifications are labelled "planned", never claimed as live.


## How Every Rupee was built

1. **Start from a real, public problem.** Cello World's annual reports showed receivables growing faster than revenue (+14% vs +8.8%, FY25 → FY26). Distributors earn ₹3.5–5 per ₹100, so they deduct schemes and claims at payment. Who owns a short-paid rupee? Usually nobody.
2. **Write the rules before the screens.** A BRD, user stories and business rules, each with a test. Early drafts had errors I caught and fixed: the wrong GST section (corrected to CGST s.34(2)), a TDS/TCS clash that no longer exists after April 2025, and overstated tax risk.
3. **Build the desk, then break it on purpose.** The full desk enforces maker-checker above ₹10,000, no write-off by any rule, a balanced ledger entry on every action, and GST vs financial credit notes by the 30 November deadline. An end-to-end click test found three places a rupee could lose its owner; all three were fixed and tested.
4. **Prove the same discipline works for lenders.** Lender mode gives each NACH return code a reason, an owner and a next step, with RBI's 2023 penal-charge rules and SMA ageing.
5. **Follow the deduction back to where it started.** Ten Today, a sales workflow module, shares one approval record with Every Rupee: a deduction clears up to the approved cap (compared like with like on GST), the excess returns to the rep who promised it, and only the rep's own claims older than 15 days block the next discount.
6. **Make it readable in 90 seconds.** Nobody switches between two apps, so the whole route became one page: https://everyrupee-o2c.vercel.app/route.html
7. **This app: a lighter, interactive front end.** CSV import, matching, exceptions, private workspaces, and a lender desk, with money held as integer paise and BR-4/BR-5 enforced in a shared engine. Its claims are kept identical to the full desk.

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
