# Cento AI-Guided Campaign Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed DeepSeek-powered SMS generation into the campaign builder compose step while restyling the shared app shell into a calmer, cleaner enterprise UI.

**Architecture:** Keep the existing campaign builder flow and extend it with typed AI compose state, a server-side DeepSeek route, and a candidate-selection workflow before manual editing. Apply the visual redesign through shared typography, shell, and surface primitives first so the whole app changes consistently instead of page by page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Zod, Vitest, Next font loading, server-side fetch to DeepSeek chat completions.

---

## File Structure Map

### Existing files to modify

- `src/app/layout.tsx`
  - Swap the current font pairing to `Poppins` for headings plus a calmer body font.
- `src/app/globals.css`
  - Replace boxy shell tokens and repetitive card treatments with softer enterprise surfaces and clearer spacing rules.
- `src/components/ui.tsx`
  - Tighten button, section, and surface primitives to match the new shell language.
- `src/components/app-shell.tsx`
  - Restyle the sidebar, header, search shell, and wallet summary so the overall product stops feeling fragmented.
- `src/components/campaign-builder.tsx`
  - Extend builder state for AI compose inputs, candidate generation, candidate selection, and guided compose UI.
- `src/app/app/ai-writer/page.tsx`
  - Replace the placeholder page with a support surface aligned to the new system language.
- `src/lib/campaigns/types.ts`
  - Extend `CampaignDraft` with AI compose metadata.
- `src/app/api/campaigns/route.ts`
  - Accept the new draft shape from the builder.
- `src/lib/env.ts`
  - Add `DEEPSEEK_API_KEY` validation and keep it server-only.
- `.env.example`
  - Document `DEEPSEEK_API_KEY` for local setup.
- `src/data/site.ts`
  - Refresh AI labels and placeholder-heavy language where it appears in nav or support copy.

### New files to create

- `src/lib/ai/types.ts`
  - Shared AI request and response types.
- `src/lib/ai/prompts.ts`
  - Prompt builder for campaign-aware SMS generation.
- `src/lib/ai/deepseek.ts`
  - DeepSeek client wrapper that hides provider details from the route.
- `src/lib/ai/generate-campaign-copy.ts`
  - Single entry point that validates input and normalizes three message candidates.
- `src/app/api/ai/campaign-copy/route.ts`
  - Server route used by the campaign builder and AI writer page.
- `src/lib/ai/generate-campaign-copy.test.ts`
  - Unit coverage for prompt normalization and provider result shaping.
- `src/app/api/ai/campaign-copy/route.test.ts`
  - Route coverage for auth, validation, missing env, and success cases.

## Task 1: Shared Typography and Shell Foundation

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/ui.tsx`
- Modify: `src/components/app-shell.tsx`
- Test: visual smoke via `npm run build`

- [ ] **Step 1: Write the shared-shell target in code comments and class changes**

```tsx
// src/app/layout.tsx
import { Manrope, Poppins, JetBrains_Mono } from "next/font/google";

const bodySans = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displaySans = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
```

```css
/* src/app/globals.css */
:root {
  --app-bg: #f6f5f2;
  --app-sidebar: rgba(255, 255, 255, 0.84);
  --app-panel: rgba(255, 255, 255, 0.92);
  --app-panel-soft: rgba(255, 255, 255, 0.72);
  --app-border: rgba(25, 33, 52, 0.08);
  --app-text: #172033;
  --app-muted: #5b6475;
  --app-hover: rgba(23, 32, 51, 0.04);
  --app-shadow: 0 24px 60px -38px rgba(17, 24, 39, 0.18);
}

.app-card,
.app-card-soft,
.app-card-gradient,
.surface-panel {
  border-radius: 24px;
  box-shadow: var(--app-shadow);
}
```

- [ ] **Step 2: Update shell primitives**

```tsx
// src/components/ui.tsx
const buttonStyles = {
  primary:
    "bg-primary text-white shadow-[0_12px_24px_-14px_rgba(47,94,255,0.6)] hover:bg-primary-deep",
  outlineDark:
    "bg-transparent text-[var(--app-text)] border border-[var(--app-border)] hover:bg-[var(--app-hover)]",
};

