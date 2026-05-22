import { NextResponse } from "next/server";
import { z } from "zod";

import { generateCampaignCopy } from "@/lib/ai/generate-campaign-copy";
import {
  CampaignCopyError,
  campaignCopyErrorCodes,
  type CampaignCopyRequest,
} from "@/lib/ai/types";
import { getCurrentViewer } from "@/lib/auth/current-viewer";

const CampaignCopyRequestSchema = z.object({
  campaignName: z.string().trim().min(1),
  senderName: z.string().trim().min(1),
  audienceSummary: z.string().trim().min(1),
  goal: z.string().trim().min(1),
  tone: z.enum(["direct", "friendly", "urgent", "formal"]),
  urgency: z.string().trim().min(1),
  offer: z.string().trim().min(1),
  cta: z.string().trim().min(1),
  existingMessage: z.string().trim().min(1).optional(),
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
        message: "Invalid AI request payload",
      },
    },
  },
  [campaignCopyErrorCodes.notConfigured]: {
    status: 503,
    body: {
      error: {
        code: campaignCopyErrorCodes.notConfigured,
        message: "AI is not configured for this environment",
      },
    },
  },
  [campaignCopyErrorCodes.invalidProviderPayload]: {
    status: 502,
    body: {
      error: {
        code: campaignCopyErrorCodes.invalidProviderPayload,
        message: "AI returned an invalid campaign copy payload",
      },
    },
  },
  [campaignCopyErrorCodes.malformedProviderResponse]: {
    status: 502,
    body: {
      error: {
        code: campaignCopyErrorCodes.malformedProviderResponse,
        message: "AI returned a malformed campaign copy response",
      },
    },
  },
  [campaignCopyErrorCodes.upstreamTimeout]: {
    status: 504,
    body: {
      error: {
        code: campaignCopyErrorCodes.upstreamTimeout,
        message: "AI request timed out",
      },
    },
  },
  [campaignCopyErrorCodes.upstreamHttpError]: {
    status: 502,
    body: {
      error: {
        code: campaignCopyErrorCodes.upstreamHttpError,
        message: "AI request failed upstream",
      },
    },
  },
} as const;

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return jsonError(errorResponses.unauthenticated);
  }

  const payload = await parseRequestPayload(request);
  if (!payload.success) {
    return jsonError(errorResponses.invalidRequestPayload);
  }

  try {
    const candidates = await generateCampaignCopy(payload.data);

    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    return jsonError(toErrorResponse(error));
  }
}

async function parseRequestPayload(request: Request) {
  try {
    const body = await request.json();
    return CampaignCopyRequestSchema.safeParse(body) as
      | { success: true; data: CampaignCopyRequest }
      | { success: false };
  } catch {
    return { success: false } as const;
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof CampaignCopyError) {
    return errorResponses[error.code];
  }

  return errorResponses[campaignCopyErrorCodes.upstreamHttpError];
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
