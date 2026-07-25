# Technical Requirements Document (TRD)
## TrustFlow AI

---

## 1. Stack Decision (assumption — chosen for AI-coding-agent buildability and solo/small-team velocity)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS | Fast to scaffold with AI tools, SSR for SEO on marketing pages, single codebase for web app |
| Backend | NestJS (Node/TypeScript) | Structured, testable, plays well with Stripe/OpenAI SDKs, same language as frontend |
| Database | PostgreSQL (via Supabase or managed RDS) | Relational integrity matters here — money, contracts, approvals must be transactionally consistent |
| ORM | Prisma | Type-safe queries, migrations an AI agent can generate reliably |
| Auth | Auth.js (NextAuth) or Supabase Auth | Email + Google OAuth out of the box |
| AI Engine | OpenAI API (GPT-4-class model) via a dedicated internal service, not called directly from frontend | Isolates prompt logic, allows model swaps without touching business logic |
| File Storage | AWS S3 (or Supabase Storage for faster setup) | Evidence uploads, contract PDFs |
| Payments / Escrow | Stripe Connect (primary), Razorpay Route (India-specific alt) | Handles KYC, payout compliance, and fund holding — do not build custom escrow ledger logic without a payments provider underneath it |
| Notifications | Resend or SendGrid (email), in-app via websockets (Pusher or native Socket.io) | Transactional reliability matters more than fancy real-time for v1 |
| Hosting | Vercel (frontend), Railway or Render (backend + worker), Supabase or RDS (DB) | Minimal ops overhead for early stage |
| Background Jobs | BullMQ + Redis | Risk signal computation, contract PDF generation, AI validation calls — none of these should block the request/response cycle |

## 2. Architecture Principles

1. **The AI Engine is a decoupled service.** All OpenAI calls go through one internal module (`ai-engine`) with typed request/response contracts. Core transaction logic (escrow, payment release) must never depend on an AI call succeeding — AI outputs are advisory and must degrade gracefully if the AI service is down or slow.
2. **Every state-changing action is an event, not a silent field update.** Contract accepted, milestone submitted, payment released — each writes an immutable `ProjectEvent` row (see Backend Schema doc) before any side effect (notification, escrow release) fires. This is what makes disputes auditable.
3. **Money movement is idempotent.** Every escrow fund/release call must use an idempotency key. Never trigger a payment action from a page render or a retryable frontend call without a stored intent record first.
4. **Risk Signals are pure functions over stored data.** Phase 2's rule-based risk flag must be computed from queryable database fields (timestamps, counts) — no hidden state, no ML model — specifically so it can later be replaced by a real model without changing the interface the frontend consumes.

## 3. Non-Functional Requirements

| Requirement | Target |
|---|---|
| API response time (non-AI endpoints) | p95 < 400ms |
| AI validation response time | p95 < 8s (run async with a "processing" state in UI, not a blocking spinner) |
| Uptime | 99.5% (v1) |
| Data retention | Contract and dispute records retained indefinitely (legal audit requirement) |
| Encryption | TLS in transit; at-rest encryption for DB and S3 (default with managed providers) |
| Audit logging | Every dispute-relevant action logged with actor, timestamp, and before/after state |

## 4. Security Requirements

- All payment operations go through Stripe Connect/Razorpay Route APIs — **no raw card data touches TrustFlow's servers** (PCI scope stays with the payment provider).
- Role-based access control enforced server-side on every endpoint — never trust a frontend role check alone.
- File uploads (evidence) scanned for type/size before storage; signed URLs with short expiry for access, not public S3 buckets.
- Rate limiting on AI endpoints (prevent cost abuse) and auth endpoints (prevent credential stuffing).
- Environment secrets (API keys) never committed; use a secrets manager (Vercel/Railway env vars minimum, a real secrets manager once past seed stage).

## 5. Third-Party Integrations Required

| Integration | Purpose | Phase |
|---|---|---|
| Stripe Connect | Escrow hold/release, freelancer payouts | 1 |
| Razorpay Route | India-specific escrow/payout alt | 1 (if targeting India primarily) |
| OpenAI API | Contract generation, scope validation, dispute suggestion | 1 |
| Resend/SendGrid | Transactional email | 1 |
| GitHub OAuth + API | Pull commit activity as evidence | 2 |
| Google Drive API | Link folders as evidence | 2 |
| Figma API | Link files as evidence | 2 |

## 6. Environments

- **Local**: Docker Compose for Postgres + Redis, `.env.local` with test-mode Stripe/OpenAI keys.
- **Staging**: mirrors production, test-mode payment keys, used for AI prompt iteration without financial risk.
- **Production**: live payment keys, monitoring (Sentry for errors, a basic uptime monitor).

## 7. Testing Requirements

- Unit tests on all money-movement logic (escrow fund, release, refund) — this code path gets the highest test coverage bar in the codebase.
- Integration tests for the full project lifecycle: create → contract accept → fund → submit → approve → release.
- AI outputs are non-deterministic — test the *contract* around them (does the app handle a malformed AI response, a timeout, a low-confidence flag) rather than asserting exact AI output text.