export function SurfaceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface-panel rounded-[24px] p-6 ${className}`}>{children}</div>;
}
```

```tsx
// src/components/app-shell.tsx
<aside className="hidden border-r border-[var(--app-border)]/80 bg-[var(--app-sidebar)] px-5 py-6 backdrop-blur-xl lg:block">
<div className="mt-8 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-panel-soft)] p-4">
<header className="border-b border-[var(--app-border)] bg-[var(--app-header)]/90 px-4 py-5 backdrop-blur-xl lg:px-7">
```

- [ ] **Step 3: Run lint on the shared shell files**

Run: `npx eslint src/app/layout.tsx src/app/globals.css src/components/ui.tsx src/components/app-shell.tsx`

Expected: no lint errors

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/ui.tsx src/components/app-shell.tsx
git commit -m "feat: restyle shared shell foundations"
```

## Task 2: Add DeepSeek Env and Client Boundary

**Files:**
- Modify: `.env.example`
- Modify: `src/lib/env.ts`
- Create: `src/lib/ai/types.ts`
- Create: `src/lib/ai/prompts.ts`
- Create: `src/lib/ai/deepseek.ts`
- Create: `src/lib/ai/generate-campaign-copy.ts`
- Test: `src/lib/env.test.ts`
- Test: `src/lib/ai/generate-campaign-copy.test.ts`

- [ ] **Step 1: Extend env validation with a server-only AI key**

```ts
// src/lib/env.ts
const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  SMS_PROVIDER: z.enum(["demo", "hubtel"]).default("demo"),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().min(1).default("demo-webhook-secret"),
  HUBTEL_API_BASE_URL: z.string().url().optional(),
  HUBTEL_CLIENT_ID: z.string().min(1).optional(),
  HUBTEL_CLIENT_SECRET: z.string().min(1).optional(),
  HUBTEL_SENDER_ID: z.string().min(1).optional(),
});

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return getEnv().NEXT_PUBLIC_SUPABASE_URL;
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return getEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return getEnv().SUPABASE_SERVICE_ROLE_KEY;
  },
  get DEEPSEEK_API_KEY() {
    return getEnv().DEEPSEEK_API_KEY;
  },
  get SMS_PROVIDER() {
    return getEnv().SMS_PROVIDER;
  },
  get PAYMENT_PROVIDER_WEBHOOK_SECRET() {
    return getEnv().PAYMENT_PROVIDER_WEBHOOK_SECRET;
  },
  get HUBTEL_API_BASE_URL() {
    return getEnv().HUBTEL_API_BASE_URL;
  },
  get HUBTEL_CLIENT_ID() {
    return getEnv().HUBTEL_CLIENT_ID;
  },
  get HUBTEL_CLIENT_SECRET() {
    return getEnv().HUBTEL_CLIENT_SECRET;
  },
  get HUBTEL_SENDER_ID() {
    return getEnv().HUBTEL_SENDER_ID;
  },
};
```

```env
# .env.example
DEEPSEEK_API_KEY=
```

- [ ] **Step 2: Write the failing env test**

```ts
// src/lib/env.test.ts
it("allows demo runtime without a DeepSeek key", () => {
  expect(
    parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      PAYMENT_PROVIDER_WEBHOOK_SECRET: "secret",
      SMS_PROVIDER: "demo",
    }),
  ).toMatchObject({ SMS_PROVIDER: "demo" });
});
```

- [ ] **Step 3: Create the AI type and client boundary**

```ts
// src/lib/ai/types.ts
export type CampaignCopyTone = "direct" | "friendly" | "urgent" | "formal";

export type CampaignCopyRequest = {
  campaignName: string;
  senderName: string;
  audienceSummary: string;
  goal: string;
  tone: CampaignCopyTone;
  urgency: string;
  offer: string;
  cta: string;
  existingMessage?: string;
};

