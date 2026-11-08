# Tighten footer, contact block and top bar; remove the "case study" feel

## Where the "case study" feel comes from
1. **Top bar** – "The thinking" and "Sources" are words from a research write-up, not a product. The logo sits in the middle with links split on both sides, so nobody knows where to look first.
2. **Footer** – a column called "The work" holds 9 links, and 4 of them say "Original … case study ↗". The Deck, BRD and one-pager PDFs read like coursework.
3. **Bottom line** – "Portfolio case study, not affiliated with Cello World. No brand uses it yet." is the last thing people read.
4. **Contact block** – "Not a fit, here's why", "I built Every Rupee alone from Cello's annual report", and a 5-field form that runs much taller than the bio next to it.
5. **Section wording** further up – headings like "The thinking" and "Sources", plus mentions of the case study inside the body text.

## Changes

### 1. Top bar (product-style, one line)
```text
[logo Every Rupee]   Product  How it works  Lender  Pricing-free demo?  ...   [Sign in]  [Let's talk ▸]
```
- Logo on the left. Four links in the middle: **Product · How it works · Quote to cash · Lender**. "The thinking" and "Sources" move to the footer.
- Right side: a text-style "Sign in" link and one filled **Let's talk** button.
- The bar stays at the top while scrolling, shrinks slightly with a thin border, and turns into a simple menu on phones.

### 2. Contact block (about half the height)
- One compact card: a short headline, "Let's talk this week", and a single line under it saying replies come within 24 hours by email.
- Form fields go two to a row (Name | Work email, Company | Role). The message box starts at 2 lines. The button sits full-width under them.
- The bio shrinks to a small strip above the form: photo, name, and one line, "Ex-HDFC Bank BA · 25+ BRDs · zero SOX findings".
- Remove "Not a fit, here's why" and "built alone from Cello's annual report".

### 3. Footer (compact, product-style)
- Three short columns: **Product** (Open the demo, Full desk ↗, Quote to cash ↗, Lender ↗) · **Resources** (How it works, Sources, Privacy, GitHub) · **Rupak** (Portfolio, Viraam, Ten Today, email).
- The four "Original … case study" links and the three PDFs go into one line, "Documentation ↗", that points to the source site.
- The bottom line becomes one small grey line: "© 2026 Every Rupee · Independent product by Rupak Ghanpathi · Not affiliated with any brand named in samples · Tax rules summarised from public sources, Oct 2026."
- The open-to-roles line stays as it is.

### 4. Wording sweep
- Change the remaining "case study" wording on the page to "product" or "sample data". The meaning stays the same.

## A limit I'll keep
You said to assume we have clients. I won't add client logos, testimonials, usage numbers or "trusted by" claims, because your saved honesty rule forbids invented customers and a recruiter who checks would lose trust. I'll make it feel confident with product wording and design, not with made-up proof. The disclaimer stays, just shorter and smaller.

## Not touched
The hero, chips, quote-to-cash card, calculator, demo, workspace and rule counts.

## Technical
- Edits only `src/routes/index.tsx` (header, contact and footer markup) and `src/components/reconciliation/demo-request.tsx` (grid layout). I'll add a few utility classes in `site.css` if needed.
- Check with Playwright at 1280 and 390 widths.
