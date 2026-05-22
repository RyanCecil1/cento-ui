import { NextResponse } from "next/server";
import { z } from "zod";

import type { CampaignCopyCandidate, CampaignCopyTone } from "@/lib/ai/types";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import type {
  CampaignDraft,
  CampaignDraftAiComposeInputs,
  CampaignDraftAiComposeState,
} from "@/lib/campaigns/types";
import { listCampaigns, saveCampaignDraft } from "@/lib/campaigns/repository";

const campaignCopyToneValues = [
  "direct",
  "friendly",
  "urgent",
  "formal",
] as const satisfies readonly CampaignCopyTone[];

const CampaignCopyCandidateSchema: z.ZodType<CampaignCopyCandidate> = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  body: z.string().min(1),
});

const CampaignAiComposeInputsSchema: z.ZodType<CampaignDraftAiComposeInputs> = z.object({
  audienceSummary: z.string(),
  goal: z.string(),
  tone: z.enum(campaignCopyToneValues),
  urgency: z.string(),
  offer: z.string(),
  cta: z.string(),
  senderContext: z.string(),
});

const CampaignAiComposeStateSchema: z.ZodType<CampaignDraftAiComposeState> = z.object({
  inputs: CampaignAiComposeInputsSchema,
  candidates: z.array(CampaignCopyCandidateSchema),
  selectedCandidateId: z.string().min(1).optional(),
});

export const CampaignSchema: z.ZodType<CampaignDraft> = z.object({
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
  aiCompose: CampaignAiComposeStateSchema.optional(),
});

export async function GET() {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json(await listCampaigns(viewer.workspace.id));
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const payload = CampaignSchema.parse(await request.json());
  return NextResponse.json(await saveCampaignDraft(viewer.workspace.id, payload), { status: 201 });
}

export async function PATCH(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const payload = CampaignSchema.parse(await request.json());
  return NextResponse.json(await saveCampaignDraft(viewer.workspace.id, payload), { status: 200 });
}
