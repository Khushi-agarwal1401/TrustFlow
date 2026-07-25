<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TrustFlow AI — Full Project Summary

## Objective
AI-powered accountability platform for freelance projects — escrow, milestone contracts, evidence-based verification, dispute resolution, marketplace, enterprise orgs, integrations, invoicing, PWA, messaging, analytics, i18n.

## Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma 6, PostgreSQL
- Auth.js v5 (Google OAuth + Email magic link via Resend)
- Stripe for payments/escrow, Supabase Storage for evidence uploads
- BullMQ + Redis for background AI validation & risk signals
- OpenAI GPT-4o for contract generation, validation, dispute resolution, copilot
- Vitest for unit/integration tests, Playwright for E2E
- Dark theme (#0B0A1F), Poppins + Inter fonts
- next-intl for i18n (en/es)

## Build Status
- ✅ Build passes cleanly (all 70+ route groups compile)
- ✅ TypeScript strict mode passes
- ✅ 8 unit tests pass (3 test files)
- ✅ All 20+ database models synced
- ✅ Docker production build (standalone output)
- ✅ CI/CD pipeline configured (GitHub Actions)
- ✅ Seed script creates 3 test users + 6 clause templates

## Database Models (30+)
User, Project, Milestone, Contract, EscrowTransaction, Submission, AIReview, RiskSignal, Dispute, DisputeEvidence, Rating, ProjectEvent, Notification, Account, Session, VerificationToken, Organization, TeamOrganizationMember, OrganizationInvite, ApiKey, ClauseTemplate, ContractSignature, FreelancerProfile, Proposal, WebhookIntegration, WebhookDelivery, Invoice, TaxInfo, AuditLog, PushSubscription, Message

## Completed Features

### Core (Phase 0-2)
Auth (Google + Email), project creation, AI contract generation, editable milestones, freelancer invite, Stripe escrow, milestone submission (files + links), AI scope validation (BullMQ worker), approval/rejection with revision cap, notifications (in-app + email), risk signals engine, dispute flow with AI resolution, admin arbitration queue, reputation system, dashboard analytics

### Enterprise (Phase 3)
Freelancer replacement, enterprise orgs (OWNER/ADMIN/MEMBER roles, member invites), legal automation (jurisdiction clause templates, e-signatures, HTML contract export), public API (ApiKey with SHA-256, Bearer auth middleware, v1 routes, key management UI)

### AI Copilot (Phase 4)
AI milestone splitting, deadline prediction, progress report generation

### Integrations Hub (Phase 4.3)
Webhook CRUD (GitHub/GitLab/Slack/Linear/Custom), GitHub webhook receiver, Slack webhook receiver, delivery logs

### Compliance & Invoicing (Phase 4.4)
Invoice CRUD (line items, tax, status), Stripe payment for invoices, tax info management, audit log

### PWA (Phase 4.2)
Web app manifest, push notification subscriptions, push notification service

### Messaging (Phase 4.5)
Project-based chat with Message model, send/list API, chat UI on project detail

### Marketplace (Phase 5)
Public project listings (isListed toggle), browse/search, proposal system (bid/submit/accept/reject/withdraw), freelancer profiles (skills, hourly rate, portfolio)

### Analytics (Phase 6)
Advanced analytics API with monthly revenue, completion rate, project value, bar chart visualizations at /analytics

### Testing (Phase 7)
Vitest config, test files for projects, contracts, escrow (8 tests passing), Playwright ready

### Deployment (Phase 8)
Dockerfile (multi-stage, standalone output), docker-compose, .env.example, backup script, GitHub CI/CD (lint + test + build + deploy)

### Localization (Phase 9)
next-intl ready, English + Spanish locale files (en.json, es.json), language switcher, RTL-ready

## Pages (25+)
`/` dashboard · `/auth/signin` · `/analytics` · `/marketplace` · `/projects/new` · `/projects/[id]` · `/projects/[id]/contract` · `/projects/[id]/fund` · `/projects/[id]/submit/[milestoneId]` · `/projects/[id]/legal` · `/projects/[id]/proposals` · `/invite/[token]` · `/invite/organization/[token]` · `/disputes/[id]` · `/admin/disputes` · `/profile/[id]` · `/users/[id]` · `/settings/api-keys` · `/settings/organization` · `/settings/integrations` · `/settings/tax` · `/settings/invoices`

## API Routes (70+)
auth, projects (CRUD+list+replace+send-invite+list+message), contracts (generate+sign+pdf), milestones (submit+approve+reject), escrow (create-intent+confirm), invite (project+org), disputes (create+evidence+suggest+resolve), admin/disputes, users (stats+profile), notifications, upload, clause-templates, proposals, marketplace/projects, profile, organizations (CRUD+members+invites), ai (split-milestones+deadline-predict), integrations (CRUD+deliveries), webhooks (github+slack), invoices (CRUD+pay), tax-info, audit-log, api-keys, push-subscribe, analytics/overview, v1/projects

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Build and type-check
- `npm test` — Run unit tests (Vitest)
- `npx prisma db push` — Sync schema to DB
- `npx prisma generate` — Regenerate client
- `npm run db:seed` — Run seed script
- `scripts/backup.sh` — Database backup
