# Backend Schema Document
## TrustFlow AI — PostgreSQL / Prisma

All monetary amounts stored as integers in the smallest currency unit (cents/paise) — never floats. All timestamps in UTC.

---

## 1. Core Entities

### `User`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| email | string, unique | |
| phone | string, nullable | |
| password_hash | string, nullable | null if OAuth-only |
| name | string | |
| avatar_url | string, nullable | |
| roles | enum[] | `CLIENT`, `FREELANCER`, `ADMIN` — a user can hold both CLIENT and FREELANCER |
| stripe_connect_account_id | string, nullable | set once freelancer completes payout onboarding |
| stripe_customer_id | string, nullable | set once client adds a payment method |
| created_at | timestamp | |
| updated_at | timestamp | |

### `Project`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| client_id | uuid, FK → User | |
| freelancer_id | uuid, FK → User, nullable | null until freelancer accepts and creates account |
| freelancer_invite_email | string | set at creation, before freelancer has an account |
| title | string | |
| description | text | |
| total_amount | integer | smallest currency unit |
| currency | string | ISO 4217, e.g. `USD`, `INR` |
| status | enum | `DRAFT`, `AWAITING_ACCEPTANCE`, `DECLINED`, `AWAITING_FUNDING`, `IN_PROGRESS`, `DISPUTED`, `COMPLETED`, `CANCELLED` |
| created_at | timestamp | |
| updated_at | timestamp | |

### `Milestone`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| project_id | uuid, FK → Project | |
| sequence | integer | order within project |
| title | string | |
| deliverable_description | text | what the AI/contract defines as "done" — used as the reference for scope validation |
| amount | integer | smallest currency unit |
| due_date | date, nullable | |
| status | enum | `PENDING`, `FUNDED`, `SUBMITTED`, `IN_REVIEW`, `REVISION_REQUESTED`, `APPROVED`, `PAID`, `DISPUTED` |
| revision_count | integer, default 0 | caps at 2 before dispute path opens |
| created_at | timestamp | |
| updated_at | timestamp | |

### `Contract`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| project_id | uuid, FK → Project, unique | one contract per project |
| ai_generated_draft | jsonb | raw AI output, retained for audit even after edits |
| final_terms | jsonb | the edited/accepted version actually binding |
| accepted_by_freelancer_at | timestamp, nullable | |
| accepted_ip | string, nullable | lightweight acceptance record |
| pdf_url | string, nullable | generated snapshot for download/legal use |
| created_at | timestamp | |

### `EscrowTransaction`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| milestone_id | uuid, FK → Milestone | |
| type | enum | `FUND`, `RELEASE`, `REFUND` |
| amount | integer | |
| provider | enum | `STRIPE`, `RAZORPAY` |
| provider_reference_id | string | Stripe/Razorpay transaction id |
| idempotency_key | string, unique | required on every insert — prevents double-charge/double-release |
| status | enum | `PENDING`, `SUCCEEDED`, `FAILED` |
| created_at | timestamp | |

### `Submission`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| milestone_id | uuid, FK → Milestone | |
| description | text | freelancer's own summary |
| file_urls | string[] | S3 keys |
| link_evidence | jsonb | `[{type: 'github'\|'drive'\|'figma'\|'url', url, label}]` |
| submitted_at | timestamp | |

### `AIReview`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| submission_id | uuid, FK → Submission | |
| match_summary | text | plain-language output shown to client |
| confidence | enum | `HIGH`, `NEEDS_REVIEW` |
| raw_model_output | jsonb | full response, retained for audit/debugging |
| model_version | string | track which model/prompt version produced this — required for reproducibility |
| created_at | timestamp | |

### `RiskSignal`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| project_id | uuid, FK → Project | |
| level | enum | `GREEN`, `AMBER`, `RED` |
| reason | string | the specific human-readable trigger, e.g. "No activity in 6 days, milestone due in 2" |
| computed_at | timestamp | recomputed on a schedule (e.g. daily) and on relevant events, not stored as a single mutable field — keep history for audit and future ML training data |

### `Dispute`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| milestone_id | uuid, FK → Milestone | |
| opened_by | uuid, FK → User | |
| status | enum | `EVIDENCE_PENDING`, `AI_SUGGESTED`, `RESOLVED_ACCEPTED`, `ESCALATED`, `RESOLVED_ADMIN` |
| ai_suggested_resolution | jsonb, nullable | includes cited clause/evidence references |
| resolved_by | uuid, FK → User, nullable | admin id if escalated |
| resolution_notes | text, nullable | |
| created_at | timestamp | |
| resolved_at | timestamp, nullable | |

### `DisputeEvidence`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| dispute_id | uuid, FK → Dispute | |
| submitted_by | uuid, FK → User | |
| statement | text | |
| file_urls | string[] | |
| created_at | timestamp | |

### `Rating`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| project_id | uuid, FK → Project | |
| rated_by | uuid, FK → User | |
| rated_user | uuid, FK → User | |
| score | integer | 1–5 |
| comment | text, nullable | |
| created_at | timestamp | |

### `ProjectEvent` (audit log — append-only, never updated or deleted)
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| project_id | uuid, FK → Project | |
| actor_id | uuid, FK → User, nullable | null for system-generated events |
| event_type | string | e.g. `CONTRACT_ACCEPTED`, `MILESTONE_FUNDED`, `MILESTONE_APPROVED`, `DISPUTE_OPENED` |
| metadata | jsonb | before/after state relevant to the event |
| created_at | timestamp | |

### `Notification`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → User | |
| type | string | |
| payload | jsonb | |
| read_at | timestamp, nullable | |
| created_at | timestamp | |

## 2. Relationships Summary

- `User` 1—N `Project` (as client), `User` 1—N `Project` (as freelancer)
- `Project` 1—1 `Contract`
- `Project` 1—N `Milestone`
- `Milestone` 1—N `EscrowTransaction`
- `Milestone` 1—N `Submission`
- `Submission` 1—1 `AIReview`
- `Milestone` 1—N `Dispute` (typically 0 or 1 active)
- `Dispute` 1—N `DisputeEvidence`
- `Project` 1—N `RiskSignal` (historical, not a single mutable row)
- `Project` 1—N `ProjectEvent`

## 3. Indexing Notes

- `Project.status`, `Milestone.status` — indexed, heavily filtered on every dashboard query.
- `EscrowTransaction.idempotency_key` — unique index, hard requirement, not optional.
- `ProjectEvent.project_id, created_at` — composite index for audit trail retrieval in order.
- `RiskSignal.project_id, computed_at` — composite index to fetch latest signal per project efficiently.

## 4. Key Constraints to Enforce at the DB Level (not just app logic)

- `EscrowTransaction.idempotency_key` uniqueness — prevents double payment release even under retry/race conditions.
- `Milestone.revision_count` should have an application-level check (not DB constraint) capping at 2 before forcing dispute path — but log every increment as a `ProjectEvent`.
- Sum of `Milestone.amount` for a `Project` should equal `Project.total_amount` — enforce at the application layer when milestones are finalized (before contract send), not silently allowed to drift.