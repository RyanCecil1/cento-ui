# Cento Production Campaign Flow Design

Date: 2026-05-21
Status: Approved design
Scope: V1 production architecture for campaigns, contacts, sender IDs, wallet accounting, scheduling, and delivery reporting

## Context

This repository is currently a frontend-first prototype. The main production-shaped surfaces already exist in:

- `src/components/campaign-builder.tsx`
- `src/app/app/campaigns/page.tsx`
- `src/app/app/campaigns/new/page.tsx`
- `src/app/app/contacts/page.tsx`
- `src/app/app/sender-ids/page.tsx`
- `src/app/app/wallet/page.tsx`
- `src/app/app/reports/page.tsx`

Those screens should remain the primary user-facing surfaces, but their current static or local-only behavior must be replaced with real backend-backed workflows.

The goal of this design is not to build a generic enterprise messaging system. It is to ship a self-serve SMS product that one owner can use safely without requiring internal approval queues.

## Product Positioning

V1 is a single-owner, self-serve workspace.

The owner can:

- create an account
- verify access
- top up SMS credits
- upload and organize contacts
- create and edit campaigns
- send immediately or schedule for later
- pause, resume, cancel, retry, or clone campaigns
- use a shared sender or request branded sender IDs
- inspect delivery and wallet history

The system, not a human reviewer, enforces operational safety through validation, sender checks, suppression rules, credit checks, idempotency, and rate control.

## Decisions Locked In

- Approval model: no human approval workflow in V1
- Workspace model: one account owns one workspace
- Audience model: groups plus filters
- Audience resolution timing: resolve recipients at execution time
- Credit behavior: do not reserve credits when scheduling; check at execution time
- Sender model: shared sender plus branded sender request flow
- Message model: plain SMS plus reusable templates
- Contact model: operational fields, not just phone and name
- Cleanup model: soft cleanup with automatic exclusion of invalid, duplicate, and suppressed recipients
- Suppression model: workspace suppression list with automatic exclusion from all sends
- Provider strategy: one active SMS provider behind a provider abstraction
- Execution model: unified job queue for send-now and scheduled campaigns
- Billing model: prepaid credits with immutable wallet ledger
- Timezone model: workspace timezone only
- Personalization model: basic variables with fallback values
- Retry model: transient retry only
- Reporting model: campaign summary plus recipient-level operational reporting
- Throughput model: chunked execution with provider-aware rate control
- Scheduling controls: pause, resume, edit, and cancel until execution begins
- Top-up model: self-serve payments plus manual adjustments
- Authentication model: email/password plus account verification
- Duplicate protection: hard idempotency guard

## Non-Goals

V1 does not include:

- multi-user approval chains
- role-based approver workflows
- multi-workspace switching
- postpaid or invoice billing
- multi-provider routing logic
- deep compliance automation such as full STOP and START keyword workflows unless the chosen gateway later requires it
- fully dynamic custom-field segmentation engine

These may become future expansion areas, but they should not shape the initial core architecture beyond keeping the schema extensible.

## Recommended Architecture

Use a lean monolith:

- Next.js App Router for product UI and application endpoints
- TypeScript across frontend and backend code
- Supabase/PostgreSQL as the system of record
- background job processing for scheduled and immediate sends
- a provider abstraction for the SMS gateway
- immutable wallet ledger accounting

This is the correct tradeoff for V1. It is simpler than an event-heavy system but still disciplined enough to support retries, billing traceability, and operational recovery.

## Domain Model

### Workspace

The workspace is the ownership boundary for all operational data. Even though V1 exposes only one workspace per account, campaigns, contacts, templates, sender IDs, jobs, payments, and wallet records must all belong to a workspace.

Core workspace responsibilities:

- timezone
- credit balance derivation through ledger entries
- sender availability
- suppression scope
- contact and campaign ownership

### User

The user is the owner of the workspace in V1. Authentication must require verified account status before allowing live sends, top-ups, or branded sender requests.

### Contact

Contacts should support an operational data shape:

- phone number
- full name
- first name
- last name
- source
- status
- groups
- tags
- normalization state
- suppression eligibility

This is enough for filtering, personalization, and reporting without committing to fully arbitrary custom-field segmentation on day one.

### Groups and Filters

Audiences in V1 combine:

- explicit saved groups
- filters over supported contact attributes

The UI can initially expose only the most useful filters, but the data model should represent both group membership and filter rules separately.

### Suppression

Suppression is workspace-wide. Any manually blocked or unsubscribed number must be excluded automatically from all campaigns.

### Template

Templates support:

- built-in starter templates
- owner-created personal templates
- basic personalization variables
- fallback replacement behavior

Templates should remain lightweight reusable content, not a versioned approval artifact.

