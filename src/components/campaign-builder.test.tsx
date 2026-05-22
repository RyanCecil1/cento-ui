import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignBuilder } from "./campaign-builder";

const push = vi.fn();
const refresh = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

const defaultProps = {
  senders: [{ id: "sender_1", name: "Cento", status: "approved" as const }],
  templates: [
    {
      id: "template_1",
      name: "Blank",
      body: "",
      variables: [],
      fallbackFirstName: "Customer",
      fallbackLastName: "",
    },
  ],
  groups: [
    {
      id: "group_1",
      name: "Parents",
      description: "PTA contacts",
      memberCount: 1,
    },
  ],
  contacts: [
    {
      id: "contact_1",
      fullName: "Ada Mensah",
      firstName: "Ada",
      lastName: "Mensah",
      phoneE164: "+233200000001",
      source: "import",
      status: "active" as const,
      tags: ["parents"],
      isSuppressed: false,
      groupIds: ["group_1"],
      groupNames: ["Parents"],
    },
  ],
  walletBalance: 100,
};

function renderBuilder(timezone = "Africa/Accra") {
  render(<CampaignBuilder {...defaultProps} timezone={timezone} />);
}

function mockJsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  };
}

async function completeComposeFlow() {
  fireEvent.change(screen.getByLabelText("Campaign name"), {
    target: { value: "PTA Reminder" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("button", { name: /parents \(1\)/i }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));

  fireEvent.change(screen.getByLabelText("Goal"), {
    target: { value: "Remind parents about tomorrow's meeting" },
  });
  fireEvent.change(screen.getByLabelText("Urgency"), {
    target: { value: "Send this evening" },
  });
  fireEvent.change(screen.getByLabelText("Offer or announcement"), {
    target: { value: "PTA meeting at 10 AM" },
  });
  fireEvent.change(screen.getByLabelText("Call to action"), {
    target: { value: "Arrive by 9:45 AM" },
  });
  fireEvent.change(screen.getByLabelText("Sender context"), {
    target: { value: "School admin office" },
  });
  fireEvent.change(screen.getByLabelText("Audience summary"), {
    target: { value: "Parents in Group A" },
  });

  fireEvent.click(screen.getByRole("button", { name: /generate 3 options/i }));

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /choose direct/i })).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: /choose direct/i }));

  await waitFor(() => {
    expect(screen.getByLabelText("Final message")).toHaveValue("Message one");
  });
}

describe("CampaignBuilder hardening", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
  });

  it("only unlocks later step chips when the prior steps are valid", () => {
    renderBuilder();

    const audienceChip = screen.getByRole("button", { name: /audience/i });
    const previewChip = screen.getByRole("button", { name: /preview/i });

    expect(audienceChip).toBeDisabled();
    expect(previewChip).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Campaign name"), {
      target: { value: "PTA Reminder" },
    });

    expect(audienceChip).toBeEnabled();
    fireEvent.click(audienceChip);

    expect(screen.getByText("Select groups")).toBeInTheDocument();
    expect(previewChip).toBeDisabled();

    fireEvent.click(previewChip);

    expect(screen.getByText("Select groups")).toBeInTheDocument();
    expect(screen.queryByText("Matched contacts")).not.toBeInTheDocument();
  });

  it("requires candidate selection before the final message can be edited or continued", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({
        candidates: [
          { id: "candidate-1", label: "Direct", body: "Message one" },
          { id: "candidate-2", label: "Friendly", body: "Message two" },
          { id: "candidate-3", label: "Urgent", body: "Message three" },
        ],
      }),
    );

    renderBuilder();
    await completeComposeFlow();

    const continueButton = screen.getByRole("button", { name: "Continue" });
    const finalMessage = screen.getByLabelText("Final message");

    expect(finalMessage).not.toBeDisabled();
    expect(continueButton).toBeEnabled();
  });

  it("stores the scheduled send in the workspace timezone instead of browser local time", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJsonResponse({
          candidates: [
            { id: "candidate-1", label: "Direct", body: "Message one" },
            { id: "candidate-2", label: "Friendly", body: "Message two" },
            { id: "candidate-3", label: "Urgent", body: "Message three" },
          ],
        }),
      )
      .mockResolvedValueOnce(mockJsonResponse({ id: "campaign_1" }))
      .mockResolvedValueOnce(mockJsonResponse({ success: true }));

    renderBuilder("America/New_York");
    await completeComposeFlow();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const scheduleInput = screen.getByLabelText(/Schedule/);
    fireEvent.change(scheduleInput, {
      target: { value: "2026-06-15T07:30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /schedule campaign/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/app/campaigns/campaign_1");
    });

    const saveRequest = fetchMock.mock.calls[1]?.[1];
    const savedDraft = JSON.parse(String(saveRequest?.body));

    expect(savedDraft.scheduleAt).toBe("2026-06-15T11:30:00.000Z");
  });

  it("surfaces structured save errors from the campaigns route", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJsonResponse({
          candidates: [
            { id: "candidate-1", label: "Direct", body: "Message one" },
            { id: "candidate-2", label: "Friendly", body: "Message two" },
            { id: "candidate-3", label: "Urgent", body: "Message three" },
          ],
        }),
      )
      .mockResolvedValueOnce(
        mockJsonResponse(
          {
            error: {
              code: "INVALID_REQUEST_PAYLOAD",
              message: "Server says the campaign draft is invalid.",
            },
          },
          false,
        ),
      );

    renderBuilder();
    await completeComposeFlow();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /queue and send/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Server says the campaign draft is invalid."),
      ).toBeInTheDocument();
    });

    expect(push).not.toHaveBeenCalled();
  });

  it("blocks redirect and surfaces the immediate runner failure message", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJsonResponse({
          candidates: [
            { id: "candidate-1", label: "Direct", body: "Message one" },
            { id: "candidate-2", label: "Friendly", body: "Message two" },
            { id: "candidate-3", label: "Urgent", body: "Message three" },
          ],
        }),
      )
      .mockResolvedValueOnce(mockJsonResponse({ id: "campaign_1" }))
      .mockResolvedValueOnce(mockJsonResponse({ success: true }))
      .mockResolvedValueOnce(
        mockJsonResponse(
          {
            error: {
              code: "RUNNER_FAILED",
              message: "Runner could not start the immediate campaign.",
            },
          },
          false,
        ),
      );

    renderBuilder();
    await completeComposeFlow();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /queue and send/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Runner could not start the immediate campaign."),
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/internal/jobs/run-due-campaigns", {
      method: "POST",
    });
    expect(push).not.toHaveBeenCalled();
  });
});
