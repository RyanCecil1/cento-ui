// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CampaignCopyError,
  campaignCopyErrorCodes,
  type CampaignCopyRequest,
} from "@/lib/ai/types";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/current-viewer", () => ({
  getCurrentViewer: vi.fn(),
}));
vi.mock("@/lib/ai/generate-campaign-copy", () => ({
  generateCampaignCopy: vi.fn(),
}));

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { generateCampaignCopy } from "@/lib/ai/generate-campaign-copy";
import { POST } from "./route";

const validPayload: CampaignCopyRequest = {
  campaignName: "PTA Reminder",
  senderName: "CentoSMS",
  audienceSummary: "Parents in Group A",
  goal: "Remind parents about tomorrow's meeting",
  tone: "friendly",
  urgency: "Meeting is tomorrow at 9 AM",
  offer: "Stay informed about your child's schedule",
  cta: "Reply YES to confirm attendance",
  existingMessage: "Please remember tomorrow's PTA meeting.",
};

describe("POST /api/ai/campaign-copy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the current viewer is missing", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      },
    });
  });

  it("returns 401 when the viewer exists but has no session token", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      user: { id: "user_123" },
      workspace: { id: "workspace_123" },
      token: "",
    } as Awaited<ReturnType<typeof getCurrentViewer>>);

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      },
    });
    expect(generateCampaignCopy).not.toHaveBeenCalled();
  });

  it("returns 400 when the request payload does not match the AI contract", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      user: { id: "user_123" },
      workspace: { id: "workspace_123" },
      token: "session_123",
    } as Awaited<ReturnType<typeof getCurrentViewer>>);

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          tone: "casual",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_REQUEST_PAYLOAD",
        message: "Invalid AI request payload",
      },
    });
    expect(generateCampaignCopy).not.toHaveBeenCalled();
  });

  it("returns 400 when the request body is malformed JSON", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      user: { id: "user_123" },
      workspace: { id: "workspace_123" },
      token: "session_123",
    } as Awaited<ReturnType<typeof getCurrentViewer>>);

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{\"campaignName\":",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_REQUEST_PAYLOAD",
        message: "Invalid AI request payload",
      },
    });
    expect(generateCampaignCopy).not.toHaveBeenCalled();
  });

  it("returns candidates when the request is valid", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      user: { id: "user_123" },
      workspace: { id: "workspace_123" },
      token: "session_123",
    } as Awaited<ReturnType<typeof getCurrentViewer>>);
    vi.mocked(generateCampaignCopy).mockResolvedValue([
      { id: "candidate-1", label: "Direct", body: "Message one" },
      { id: "candidate-2", label: "Friendly", body: "Message two" },
      { id: "candidate-3", label: "Urgent", body: "Message three" },
    ]);

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      candidates: [
        { id: "candidate-1", label: "Direct", body: "Message one" },
        { id: "candidate-2", label: "Friendly", body: "Message two" },
        { id: "candidate-3", label: "Urgent", body: "Message three" },
      ],
    });
    expect(generateCampaignCopy).toHaveBeenCalledWith(validPayload);
  });

  it("maps DeepSeek configuration failures to a stable 503 response", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      user: { id: "user_123" },
      workspace: { id: "workspace_123" },
      token: "session_123",
    } as Awaited<ReturnType<typeof getCurrentViewer>>);
    vi.mocked(generateCampaignCopy).mockRejectedValue(
      new CampaignCopyError(campaignCopyErrorCodes.notConfigured),
    );

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: campaignCopyErrorCodes.notConfigured,
        message: "AI is not configured for this environment",
      },
    });
  });

  it("maps malformed provider responses to a stable 502 response", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      user: { id: "user_123" },
      workspace: { id: "workspace_123" },
      token: "session_123",
    } as Awaited<ReturnType<typeof getCurrentViewer>>);
    vi.mocked(generateCampaignCopy).mockRejectedValue(
      new CampaignCopyError(campaignCopyErrorCodes.malformedProviderResponse),
    );

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: campaignCopyErrorCodes.malformedProviderResponse,
        message: "AI returned a malformed campaign copy response",
      },
    });
  });

  it("maps unexpected local failures to a stable internal error response", async () => {
    vi.mocked(getCurrentViewer).mockResolvedValue({
      user: { id: "user_123" },
      workspace: { id: "workspace_123" },
      token: "session_123",
    } as Awaited<ReturnType<typeof getCurrentViewer>>);
    vi.mocked(generateCampaignCopy).mockRejectedValue(new Error("boom"));

    const response = await POST(
      new Request("http://localhost/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to generate campaign copy",
      },
    });
  });
});
