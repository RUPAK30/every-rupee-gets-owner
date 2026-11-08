# First-release acceptance results

- Nine targeted tests passed: eight matching/import/allocation invariants plus home routing.
- Public demo: three exact-reference allocations, missing-reference manual allocation and exception ownership checked in browser.
- Private workspace: temporary account signed in through UI, imported invoice ₹1,000 and receipt ₹900, matched, saved an owner and notes, reloaded and read them back. ₹100 remained outstanding.
- Another temporary account could not read the first account's document through the Data API. Sign-out redirected to auth and blocked private workspace access. Both temporary accounts and their test records were deleted.
- Homepage demo-request submitted through UI and confirmed in demo_requests; only that test row was deleted. Owner notification emails are not enabled because no verified sender domain exists. Owner opens More → Database → demo_requests.
- Four original sample-case tabs, all steps, replay and calculator verified; changed inputs produced ₹1.20 crore cash stuck and ₹14.4 lakh annual cost.
- Desktop and 390px phone layouts checked; phone document width remained 390px. No browser page errors in the public flow. Latest automatic build reported build OK.
- Google/Lovable providers enabled; their full external sign-in round trips and confirmation/recovery email delivery were not tested. Email/password sign-in and private flow were tested using temporary confirmed accounts.
- Original sales/lender/case-study/PDF links point explicitly to the source website, not nonexistent local pages. Those source features are not part of this release.
- Capability-status page separates available CSV tools from unimplemented integrations, proposed accounting controls and unverified certifications.