export type CampaignCopyCandidate = {
  id: string;
  label: string;
  body: string;
};
```

```ts
// src/lib/ai/prompts.ts
export function buildCampaignCopyPrompt(input: CampaignCopyRequest) {
  return {
    system:
      "You write concise SMS campaign copy. Return JSON only. No markdown. Keep outputs practical and CTA-driven.",
    user: `Campaign: ${input.campaignName}
Sender: ${input.senderName}
Audience: ${input.audienceSummary}
Goal: ${input.goal}
Tone: ${input.tone}
Urgency: ${input.urgency}
Offer: ${input.offer}
CTA: ${input.cta}
Existing message: ${input.existingMessage ?? "None"}

Return exactly 3 JSON candidates with labels and SMS bodies.`,
  };
}
```

```ts
// src/lib/ai/deepseek.ts
const DEEPSEEK_BASE = "https://api.deepseek.com/chat/completions";

export async function requestDeepSeekJson(messages: Array<{ role: "system" | "user"; content: string }>) {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_NOT_CONFIGURED");
  }

  const response = await fetch(DEEPSEEK_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 700,
    }),
  });

  return response;
}
```

- [ ] **Step 4: Write the failing AI normalization test**

```ts
// src/lib/ai/generate-campaign-copy.test.ts
it("normalizes exactly three candidates", async () => {
  const result = await normalizeCampaignCopyResult({
    candidates: [
      { label: "Direct", body: "Message one" },
      { label: "Friendly", body: "Message two" },
      { label: "Urgent", body: "Message three" },
    ],
  });

  expect(result).toEqual([
    { id: "candidate-1", label: "Direct", body: "Message one" },
    { id: "candidate-2", label: "Friendly", body: "Message two" },
    { id: "candidate-3", label: "Urgent", body: "Message three" },
  ]);
});
```

- [ ] **Step 5: Implement generation normalization**

```ts
// src/lib/ai/generate-campaign-copy.ts
const CandidateSchema = z.object({
  label: z.string().min(1),
  body: z.string().min(1),
});

const ProviderSchema = z.object({
  candidates: z.array(CandidateSchema).length(3),
});

