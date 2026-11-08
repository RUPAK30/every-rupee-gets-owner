# 90-second "Let's talk" redesign

Goal: a busy hiring manager, TA, PM, finance-ops lead or CFO understands what EveryRupee is, who it helps and that it really works in under 90 seconds. The obvious next step should be "Let's talk".

## What is getting in the way today
- The first screen opens on a story ("A distributor pays short...") before it says what the product is. A skimmer has to work it out.
- There is no "Let's talk" or contact button that stays on screen. The demo form sits far down the page.
- There are many sections ("Open what you care about", deadlines, cost, controls), all given equal weight. With no clear order, the page reads like a document, not a product.
- Proof is hidden. The working workspace is behind a link and is never shown on the first screen.
- Nothing speaks to each visitor type. A recruiter, a PM and a CFO look for different things.

## Proposed changes (homepage only, current look kept)
1. **New first screen (seen in about 10 seconds)**
   - A one-line headline that says what it is: "Reconcile every short payment, from invoice to cash."
   - A sub-line naming who it is for and the result: Indian B2B finance teams find, explain and recover deductions.
   - Two buttons: **Let's talk** (main) and **Try the live demo** (second, no sign-up).
   - A real screenshot of the working workspace next to the text.
2. **"How it works" in 3 steps (about 20 seconds):** Import invoices and receipts, auto-match, resolve the gaps. One icon and one line per step.
3. **Live proof strip (about 15 seconds):** the existing ₹12,400 sample shown as before/after numbers, linking to /demo.
4. **"Built for" cards (about 15 seconds):** four short cards for Finance ops, CFO, Product manager and Hiring manager/TA. Each says what that person should take away. The hiring card covers what was built and the product decisions behind it, in honest terms.
5. **Honest status line:** "Working today" vs "Planned", linking to /capabilities. This builds trust instead of over-claiming.
6. **Existing detail sections:** kept as they are, but moved below and folded into "Go deeper" so they stop competing for attention.
7. **Let's talk, everywhere:**
   - A "Let's talk" button that stays in the header.
   - A floating button on phones.
   - A short closing section with the demo form: name, email, a "Which describes you?" choice and an optional message.
8. **UX standards pass:**
   - Clear heading order and one main action per screen.
   - Readable contrast and touch targets of at least 44px.
   - Keyboard focus that is easy to see.
   - Tidy spacing on phones (your current view is phone-sized).

## Out of scope
New pages, new integrations, testimonials or client logos (none are real), and changes to the workspace.

## Questions to confirm before build
- Should the hiring-manager card name you (Rupak) as the builder, with a LinkedIn or portfolio link? If yes, I'll need the link.
- Should "Let's talk" also offer a booking link (for example Calendly), or only the form?

## Technical notes
- Edit `src/routes/index.tsx` and `src/styles/site.css`. Reuse the DemoRequest component and add an optional "role" field to the stored message. No schema change.
- Take the hero screenshot from /demo with Playwright and save it to src/assets.
- Check with one desktop and one 390px Playwright pass, then re-check the case tabs and the calculator.
