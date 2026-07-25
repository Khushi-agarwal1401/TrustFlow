# Implementation Plan
## TrustFlow AI

Sequenced for a small team (1–3 people) using AI coding tools (Cursor/Claude/Bolt/Replit). Each phase ends with something demoable and testable — do not move to the next phase with the previous one half-working.

---

## Phase 0 — Setup (2–3 days)

1. Repo scaffold: Next.js frontend + NestJS backend (or Next.js full-stack with API routes if you want a single deployable — acceptable simplification for solo builders, note the tradeoff: harder to isolate the AI service later).
2. Prisma schema from the Backend Schema Document — generate migrations, seed a local Postgres via Docker Compose.
3. Auth wired up (email + Google) — no business logic yet, just login/logout/session working.
4. Stripe (and/or Razorpay) test-mode keys configured. Do not proceed to Phase 1 without this — escrow is the spine of the product.
5. Design tokens from the UI/UX Design Brief set up in Tailwind config (colors, type scale, radius) — every component built after this point should pull from these tokens, not hardcoded values.

**Exit criteria**: a logged-in user lands on an empty dashboard styled with the correct design tokens.

## Phase 1 — Core Loop (2–3 weeks)

Build in this exact order — each step depends on the last being functionally real, not stubbed:

1. Project creation (Flow A, steps 1–5) — no AI yet, just the form and DB writes.
2. AI Contract Generator — wire the OpenAI call, store both `ai_generated_draft` and editable `final_terms`. Build the fallback manual-template path now, not later — this is a required state, not a stretch goal.
3. Contract Review + Send screen, with the running-total validation from the Design Brief.
4. Freelancer invite + no-login contract view + accept/decline/request-changes.
5. Account creation on accept (the single most important friction point — test this specifically with people outside the team).
6. Escrow funding via Stripe Connect/Razorpay Route test mode — real charge, real hold, in test mode.
7. Milestone submission with file/link evidence upload.
8. AI Scope Validation — async job, confidence flag, shown as advisory only per the Design Brief.
9. Client approval/rejection flow, revision cycle (cap at 2).
10. Payment release on approval — this is the highest-stakes code path in the app; write it with explicit tests before moving on.
11. Notifications (email) for every state transition in this loop.

**Exit criteria**: a full project can go from creation → contract → funding → submission → approval → payout, end to end, in test mode, without manual DB intervention.

## Phase 2 — Trust Infrastructure (2–3 weeks)

1. `ProjectEvent` audit log — retrofit this into every Phase 1 action if it wasn't built alongside it (it should have been — see Phase 1 step 2 note above; if you skipped it, this is technical debt to pay down now, before Phase 2 dispute logic depends on it).
2. Risk Signals (rule-based) — background job computing green/amber/red per project on a schedule + on relevant events (submission, deadline passed).
3. Dispute flow — evidence submission, AI suggested resolution, accept/escalate paths.
4. Admin arbitration queue (internal tool, can be minimal/ugly — this is ops tooling, not customer-facing, don't over-invest in its design).
5. Reputation/track record display on user profiles.
6. Client analytics dashboard (portfolio view).
7. GitHub/Drive/Figma integrations for evidence linking.

**Exit criteria**: a dispute can be opened, get an AI suggestion, and either resolve or escalate to an admin who can see everything needed to arbitrate.

## Phase 3 — Scale Features (ongoing, gated by real usage data)

- Do not start the ML ghosting-risk model until you have real data volume (PRD target: 1,000+ completed projects). Building it earlier means training on synthetic or too-sparse data, which produces a model worse than the rule-based baseline it's meant to replace.
- Freelancer replacement flow.
- Enterprise plan (multi-seat, SSO).
- Legal automation / jurisdiction-aware clauses — involve actual legal review before shipping, not just an AI coding agent's best guess at contract law.
- Public API.

## Testing & Launch Readiness Checklist

Before inviting real users with real money:

- [ ] Every money-movement path has an idempotency key and a passing test for the double-submit/retry case.
- [ ] AI Contract Generator has a working manual fallback (tested with the AI service deliberately disabled).
- [ ] Dispute flow tested with a real end-to-end scenario, not just unit tests on the pieces.
- [ ] Legal review of the contract template and terms of service — an AI coding agent should not be the last check on legal language that governs real money.
- [ ] Load-test the AI scope validation endpoint — this is your most expensive and slowest path; make sure it queues gracefully under concurrent submissions rather than timing out.
- [ ] Confirm Stripe Connect/Razorpay Route account is out of test mode and payout compliance (KYC flows for freelancers) actually works for your target countries.

## Suggested Team Split (if more than one builder)

- **Builder A**: backend + schema + payments/escrow logic (highest-risk code, needs the most care).
- **Builder B**: frontend + design system implementation from the UI/UX brief.
- **Shared**: AI integration (contract generation, scope validation, dispute suggestion) — review each other's prompts, this is where silent quality regressions hide.

## What to Deliberately Cut if Time-Constrained (e.g., hackathon demo)

If this plan needs to compress into a hackathon timeline, cut in this order — cut the bottom of the list first, never cut from the top:
1. GitHub/Drive/Figma integrations (Phase 2) — demo with manual file upload instead.
2. Admin arbitration queue UI — a simple database view is enough for a demo.
3. Risk Signals — can be a hardcoded demo state for the pitch if time-boxed.
4. Real Stripe Connect payout — test-mode escrow hold/release is enough; do not fake the "funds are held" story, that's the core trust claim and needs to actually work even in a demo.
5. Never cut: the core loop (Phase 1), and never cut the honesty of what's real AI vs. what's a rule/template — a judge asking "is this really predicting ghosting" deserves an accurate answer.