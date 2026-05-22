// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import {
  CampaignDraftPersistenceError,
  campaignDraftPersistenceErrorCodes,
  createCampaignDraft,
  updateCampaignDraft,
} from "@/lib/campaigns/repository";
import { PATCH, POST } from "./route";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/current-viewer", () => ({
  getCurrentViewer: vi.fn(),
}));
vi.mock("@/lib/campaigns/repository", async () => {
  const actual = await vi.importActual<typeof import("@/lib/campaigns/repository")>(
    "@/lib/campaigns/repository",
  );

  return {
    ...actual,
    listCampaigns: vi.fn(),
    createCampaignDraft: vi.fn(),
    updateCampaignDraft: vi.fn(),
  };
});

const validPayload = {
  name: "PTA Reminder",
  senderId: "sender_1",
  message: "Parents, the meeting starts at 10 AM tomorrow.",
  audience: { groupIds: ["group_1"], filters: [] },
  personalizationDefaults: { firstName: "Customer", lastName: "" },
  aiCompose: {
    inputs: {
      goal: "Remind parents about tomorrow's meeting",
      tone: "friendly" as const,
      urgency: "medium",
      offer: "None",
      cta: "Arrive by 10 AM",
      senderContext: "School admin office",
      audienceSummary: "Parents in Group A",
    },
    candidates: [{ id: "candidate-1", label: "Direct", body: "Message one" }],
    selectedCandidateId: "candidate-1",
  },
};

describe("campaign draft route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects POST requests that include an id", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      workspace: { id: "workspace_1" },
    } as Awaited<ReturnType<typeof getCurrentViewer>>);

    const response = await POST(
      new Request("http://localhost/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...validPayload, id: "campaign_1" }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "CAMPAIGN_DRAFT_ID_NOT_ALLOWED",
        message: "New campaign drafts cannot include an id",
      },
    });
    expect(createCampaignDraft).not.toHaveBeenCalled();
  });

  it("rejects PATCH requests without an id", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      workspace: { id: "workspace_1" },
    } as Awaited<ReturnType<typeof getCurrentViewer>>);

    const response = await PATCH(
      new Request("http://localhost/api/campaigns", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "CAMPAIGN_DRAFT_ID_REQUIRED",
        message: "Campaign draft id is required for updates",
      },
    });
    expect(updateCampaignDraft).not.toHaveBeenCalled();
  });

  it("rejects invalid selectedCandidateId values", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      workspace: { id: "workspace_1" },
    } as Awaited<ReturnType<typeof getCurrentViewer>>);

    const response = await POST(
      new Request("http://localhost/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          aiCompose: {
            ...validPayload.aiCompose,
            selectedCandidateId: "candidate-9",
          },
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_REQUEST_PAYLOAD",
        message: "Invalid campaign draft payload",
      },
    });
    expect(createCampaignDraft).not.toHaveBeenCalled();
  });

  it("returns 404 when PATCH targets a missing draft id", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      workspace: { id: "workspace_1" },
    } as Awaited<ReturnType<typeof getCurrentViewer>>);
    vi.mocked(updateCampaignDraft).mockRejectedValue(
      new CampaignDraftPersistenceError(campaignDraftPersistenceErrorCodes.notFound),
    );

    const response = await PATCH(
      new Request("http://localhost/api/campaigns", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...validPayload, id: "campaign_missing" }),
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: campaignDraftPersistenceErrorCodes.notFound,
        message: "Campaign draft not found",
      },
    });
  });
});
