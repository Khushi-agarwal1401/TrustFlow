# Product Requirements Document (PRD)
## TrustFlow AI — AI-Powered Accountability Platform for Freelance Projects

---

## 1. Problem Statement

Businesses that hire freelancers through informal channels (LinkedIn, WhatsApp, referrals, GitHub, Telegram) get none of the protections a marketplace provides — no enforced contract, no escrow, no way to verify progress, no structured way to resolve a dispute or replace a freelancer who disappears mid-project.

Existing marketplaces (Upwork, Fiverr) solve this only for hiring done *on their platform*. They do not — and cannot — protect a relationship that started off-platform. Adjacent tools (Deel, Bonsai, Contra, HoneyBook) solve fragments (contracts, invoicing) but none combine AI-generated scope-matched contracts with evidence-based milestone verification for off-platform hiring.

**Real, buildable wedge:** a lightweight layer that a client can bring an existing freelancer relationship into, in under 5 minutes, that adds a binding milestone contract, escrow, and evidence-based progress verification — without asking either side to migrate to a full marketplace.

## 2. Target Users

### Primary: Client (payer)
Small agencies, SMEs, and startup founders who hire freelance developers, designers, writers, or marketers **repeatedly** (not one-off consumer gigs). They already have a person in mind — they don't need discovery, they need protection.

### Secondary: Freelancer (free user)
Independent contractors who want a lightweight way to look credible, get paid on clear milestones, and build a portable track record — without joining a marketplace or giving up direct client relationships.

### Tertiary: Admin / Ops
Internal team handling disputes that escalate past AI-assisted resolution, fraud monitoring, and platform health.

## 3. Non-Goals (explicitly out of scope)

- **Not a marketplace.** No freelancer discovery, browsing, or matching. Users bring their own relationship.
- **Not a full HRIS/payroll system** (that's Deel's territory — international compliance, tax forms, contractor payroll runs are out of scope for v1–v3).
- **No "AI ghosting prediction" as a trained model at launch.** See Section 5, Risk Signals — this is rule-based until there's enough usage data to train a real model. Do not build or market a predictive ML model before that data exists.

## 4. Success Metrics

| Metric | Target (6 months post-launch) |
|---|---|
| Projects created | 500 |
| % of projects reaching final milestone without dispute | >70% |
| Average time from work submission to client approval | <48 hours |
| Freelancer opt-in rate (freelancer completes profile after client invite) | >60% |
| Escrow fee revenue per active client / month | Tracked, no target yet (pricing validation phase) |
| Disputes resolved without admin escalation | >50% |

## 5. Feature Set (Full — organized by phase, not "MVP vs later" as an afterthought)

Every feature below is intended to ship eventually. Phase numbers indicate build order, not importance.

### Phase 1 — Core Loop (must work end-to-end before anything else)
1. **Auth & Roles** — Email + Google OAuth. Roles: Client, Freelancer, Admin. A single user can hold both Client and Freelancer roles on different projects.
2. **Project Creation** — Client defines project name, description, total budget, and freelancer's email/phone (invite).
3. **AI Contract Generator** — Client provides project scope in plain language; AI drafts a structured contract with milestones, deliverables, and payment split. Client edits before sending. Freelancer must explicitly accept before funds move.
4. **Milestone Escrow** — Client funds each milestone (or the full project) via Stripe/Razorpay. Funds are held, not released, until milestone approval.
5. **Work Submission with Evidence** — Freelancer submits a milestone with: description, file uploads, links (GitHub commit, Figma file, Google Drive folder, deployed URL).
6. **AI Scope Validation** — On submission, AI compares the submitted evidence against the milestone's defined deliverable and produces a plain-language match summary + confidence flag (not an auto-approval — a decision aid for the client).
7. **Client Approval / Rejection** — Client approves (releases escrow for that milestone) or rejects with required written reason (triggers revision cycle, capped at 2 revisions before dispute path opens).
8. **Payment Release** — On approval, funds move from escrow to freelancer's connected payout account (Stripe Connect / Razorpay Route).
9. **Notifications** — Email (transactional) for every state change: invite sent, contract accepted, milestone submitted, approved, rejected, payment released, dispute opened. In-app notification center.