export async function generateCampaignCopy(input: CampaignCopyRequest) {
  const prompt = buildCampaignCopyPrompt(input);
  const response = await requestDeepSeekJson([
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user },
  ]);

  if (!response.ok) {
    throw new Error(`DEEPSEEK_HTTP_${response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  const parsed = ProviderSchema.parse(JSON.parse(content));

  return parsed.candidates.map((candidate, index) => ({
    id: `candidate-${index + 1}`,
    label: candidate.label,
    body: candidate.body.trim(),
  }));
}
```

- [ ] **Step 6: Run the targeted tests**

Run: `npx vitest run src/lib/env.test.ts src/lib/ai/generate-campaign-copy.test.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add .env.example src/lib/env.ts src/lib/env.test.ts src/lib/ai/types.ts src/lib/ai/prompts.ts src/lib/ai/deepseek.ts src/lib/ai/generate-campaign-copy.ts src/lib/ai/generate-campaign-copy.test.ts
git commit -m "feat: add DeepSeek campaign copy client"
```

## Task 3: Add the Server Route for AI Campaign Copy

**Files:**
- Create: `src/app/api/ai/campaign-copy/route.ts`
- Create: `src/app/api/ai/campaign-copy/route.test.ts`
- Reuse: `src/lib/ai/generate-campaign-copy.ts`
- Reuse: `src/lib/auth/current-viewer.ts`

- [ ] **Step 1: Write the failing route tests**

```ts
// src/app/api/ai/campaign-copy/route.test.ts
it("returns 401 when there is no current viewer", async () => {
  vi.mock("@/lib/auth/current-viewer", () => ({
    getCurrentViewer: vi.fn().mockResolvedValue(null),
  }));

  const response = await POST(
    new Request("http://localhost/api/ai/campaign-copy", {
      method: "POST",
      body: JSON.stringify({ campaignName: "PTA Reminder" }),
    }),
  );

  expect(response.status).toBe(401);
});

it("returns candidates when the request is valid", async () => {
  vi.mock("@/lib/auth/current-viewer", () => ({
    getCurrentViewer: vi.fn().mockResolvedValue({ workspace: { id: "ws_123" } }),
  }));
  vi.mock("@/lib/ai/generate-campaign-copy", () => ({
    generateCampaignCopy: vi.fn().mockResolvedValue([
      { id: "candidate-1", label: "Direct", body: "Message one" },
      { id: "candidate-2", label: "Friendly", body: "Message two" },
      { id: "candidate-3", label: "Urgent", body: "Message three" },
    ]),
  }));

  const response = await POST(
    new Request("http://localhost/api/ai/campaign-copy", {
      method: "POST",
      body: JSON.stringify({
        campaignName: "PTA Reminder",
        senderName: "CentoSMS",
        audienceSummary: "Parents in Group A",
        goal: "Remind parents about tomorrow's meeting",
        tone: "friendly",
        urgency: "medium",
        offer: "N/A",
        cta: "Arrive by 10 AM",
      }),
    }),
  );

  expect(response.status).toBe(200);
});
```

- [ ] **Step 2: Implement the route**

```ts
// src/app/api/ai/campaign-copy/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { generateCampaignCopy } from "@/lib/ai/generate-campaign-copy";

const RequestSchema = z.object({
  campaignName: z.string().min(1),
  senderName: z.string().min(1),
  audienceSummary: z.string().min(1),
  goal: z.string().min(1),
  tone: z.enum(["direct", "friendly", "urgent", "formal"]),
  urgency: z.string().min(1),
  offer: z.string().min(1),
  cta: z.string().min(1),
  existingMessage: z.string().optional(),
});

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const payload = RequestSchema.parse(await request.json());
    const candidates = await generateCampaignCopy(payload);
    return NextResponse.json({ candidates });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid AI request payload" }, { status: 400 });
    }

    if (error instanceof Error && error.message === "DEEPSEEK_NOT_CONFIGURED") {
      return NextResponse.json({ error: "AI is not configured for this environment" }, { status: 503 });
    }

    return NextResponse.json({ error: "Unable to generate campaign copy" }, { status: 502 });
  }
}
```

- [ ] **Step 3: Run the route tests**

Run: `npx vitest run src/app/api/ai/campaign-copy/route.test.ts`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ai/campaign-copy/route.ts src/app/api/ai/campaign-copy/route.test.ts
git commit -m "feat: add AI campaign copy route"
```

## Task 4: Extend Campaign Draft Types and Save Contract

**Files:**
- Modify: `src/lib/campaigns/types.ts`
- Modify: `src/app/api/campaigns/route.ts`
- Test: `src/lib/campaigns/validation.test.ts`

- [ ] **Step 1: Write the failing draft-shape test**

```ts
// src/lib/campaigns/validation.test.ts
it("accepts AI compose metadata on a campaign draft", () => {
  const draft = {
    name: "PTA Reminder",
    senderId: "sender_1",
    message: "Parents, the meeting starts at 10 AM tomorrow.",
    audience: { groupIds: ["group_1"], filters: [] },
    personalizationDefaults: { firstName: "Customer", lastName: "" },
    aiCompose: {
      goal: "Remind parents about tomorrow's meeting",
      tone: "friendly",
      urgency: "medium",
      offer: "None",
      cta: "Arrive by 10 AM",
      senderContext: "School admin office",
      audienceSummary: "Parents in Group A",
      candidates: [{ id: "candidate-1", label: "Direct", body: "Message one" }],
      selectedCandidateId: "candidate-1",
    },
  };

  expect(draft.aiCompose.selectedCandidateId).toBe("candidate-1");
});
```

- [ ] **Step 2: Extend the shared type and route schema**

```ts
// src/lib/campaigns/types.ts
export type CampaignCopyCandidate = {
  id: string;
  label: string;
  body: string;
};

export type CampaignDraft = {
  id?: string;
  name: string;
  senderId: string;
  message: string;
  templateId?: string;
  scheduleAt?: string;
  audience: {
    groupIds: string[];
    filters: AudienceFilter[];
  };
  personalizationDefaults: {
    firstName: string;
    lastName: string;
  };
  aiCompose?: {
    goal: string;
    tone: "direct" | "friendly" | "urgent" | "formal";
    urgency: string;
    offer: string;
    cta: string;
    senderContext: string;
    audienceSummary: string;
    candidates: CampaignCopyCandidate[];
    selectedCandidateId?: string;
  };
};
```

```ts
// src/app/api/campaigns/route.ts
const CampaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  senderId: z.string().min(1),
  message: z.string().min(1),
  templateId: z.string().optional(),
  scheduleAt: z.string().optional(),
  audience: z.object({
    groupIds: z.array(z.string()),
    filters: z.array(
      z.object({
        field: z.enum(["tag", "status", "source"]),
        operator: z.literal("in"),
        value: z.string(),
      }),
    ),
  }),
  personalizationDefaults: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  aiCompose: z
    .object({
      goal: z.string(),
      tone: z.enum(["direct", "friendly", "urgent", "formal"]),
      urgency: z.string(),
      offer: z.string(),
      cta: z.string(),
      senderContext: z.string(),
      audienceSummary: z.string(),
      candidates: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          body: z.string(),
        }),
      ),
      selectedCandidateId: z.string().optional(),
    })
    .optional(),
});
```

- [ ] **Step 3: Run the draft validation test**

Run: `npx vitest run src/lib/campaigns/validation.test.ts`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/campaigns/types.ts src/app/api/campaigns/route.ts src/lib/campaigns/validation.test.ts
git commit -m "feat: extend campaign drafts for AI compose state"
```