### Sender ID

V1 supports:

- a shared platform sender when allowed
- branded sender requests tracked in-product

Sender IDs need clear lifecycle states such as draft, submitted, in review, approved, and rejected.

### Campaign

The campaign is the editable user definition. It stores:

- campaign name
- selected sender strategy
- message body or template reference
- personalization fallback settings
- audience groups
- audience filter rules
- schedule configuration
- current lifecycle state

The campaign is not the final execution snapshot. It remains the owner-editable source definition until a job actually starts.

### Campaign Run

Each execution attempt needs a run record that freezes the exact operational inputs used at execution time:

- resolved recipient snapshot
- exact sender used
- rendered message basis
- unit calculation
- charge basis
- final counts

This separation avoids ambiguity when a scheduled campaign changes repeatedly before send time.

### Campaign Job

Every immediate send and scheduled send must create a job. That job is responsible for:

- due-time release
- final recheck
- idempotent execution ownership
- chunk progression
- retry coordination
- final status closure

There should not be a separate direct-send path outside the queue.

### Message Attempt

A message attempt records per-recipient operational outcomes:

- campaign run
- recipient
- rendered units
- provider message identifier
- retry count
- provider response
- final outcome

This supports operational reporting and support diagnosis without overbuilding a full event-sourcing system.

### Wallet and Ledger

Wallet balance must be derived from immutable ledger entries, not loosely edited balance fields.

Ledger events include:

- confirmed top-up credit
- manual support adjustment
- campaign execution deduction
- refund or reversal

Each deduction must point back to the workspace, campaign, job, and run.

### Payments

Payment intent and credit posting should be separate concerns. A self-serve top-up should create a payment-side record first, and the wallet ledger should only be credited after a confirmed payment event.

### Activity Log

Owner actions should be traceable:

- create campaign
- edit campaign
- schedule
- send now
- pause
- resume
- cancel
- retry
- clone
- submit branded sender request
- create manual adjustment

## Campaign State Model

Recommended campaign states:

- `draft`
- `queued`
- `paused`
- `rechecking`
- `sending`
- `needs_attention`
- `completed`
- `completed_with_failures`
- `canceled`

Behavior summary:

- `draft`: owner can edit freely
- `queued`: campaign is waiting for execution, either immediate or scheduled
- `paused`: scheduled execution intentionally paused before start
- `rechecking`: worker owns the campaign and is validating send conditions
- `sending`: execution is in progress through chunk processing
- `needs_attention`: final recheck failed and no send occurred
- `completed`: send finished and results are locked
- `completed_with_failures`: send completed but some recipients failed permanently or after retry
- `canceled`: owner canceled before execution started

Once `rechecking` begins, the execution path must become worker-controlled to avoid race conditions with live editing.

## Execution Model

### Unified Queue

Every campaign send uses one queue model:

- send-now campaigns create a due job immediately
- scheduled campaigns create a future-due job
- the scheduler releases jobs into workers
- the worker performs the final checks and execution

This avoids maintaining one send path for immediate sends and another for scheduled sends.

### Final Recheck

Before any SMS is sent, the worker must confirm:

- campaign is still active and not canceled
- due time has actually arrived in workspace timezone
- selected sender is valid
- audience resolves to at least one deliverable recipient
- invalid, duplicate, and suppressed recipients are excluded
- rendered message passes content and size validation
- wallet balance covers the exact send cost
- idempotency key has not already been consumed

If any of these fail:

- do not send anything
- do not consume the execution key
- move campaign to `needs_attention`
- store a machine-readable failure reason

### Audience Resolution

Audience resolution happens at execution time, not at schedule time. This is a deliberate product decision to prioritize editability and live audience behavior. The downside is that cost and counts can drift before send time.

To contain that risk:

- the UI must label scheduled totals as estimates before execution
- the worker must store the exact resolved audience snapshot used for the run

### Credit Handling

Credits are not reserved when scheduling. They are checked when execution starts.

Consequence:

- a campaign can look valid during setup
- fail later because credits were consumed elsewhere

This is acceptable for V1 as long as:

- the UI communicates that scheduled cost is an estimate
- failure lands cleanly in `needs_attention`
- the owner is told how to recover

### Chunking and Rate Control

Campaign execution must process recipients in chunks and apply provider-aware throughput limits. A single-pass send is too fragile for real usage.

Chunking responsibilities:

- batch recipient processing
- incremental progress tracking
- throughput protection
- partial failure capture
- retry boundaries

### Retry Policy

Retry only transient provider failures a limited number of times. Do not retry permanent failures such as invalid recipients or blocked numbers.

### Idempotency

Duplicate sends are unacceptable in an SMS product.

Idempotency is required for:

- owner send commands
- scheduled job release
- execution start
- payment confirmation
- wallet deduction posting

The same campaign job must never produce duplicate message sends because of refreshes, retries, or repeated worker claims.

## Wallet Accounting Rules

### Credits Added

Credits may be added by:

- confirmed self-serve top-up
- manual support adjustment
- refund or correction

### Credits Removed

Credits may be removed by:

- campaign execution deduction
- manual debit correction

### Hard Rules

- never deduct on draft save
- never deduct on schedule creation
- deduct only after final recheck passes and execution begins
- every adjustment requires actor and reason
- every campaign deduction must be traceable to a campaign run

## Reporting Model

V1 reporting should be operational, not merely decorative.

### Campaign List

Should show:

- state
- schedule
- estimated versus actual reach where relevant
- credits used
- needs-attention visibility

### Campaign Detail

Should show:

- summary counts
- failure reasons
- retry outcomes
- per-recipient outcomes
- export or download support

### Wallet History

Should show:

- top-ups
- manual adjustments
- campaign deductions
- refunds
- running balance

### Contact Quality Surface

Should show:

- valid
- invalid
- duplicate
- suppressed

This is important because the chosen audience model depends on soft cleanup rather than blocking every imperfect import upfront.

### Sender ID Surface

Should show:

- shared sender availability
- branded request lifecycle

## Security and Data Integrity

Even as a single-owner product, V1 must enforce strong backend guardrails.

Required controls:

- workspace-scoped access on every read and write
- server-side validation for schedules, campaigns, wallet operations, and sender eligibility
- immutable ledger entries rather than balance overwrites
- verified-account gating before live operations
- safe processing of payment confirmation
- provider rate control

## Repository Mapping

The current frontend should evolve rather than be replaced.

Recommended mapping:

- `src/components/campaign-builder.tsx`
  - move from local draft and static previews to real campaign draft persistence, cost estimation, sender selection, audience selectors, and schedule controls
- `src/app/app/campaigns/page.tsx`
  - move from static list to real campaign list with operational states and recovery actions
- `src/app/app/contacts/page.tsx`
  - move from preview-only table to import quality, group management, filter support, and suppression visibility
- `src/app/app/sender-ids/page.tsx`
  - become the owner surface for shared sender visibility and branded sender request tracking
- `src/app/app/wallet/page.tsx`
  - become the top-up, balance, and ledger history surface
- `src/app/app/reports/page.tsx`
  - become the operational reporting surface for campaign and recipient outcomes

## Phased Delivery

### Phase 1: Foundation

Build:

- authentication and verification
- workspace model
- contacts and groups
- suppression
- sender IDs
- templates
- campaign schema
- wallet and ledger schema

Exit criteria:

- owner account can exist safely
- core entities are persisted and workspace-scoped

### Phase 2: Owner Workflows

Build:

- campaign drafting and editing
- audience selection
- cost estimation
- send-now setup
- schedule, pause, resume, cancel
- template usage

Exit criteria:

- owner can complete the full setup flow for a campaign with persistent data

### Phase 3: Execution Engine

Build:

- unified queue
- job runner
- final recheck pipeline
- live audience resolution
- sender validation
- chunking
- rate control
- retry handling
- idempotent deductions

Exit criteria:

- campaign execution is safe, traceable, and non-duplicating

### Phase 4: Money Movement

Build:

- self-serve top-up flow
- payment confirmation handling
- manual support adjustments
- wallet history

Exit criteria:

- credits enter and leave the system through traceable flows only

### Phase 5: Operational Visibility

Build:

- campaign reporting
- recipient outcome reporting
- export support
- contact quality views
- sender request tracking

Exit criteria:

- owner and support can diagnose what happened without digging into raw database records

## Acceptance Criteria

V1 is complete only if:

- an owner can sign up, verify access, and create a workspace
- the owner can top up credits successfully
- the owner can upload contacts, manage groups, and use filters
- invalid, duplicate, and suppressed recipients are excluded automatically
- the owner can draft, send, schedule, pause, resume, cancel, retry, and clone campaigns
- no human approval queue is required
- the system resolves audience and cost at execution time
- the system blocks unsafe sends cleanly
- every send is idempotent
- every deduction is traceable in the ledger
- reporting clearly exposes results and recovery states

## Risks and Follow-Up

Known product risks accepted in this design:

- scheduled campaigns can fail late because credits are not reserved
- final audience size and cost can change before execution
- provider rate control and chunking add backend complexity that a pure inline API flow cannot safely cover

Future follow-up areas after V1:

- multi-user workspaces
- optional approval workflows
- multi-workspace ownership
- richer compliance tooling
- broader segmentation rules
- additional provider routing
