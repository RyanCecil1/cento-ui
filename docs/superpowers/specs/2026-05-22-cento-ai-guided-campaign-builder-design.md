# Cento AI-Guided Campaign Builder and Shared Shell Redesign

Date: 2026-05-22
Status: Approved for implementation planning

## Goal

Add a production-credible AI writing flow directly into campaign creation and restyle the shared app shell so the product feels cleaner, calmer, and more industry-standard.

This work should solve two problems at once:

1. The current AI surface is disconnected from the real campaign workflow and does not help users create usable SMS copy.
2. The current UI feels too boxy, placeholder-heavy, and visually generic.

The target product shape is a single-owner self-serve SMS workspace with AI-assisted copy generation embedded into the campaign builder, not a separate AI tool bolted onto the side.

## Decisions Already Locked

- AI is embedded directly into campaign creation.
- AI should generate messages from campaign goals, audience, tone, and sender context.
- The compose step should actively guide the user with structured inputs.
- AI should return multiple candidate messages first.
- The user must pick a candidate before editing the final draft.
- The shared app shell should be restyled, not only the AI page.
- Visual direction is clean enterprise: restrained, airy, neutral, and dashboard-like.
- Typography direction is `Poppins` for headings with a calmer UI font for body copy.

## Non-Goals

This pass does not include:

- AI billing or usage metering
- Multi-model support
- AI history or prompt memory across campaigns
- Real SMS-provider-aware AI behavior
- Deep analytics for copy performance
- A full campaign-builder information architecture rewrite beyond what is needed for the new compose workflow

## Product Approach

### Recommended Approach

Embed AI into the existing campaign builder and turn the compose step into a guided message studio.

Users should move through the existing builder flow as they do today, but the compose step should become structured and purposeful:

- collect campaign-aware inputs
- generate multiple SMS candidates
- select one candidate
- refine it into the final editable message

This approach keeps the product centered on campaign creation while improving the visual system across the entire app shell.

### Alternatives Considered

#### 1. AI Sidecar in the Existing Builder

This is the recommended option. It improves the current flow without introducing a second drafting experience.

Pros:

- aligns AI with the real campaign workflow
- lower regression risk than a full builder rewrite
- easiest way to persist generated content in draft state

Cons:

- requires careful compose-step redesign to avoid overloading the existing builder

#### 2. Full Campaign Studio Redesign

This would rebuild campaign creation as a broader editorial workspace with larger layout changes and deeper AI orchestration.

Pros:

- strongest long-term UX ceiling
- more room for preview and advanced controls

Cons:

- larger rewrite
- higher risk of destabilizing the validated campaign flow
- too much scope for this pass

#### 3. Separate AI Tool with Light Shell Polish

This would keep AI largely detached and only improve the current shell visually.

Pros:

- fastest to ship

Cons:

- feels bolted on
- does not fix the core workflow problem
- keeps campaign creation and AI generation disconnected

## UX Design

### Shared Shell Direction

The app shell should shift from repeated bordered rectangles to a calmer enterprise system with better structure and less noise.

The visual system should move toward:

- fewer hard borders
- broader panels and softer surfaces
- stronger hierarchy through spacing and typography
- more deliberate section headers
- less placeholder text inside inputs
- cleaner empty states with explicit guidance

The redesign should not rely on novelty styling. It should feel professional, restrained, and easy to scan.

#### Typography

- `Poppins` should be used for display and headings.
- A calmer sans-serif should be used for body and UI text.
- Recommendation: `Manrope` for body/UI text.

Typography goals:

- stronger contrast between page titles and supporting copy
- cleaner dashboard readability
- reduced visual clutter from dense small labels

#### Surfaces and Layout

The current system overuses cards and stacked rectangular containers. The redesign should reduce visual fragmentation by:

- consolidating small cards into larger sections where appropriate
- using spacing, background contrast, and subtle borders instead of repeated boxes
- making page sections feel intentional rather than auto-generated

This change should apply consistently to the shared shell and app pages, not only the campaign builder.

### Campaign Builder Compose Step

The compose step becomes the center of the AI experience.

#### Core Flow

1. The user arrives at compose after campaign details and audience setup.
2. The page shows structured AI guidance inputs tied to the campaign context.
3. The user requests generation.
4. AI returns three candidate SMS drafts.
5. The user selects one candidate.
6. The selected candidate becomes the editable draft.
7. The user edits the draft manually or requests another AI pass.
8. The resulting message stays in the campaign draft state and continues through scheduling or send.

#### Structured Inputs

The compose step should gather:

- campaign goal
- tone
- urgency level
- offer or announcement
- call to action
- sender context
- short audience framing

These inputs must feel guided, not like a dense form. The UI should frame them as message-building context rather than raw metadata entry.

#### Layout

Recommended compose-step layout:

- left rail or primary side section for structured inputs and campaign context
- central candidate area for generated options
- final draft editor that appears after candidate selection

The user should not start in a blank textarea. The workflow should first move through comparison and choice.

#### Candidate Generation Behavior

The system should return three distinct candidate messages with concise labels such as:

- direct
- friendly
- high-conversion

The labels may change later, but v1 should always present distinct variants rather than minor wording changes.

Requirements:

- users must choose one candidate before editing
- the chosen candidate becomes the editable message body
- the selected candidate should remain visible enough for auditability and retry context

#### Empty and Loading States

The current placeholder-heavy behavior should be replaced with explicit state messaging.

Examples of intended states:

- before generation: explain that the user should define the campaign intent and request options
- while generating: show a concise working state, not a decorative filler block
- after generation: show clear candidate separation and a selection prompt
- after selection: transition to the editable draft cleanly

### Standalone AI Page

The standalone AI page should remain in the product, but it is no longer the center of the AI feature.

Its role becomes:

- experimentation outside an active campaign
- copy ideation
- lightweight drafting support

It should be visually aligned with the new system and use clearer language, but the primary AI workflow should live inside campaign creation.

## Technical Design

### Integration Boundary

AI generation must run server-side.

The client should call a local app route. That route should call DeepSeek using `DEEPSEEK_API_KEY` from server environment variables only.

The key must never be exposed to the browser.

### DeepSeek Integration

Implementation should follow the existing pattern already used in the related `REVISIONXWEB` project, where available, so the integration remains consistent with the user's current toolchain.

Assumptions for the initial implementation:

- provider: DeepSeek
- endpoint family: chat completion style API
- model: the stable general-purpose text model already used in the user's existing project

These assumptions should be confirmed during implementation when the real env source is inspected.

### Prompt Contract

The model prompt should be shaped around SMS-safe output:

- concise copy
- no markdown
- no explanations
- clear CTA
- three distinct variants
- safe formatting for direct placement into the UI

The server route should normalize the AI response into a stable typed shape rather than passing raw provider text directly into the frontend.

### Frontend State Model

The existing `CampaignDraft` model should be extended to include AI-related compose state.

Expected additions:

- structured AI input values
- generated candidates
- selected candidate identifier
- editable final message derived from the selected candidate

The design should avoid creating a second disconnected message state.

### Error Handling

The AI flow should handle:

- missing API key
- provider timeout
- provider validation failure
- malformed provider response
- empty result set

The UI should surface these as clear operational messages inside the compose step, without crashing the builder or losing the current draft.

### Security

Security requirements:

- keep the DeepSeek API key server-only
- validate the request payload on the server
- limit the prompt to the minimum required campaign context
- avoid logging sensitive campaign content unnecessarily
- preserve workspace ownership checks on any route that accepts campaign data

## Shared UI Cleanup Scope

This pass should apply the redesign principles across the shared shell, which likely includes:

- global font setup
- top-level app layout
- shared surface classes
- navigation visual treatment
- page section spacing
- buttons, labels, helper text, and empty states

The exact implementation should reuse existing primitives where possible and update shared styling hooks rather than patching pages inconsistently.

## Testing and Verification

Implementation should be considered complete only if all of the following pass:

### Functional

- AI generation works from the campaign builder compose step
- three candidates are returned in a stable UI shape
- the user cannot edit the final message until a candidate is selected
- the selected candidate persists in draft state
- the final draft can continue through the existing builder flow

### Visual

- the shared shell feels calmer and less boxy
- typography is consistent and deliberate
- placeholder-heavy sections are replaced with explicit guidance
- compose feels like a guided studio, not a blank form

### Technical

- API key remains server-only
- server payload validation succeeds for supported requests
- failure states do not break the builder
- existing lint, typecheck, tests, and build continue to pass

## Acceptance Criteria

The work is accepted when:

- the product no longer feels template-generated or overly rectangular
- the compose step becomes a guided AI-assisted workflow
- AI generation is embedded directly in campaign creation
- users compare candidates before editing
- the final edited message remains part of the campaign draft
- the shared shell uses a cleaner and more coherent visual system

## Risks and Mitigations

### Risk: AI Feels Bolted On

Mitigation:

- keep AI inside the compose step
- tie generated content to real campaign state
- design the layout around campaign work, not around a generic assistant panel

### Risk: Compose Step Becomes Too Heavy

Mitigation:

- keep structured inputs concise
- stage the workflow around generation and selection
- avoid exposing advanced prompt controls in v1

### Risk: Visual Inconsistency Across Pages

Mitigation:

- update shared styles and shell primitives first
- use page-level cleanup only after the shared rules are in place

### Risk: Provider Failure Damages Drafting Flow

Mitigation:

- preserve draft state independently of generation results
- keep manual editing available after a valid candidate has been selected
- render clear retry states

## Implementation Planning Notes

The implementation plan should be broken into at least these areas:

1. shared typography and shell restyle
2. campaign draft model extension for AI compose state
3. server-side DeepSeek route and env wiring
4. compose-step redesign and candidate workflow
5. standalone AI page cleanup
6. validation, failure states, and verification

## Spec Review

This spec has been checked for:

- placeholder requirements
- internal contradictions
- unclear ownership of AI state
- accidental expansion into billing or provider-specific analytics scope

No unresolved placeholders remain in the approved scope.