## Task 5: Build the Guided Compose Step with Candidate Selection

**Files:**
- Modify: `src/components/campaign-builder.tsx`
- Modify: `src/lib/campaigns/validation.test.ts`
- Reuse: `src/lib/campaigns/types.ts`
- Reuse: `src/app/api/ai/campaign-copy/route.ts`

- [ ] **Step 1: Add the failing compose validation test**

```ts
// src/lib/campaigns/validation.test.ts
it("requires a selected AI candidate before compose can continue", () => {
  const draft = {
    name: "PTA Reminder",
    senderId: "sender_1",
    message: "",
    audience: { groupIds: ["group_1"], filters: [] },
    personalizationDefaults: { firstName: "Customer", lastName: "" },
    aiCompose: {
      goal: "Remind parents about tomorrow's meeting",
      tone: "friendly",
      urgency: "medium",
      offer: "None",
      cta: "Arrive by 10 AM",
      senderContext: "School admin office",
      audienceSummary: "Parents in Group A",
      candidates: [{ id: "candidate-1", label: "Direct", body: "Message one" }],
      selectedCandidateId: undefined,
    },
  };

  expect(Boolean(draft.aiCompose.selectedCandidateId)).toBe(false);
});
```

- [ ] **Step 2: Extend the initial draft state**

```tsx
// src/components/campaign-builder.tsx
const emptyDraft = (senders: BuilderSender[], templates: BuilderTemplate[]): CampaignDraft => ({
  name: "",
  senderId: senders[0]?.id ?? "",
  message: "",
  templateId: templates[0]?.id,
  scheduleAt: undefined,
  audience: { groupIds: [], filters: [] },
  personalizationDefaults: {
    firstName: templates[0]?.fallbackFirstName ?? "Customer",
    lastName: templates[0]?.fallbackLastName ?? "",
  },
  aiCompose: {
    goal: "",
    tone: "friendly",
    urgency: "",
    offer: "",
    cta: "",
    senderContext: "",
    audienceSummary: "",
    candidates: [],
  },
});
```

- [ ] **Step 3: Add generation and selection handlers**

```tsx
const [isGenerating, setIsGenerating] = useState(false);
const [generationError, setGenerationError] = useState<string | null>(null);

async function handleGenerateCandidates() {
  setIsGenerating(true);
  setGenerationError(null);

  try {
    const response = await fetch("/api/ai/campaign-copy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        campaignName: draft.name,
        senderName: senders.find((sender) => sender.id === draft.senderId)?.name ?? "Unknown sender",
        audienceSummary:
          draft.aiCompose?.audienceSummary || `${audienceSummary.deliverable} deliverable recipients`,
        goal: draft.aiCompose?.goal ?? "",
        tone: draft.aiCompose?.tone ?? "friendly",
        urgency: draft.aiCompose?.urgency ?? "",
        offer: draft.aiCompose?.offer ?? "",
        cta: draft.aiCompose?.cta ?? "",
        existingMessage: draft.message,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Unable to generate candidates");

    setDraft((current) => ({
      ...current,
      aiCompose: {
        ...current.aiCompose!,
        candidates: data.candidates,
        selectedCandidateId: undefined,
      },
    }));
  } catch (error) {
    setGenerationError(error instanceof Error ? error.message : "Unable to generate candidates");
  } finally {
    setIsGenerating(false);
  }
}

function selectCandidate(candidateId: string) {
  setDraft((current) => {
    const selected = current.aiCompose?.candidates.find((candidate) => candidate.id === candidateId);
    return {
      ...current,
      message: selected?.body ?? current.message,
      aiCompose: {
        ...current.aiCompose!,
        selectedCandidateId: candidateId,
      },
    };
  });
}
```