### Phase 2 — Trust Infrastructure
10. **Risk Signals (rule-based, NOT ML)** — Flags computed from observable data only: days since last activity vs. milestone deadline, submission-to-response latency trend, revision count trend, prior dispute history on this account. Displayed as a simple traffic-light indicator (green/amber/red) with the specific triggering factor named — never a black-box score.
11. **Dispute Resolution Flow** — Structured form: both parties submit evidence and a statement. AI produces a **non-binding suggested resolution** citing the specific contract clause and evidence it used. Either party can accept the suggestion (resolves immediately) or escalate to Admin arbitration.
12. **Reputation / Track Record** — Per-user profile showing: projects completed, on-time delivery rate, dispute rate, average client rating (1–5, left after project close). This is descriptive history, not a predictive score.
13. **Integrations** — GitHub (pull commit activity as automatic evidence for dev projects), Google Drive (link folders as evidence), Figma (link files as evidence).
14. **Client Analytics Dashboard** — Active projects, total escrowed funds, spend by freelancer, average project health across portfolio.

### Phase 3 — Scale Features (require usage data or volume to be viable)
15. **ML-Based Ghosting Risk Model** — Once sufficient historical project data exists (target: 1,000+ completed projects), train a real model on the features tracked as Risk Signals in Phase 2, replacing the rule-based flag with a calibrated probability. Ship only when the model outperforms the rule-based baseline on held-out data — not on a launch deadline.
16. **Freelancer Replacement Flow** — If a project is abandoned, client can re-open the same escrowed milestone for a new freelancer with the existing contract and evidence trail intact.
17. **Enterprise Plan** — Multi-seat client accounts, team roles (project owner, approver, finance), consolidated billing, SSO.
18. **Legal Automation** — Jurisdiction-aware contract clause library, e-signature with legal audit trail, exportable dispute records for external legal use.
19. **Public API** — For agencies who want to trigger project creation / pull status from their own internal tools.

## 6. User Stories (representative, not exhaustive — the App Flow doc has full journeys)

- As a **Client**, I want to turn a WhatsApp conversation with a freelancer into a funded, milestone-based contract in under 10 minutes, so I don't have to migrate the relationship to a marketplace.
- As a **Client**, I want to see *why* a project is flagged risky (not just a score), so I can decide whether to intervene.
- As a **Freelancer**, I want my submission accompanied by an AI-generated summary of what I delivered, so the client has less room to dispute in bad faith.
- As a **Freelancer**, I want a portable record of completed projects, so I can use it to win future clients outside this platform too.
- As an **Admin**, I want every AI-assisted dispute suggestion to cite its evidence, so arbitration is auditable, not a black box.

## 7. Pricing Model (assumption — validate before building billing logic deeply)

- **Free**: 1 active project, freelancer side always free.
- **Starter** (~$15/mo): up to 5 active projects, 1.5% escrow fee.
- **Agency** (~$49/mo): unlimited projects, multiple team seats, 1% escrow fee, analytics dashboard.
- **Enterprise**: custom, SSO, API access, dedicated dispute SLA.

## 8. Key Risks to the Product (call these out to the team, don't hide them)

- **Two-sided adoption risk**: if freelancers don't accept invites, the whole loop breaks. Freelancer onboarding friction must be near-zero (no forced signup wall before seeing the contract).
- **Escrow = regulated money movement.** Stripe Connect / Razorpay Route handle most of the compliance burden, but legal review is required before charging real transaction fees, especially cross-border.
- **AI scope validation false confidence.** If the AI says "matches deliverable" and it doesn't, trust collapses fast. Always show it as an aid, never an auto-approval, and log every AI judgment for audit.