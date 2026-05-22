import { NextResponse } from "next/server";
import { z } from "zod";

import type { CampaignCopyCandidate, CampaignCopyTone } from "@/lib/ai/types";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import {
  CampaignDraftPersistenceError,
  campaignDraftPersistenceErrorCodes,
  createCampaignDraft,
  listCampaigns,
  updateCampaignDraft,
} from "@/lib/campaigns/repository";
import type {
  CampaignDraft,
  CampaignDraftAiComposeInputs,
  CampaignDraftAiComposeState,
} from "@/lib/campaigns/types";
import { hasValidSelectedCandidateId as hasMatchingSelectedCandidate } from "@/lib/campaigns/types";

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

export const CampaignSchema: z.ZodType<CampaignDraft> = z
  .object({
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
  })
  .superRefine((draft, context) => {
    if (!hasMatchingSelectedCandidate(draft.aiCompose)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["aiCompose", "selectedCandidateId"],
        message: "selectedCandidateId must match one of the saved AI candidates",
      });
    }
  });

const errorResponses = {
  unauthenticated: {
    status: 401,
    body: {
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      },
    },
  },
  invalidRequestPayload: {
    status: 400,
    body: {
      error: {
        code: "INVALID_REQUEST_PAYLOAD",
        message: "Invalid campaign draft payload",
      },
    },
  },
  createIdNotAllowed: {
    status: 409,
    body: {
      error: {
        code: "CAMPAIGN_DRAFT_ID_NOT_ALLOWED",
        message: "New campaign drafts cannot include an id",
      },
    },
  },
  updateIdRequired: {
    status: 400,
    body: {
      error: {
        code: "CAMPAIGN_DRAFT_ID_REQUIRED",
        message: "Campaign draft id is required for updates",
      },
    },
  },
  draftNotFound: {
    status: 404,
    body: {
      error: {
        code: campaignDraftPersistenceErrorCodes.notFound,
        message: "Campaign draft not found",
      },
    },
  },
  invalidAiComposeSelection: {
    status: 400,
    body: {
      error: {
        code: campaignDraftPersistenceErrorCodes.invalidAiComposeSelection,
        message: "Selected AI candidate must match a saved draft candidate",
      },
    },
  },
  internalError: {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to save campaign draft",
      },
    },
  },
} as const;

export async function GET() {
  const viewer = await getCurrentViewer();
  if (!viewer) return jsonError(errorResponses.unauthenticated);
  return NextResponse.json(await listCampaigns(viewer.workspace.id));
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return jsonError(errorResponses.unauthenticated);

  const payload = await parseRequestPayload(request);
  if (!payload.success) {
    return jsonError(errorResponses.invalidRequestPayload);
  }
  if (payload.data.id) {
    return jsonError(errorResponses.createIdNotAllowed);
  }

  try {
    const campaign = await createCampaignDraft(viewer.workspace.id, payload.data);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return jsonError(toErrorResponse(error));
  }
}

export async function PATCH(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return jsonError(errorResponses.unauthenticated);

  const payload = await parseRequestPayload(request);
  if (!payload.success) {
    return jsonError(errorResponses.invalidRequestPayload);
  }
  if (!payload.data.id) {
    return jsonError(errorResponses.updateIdRequired);
  }

  try {
    const campaign = await updateCampaignDraft(viewer.workspace.id, payload.data);
    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    return jsonError(toErrorResponse(error));
  }
}

async function parseRequestPayload(request: Request) {
  try {
    const body = await request.json();
    return CampaignSchema.safeParse(body) as
      | { success: true; data: CampaignDraft }
      | { success: false };
  } catch {
    return { success: false } as const;
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof CampaignDraftPersistenceError) {
    if (error.code === campaignDraftPersistenceErrorCodes.notFound) {
      return errorResponses.draftNotFound;
    }

    if (error.code === campaignDraftPersistenceErrorCodes.invalidAiComposeSelection) {
      return errorResponses.invalidAiComposeSelection;
    }
  }

  return errorResponses.internalError;
}

function jsonError(response: {
  status: number;
  body: {
    error: {
      code: string;
      message: string;
    };
  };
}) {
  return NextResponse.json(response.body, { status: response.status });
}