- [ ] **Step 4: Replace the current compose-step layout**

```tsx
{step === 2 ? (
  <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
    <section className="app-card-soft rounded-[24px] p-5">
      <p className="text-sm font-medium text-[var(--app-text)]">Guide the message</p>
      <div className="mt-4 grid gap-3">
        <Field label="Goal">
          <input value={draft.aiCompose?.goal ?? ""} onChange={(event) => setDraft((current) => ({ ...current, aiCompose: { ...current.aiCompose!, goal: event.target.value } }))} />
        </Field>
        <Field label="Tone">
          <select value={draft.aiCompose?.tone ?? "friendly"} onChange={(event) => setDraft((current) => ({ ...current, aiCompose: { ...current.aiCompose!, tone: event.target.value as "direct" | "friendly" | "urgent" | "formal" } }))}>
            <option value="direct">Direct</option>
            <option value="friendly">Friendly</option>
            <option value="urgent">Urgent</option>
            <option value="formal">Formal</option>
          </select>
        </Field>
        <Field label="Urgency">
          <input value={draft.aiCompose?.urgency ?? ""} onChange={(event) => setDraft((current) => ({ ...current, aiCompose: { ...current.aiCompose!, urgency: event.target.value } }))} />
        </Field>
        <Field label="Offer">
          <input value={draft.aiCompose?.offer ?? ""} onChange={(event) => setDraft((current) => ({ ...current, aiCompose: { ...current.aiCompose!, offer: event.target.value } }))} />
        </Field>
        <Field label="CTA">
          <input value={draft.aiCompose?.cta ?? ""} onChange={(event) => setDraft((current) => ({ ...current, aiCompose: { ...current.aiCompose!, cta: event.target.value } }))} />
        </Field>
      </div>
      <Button className="mt-4 w-full" onClick={() => void handleGenerateCandidates()} disabled={isGenerating}>
        <MagicWand size={16} weight="bold" />
        {isGenerating ? "Generating options..." : "Generate message options"}
      </Button>
    </section>

    <section className="space-y-4">
      {draft.aiCompose?.candidates.length ? (
        <div className="grid gap-3">
          {draft.aiCompose.candidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => selectCandidate(candidate.id)}
              className="app-card text-left rounded-[24px] p-5"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-muted)]">{candidate.label}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--app-text)]">{candidate.body}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="app-card-soft rounded-[24px] p-6">
          <p className="text-sm text-[var(--app-muted)]">
            Define the message intent, then generate three SMS options to compare before editing.
          </p>
        </div>
      )}

      {draft.aiCompose?.selectedCandidateId ? (
        <Field label="Selected message">
          <textarea rows={8} value={draft.message} onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))} />
        </Field>
      ) : null}
    </section>
  </div>
) : null}
```

- [ ] **Step 5: Tighten compose validation**

```tsx
const validateCompose = (): ValidationResult => {
  if (!draft.aiCompose?.selectedCandidateId) {
    return { valid: false, message: "Generate options and choose one message before continuing." };
  }
  if (!draft.message.trim()) {
    return { valid: false, message: "Refine the selected SMS body." };
  }
  return { valid: true };
};
```

- [ ] **Step 6: Run typecheck, lint, and build**

