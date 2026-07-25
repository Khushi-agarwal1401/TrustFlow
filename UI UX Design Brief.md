# UI/UX Design Brief
## TrustFlow AI


## 1. Design Philosophy

**"Confident calm."** The product handles disputes, money, and broken trust — the UI's job is to feel like the one stable, legible thing in a stressful moment. Avoid: aggressive gradients everywhere, decorative animation on financial actions, playful copy on serious screens (a rejected milestone is not the place for a cute empty-state illustration).

Reserve high-energy visual treatment (the purple/blue gradients, glass cards, glow effects) for **marketing pages, dashboards, and onboarding** — not for the escrow funding screen, the dispute screen, or anywhere a legal/financial decision is being made. Those screens should shift to a **calmer, higher-contrast, more neutral treatment**: solid dark surfaces, minimal gradient, more whitespace, larger type. This split is the single most important instruction in this brief — treat it as a hard rule, not a suggestion.

## 2. Visual Identity

### Color System

| Token | Hex | Use |
|---|---|---|
| `bg-canvas` | `#0B0A1F` | Base app background |
| `bg-surface` | `#151330` | Card/panel background (solid, not glass) on money/legal screens |
| `bg-glass` | `#FFFFFF` @ 8–12% opacity over gradient | Marketing & dashboard decorative cards only |
| `accent-primary` | `#8B5CF6` (purple) | Primary actions, active states |
| `accent-secondary` | `#3B82F6` (blue) | Secondary emphasis, links |
| `accent-info` | `#67E8F9` (cyan) | Kickers, informational highlights |
| `state-success` | `#34D399` | Approved, funded, completed |
| `state-warning` | `#FBBF24` | Pending, needs attention, amber risk |
| `state-danger` | `#F87171` | Rejected, disputed, red risk — used sparingly, never decoratively |
| `text-primary` | `#F1F0FA` | Headings, primary content |
| `text-secondary` | `#A5B4CB` | Supporting text |
| `text-muted` | `#6B7290` | Timestamps, metadata |

Do not introduce additional accent colors. The restraint is the premium signal — a product with 3 accent colors used consistently reads more expensive than one with 8 used loosely.

### Typography

- **Headings**: Poppins (Semibold/Bold) — used for page titles, section headers, dashboard numbers.
- **Body/UI**: Inter — used for everything else: labels, body copy, table data, buttons. Inter at small sizes is more legible than Poppins for dense financial/contract data, which is most of this app.
- **Type scale**: 12 / 14 / 16 / 20 / 24 / 32 / 44px. Do not freelance new sizes — an AI coding agent should reference this scale in every component.
- **Numbers** (money amounts, percentages): tabular figures (`font-variant-numeric: tabular-nums`) everywhere they appear in a list or table, so amounts align vertically. This single detail separates a fintech-grade UI from a template one.

### Elevation & Materials

- **Marketing/dashboard**: glassmorphism cards (blurred, translucent, gradient background behind) — matches the pitch deck.
- **Transactional screens** (funding, contract review, dispute): solid `bg-surface` cards with a 1px `#2A2755` border and a subtle drop shadow. No blur, no translucency. The material itself signals "this is a serious screen."
- **Radius**: 16px for cards, 10px for buttons/inputs, 999px (pill) for status badges and tags only.

### Iconography

- Consistent line-icon set (Lucide or Phosphor, not mixed sets) at 20px in UI, 24–28px in cards. Icons sit inside a circular chip with 10% opacity fill of the relevant state color (matches the deck's icon-chip pattern) — but only on dashboard/marketing surfaces, not inline in dense tables.

## 3. Key Screen Treatments

### Dashboard (Client & Freelancer)
- Glass-card project tiles, gradient background, matches brand energy.
- Each project tile: name, status pill, risk indicator (green/amber/red dot, never a bare percentage), next action CTA.
- Top summary row: active projects, total escrowed, awaiting-your-action count — the thing the user most needs is "what needs me right now," surfaced first, not buried in a list.

### Contract Review Screen (transactional — calm treatment)
- Solid surface, generous line height, milestone list as a clear vertical sequence (numbered, connected by a thin line — echoes the deck's step pattern but restrained, no glow).
- Editable fields inline with clear "edited" indicators once a client changes an AI-drafted value, so nothing is silently different from what the AI proposed.
- Sticky footer showing running total vs. budget as the client edits milestones — never let a client send a contract where the math doesn't add up without seeing it in real time.

### Escrow Funding Screen (transactional — calmest treatment in the app)
- Minimal, centered, single-column. This is the highest-anxiety moment in the product (paying money to someone you may not fully trust yet) — reduce visual noise to near-zero here. Payment provider's own trusted UI (Stripe Elements) should feel native, not skinned into oblivion.
- Explicit "your funds are held, not sent" messaging near the CTA — this is the core trust proposition and should be *said*, not implied by a lock icon.

### Milestone Submission (Freelancer)
- Evidence upload as a clear multi-type dropzone (files / link chips for GitHub, Drive, Figma, URL) with preview thumbnails once attached.
- Submission confirmation is warm and clear but not over-celebrated — this isn't the end of the relationship, it's a checkpoint.

### AI Review Summary (shown to Client)
- Framed explicitly as **assistive, not authoritative**: a labeled "AI Summary" card, visually distinct from the freelancer's actual submission, with a confidence tag (High / Needs your review) — never styled to look like a verdict or a pass/fail badge.

### Dispute Screen (transactional — calmest, most neutral treatment)
- Strictly symmetrical layout: both parties' statements and evidence shown in equal-weight columns. No color-coding one side as "right." Neutral gray/white text on dark surface, accent color used only for the AI's cited-evidence highlights.
- AI suggested resolution shown as a distinct, clearly-labeled card with its reasoning visible (which clause, which evidence) — never a black box.

### Risk Indicator Component (used across dashboard and project detail)
- Traffic-light dot + one-line plain-English reason, always paired together. Never show the dot alone — an unexplained risk indicator is exactly the kind of manipulative dark pattern this product is supposed to be the opposite of.

## 4. Motion & Interaction

- Use motion for **state transitions that matter** (milestone funded → progress bar fills, dispute resolved → status updates) — not for decoration.
- No animation on financial confirmation actions beyond a clear, brief success state. Do not add celebratory confetti/bounce on payment release — it's someone's money moving, not a game achievement.
- Loading states for AI actions (contract generation, scope validation) must show *what's happening* in text ("Reviewing submitted evidence against milestone 2...") not just a generic spinner — this reduces anxiety during the exact moments trust is being tested.

## 5. Accessibility & Trust Signals

- Minimum contrast ratio 4.5:1 for all body text on dark backgrounds — verify the muted text tokens above against actual background colors, don't eyeball it.
- Every AI-generated output in the product (contract clause, scope validation, dispute suggestion) carries a persistent small "AI-generated — review before relying on it" label. This is both an accessibility/clarity issue and a legal-exposure issue.
- Status changes announced to screen readers (aria-live regions) for approval/rejection/payment events — these are the moments users most need confirmation.

## 6. What NOT to do

- Don't apply the glass/gradient treatment to money-movement or dispute screens — see Section 1.
- Don't invent a 4th accent color for a "special" feature — reuse the existing state colors semantically.
- Don't style the AI's outputs to look more authoritative than a human's — the AI assists, it doesn't rule.
- Don't use stock "handshake" or "shield" illustrations beyond the icon set defined here — keep the illustration language limited to the icon-chip system, which is distinctive enough to be a brand asset on its own.