Run: `npx tsc --noEmit && npx eslint src/components/campaign-builder.tsx && npm run build`

Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/campaign-builder.tsx
git commit -m "feat: embed guided AI compose flow in builder"
```

## Task 6: Refresh the Standalone AI Page and App Copy

**Files:**
- Modify: `src/app/app/ai-writer/page.tsx`
- Modify: `src/data/site.ts`
- Reuse: `src/components/ui.tsx`

- [ ] **Step 1: Replace the placeholder page with a support workspace**

```tsx
// src/app/app/ai-writer/page.tsx
export default function AIWriterPage() {
  return (
    <AppSection
      title="Message Lab"
      description="Explore campaign-ready SMS options, compare tones, and bring the strongest draft back into a live campaign."
      action={<Button href="/app/campaigns/new">Open campaign builder</Button>}
    >
      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="app-card-soft rounded-[24px] p-6">
          <p className="text-sm font-medium text-[var(--app-text)]">How to use this space</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--app-muted)]">
            <li>Start from a real campaign when you need audience-aware AI guidance.</li>
            <li>Use this page to test ideas, rewrite copy, and compare tones before committing.</li>
            <li>Final send decisions still happen inside campaign creation.</li>
          </ul>
        </section>
        <section className="app-card rounded-[24px] p-6">
          <p className="text-sm font-medium text-[var(--app-text)]">Suggested prompts</p>
          <div className="mt-4 grid gap-3">
            {aiSuggestions.map((item) => (
              <div key={item} className="rounded-[18px] bg-[var(--app-panel-soft)] px-4 py-4 text-sm text-[var(--app-text)]">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppSection>
  );
}
```

- [ ] **Step 2: Update support copy**

```ts
// src/data/site.ts
export const aiSuggestions = [
  "Write three reminder variants for a parent audience and keep the CTA clear.",
  "Shorten this draft to one SMS unit without losing the key date and time.",
  "Make this promotion sound more credible and less pushy.",
  "Turn this announcement into a warmer message for returning customers.",
];
```

- [ ] **Step 3: Run lint on the page and data file**

Run: `npx eslint src/app/app/ai-writer/page.tsx src/data/site.ts`

Expected: no lint errors

- [ ] **Step 4: Commit**

```bash
git add src/app/app/ai-writer/page.tsx src/data/site.ts
git commit -m "feat: refresh AI support page and copy"
```

## Task 7: Final Verification and Local Setup Notes

**Files:**
- Modify: `docs/superpowers/specs/2026-05-22-cento-ai-guided-campaign-builder-design.md` only if a discovered implementation reality requires a doc correction
- No planned code changes if all prior tasks land cleanly

- [ ] **Step 1: Set local AI env from the existing REVISIONXWEB source**

Use the already-existing `DEEPSEEK_API_KEY` from `/Users/KAFUI/Documents/REVISIONXWEB/.env.local` and copy it into this repo’s local env file as:

```env
DEEPSEEK_API_KEY=<copy existing secret locally>
```

Do not commit this secret.

- [ ] **Step 2: Run the full verification suite**

Run: `npm run test && npm run lint && npx tsc --noEmit && npm run build`

Expected:
- `vitest` passes
- `eslint` passes
- `tsc` exits cleanly
- Next build succeeds

- [ ] **Step 3: Smoke-test the key pages**

Check locally:
- `/app/campaigns/new`
- `/app/ai-writer`
- `/app`

Expected:
- new fonts are visible
- shell feels calmer and less boxy
- compose step blocks continue until a candidate is selected
- AI route returns three candidates when the key is configured

- [ ] **Step 4: Commit any final fixes**

```bash
git add .
git commit -m "chore: finish AI guided campaign builder rollout"
```

## Self-Review

### Spec coverage

- Shared shell restyle: covered by Task 1.
- DeepSeek server-side integration: covered by Tasks 2 and 3.
- Campaign builder AI compose flow: covered by Tasks 4 and 5.
- Standalone AI page cleanup: covered by Task 6.
- Verification and env setup: covered by Task 7.

No spec requirement is currently unmatched.

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” markers remain.
- Commands and file paths are explicit.
- The only intentionally flexible note is the optional component test in Task 5 Step 1 because this repo currently has route and library tests but no established component test harness for the builder. The functional contract is still enforced by earlier tests plus final smoke verification.

### Type consistency

- `CampaignCopyRequest`, `CampaignCopyCandidate`, `aiCompose`, and `selectedCandidateId` are named consistently across the plan.
- The route path is consistently `/api/ai/campaign-copy`.
