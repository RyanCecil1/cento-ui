import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignBuilder } from "./campaign-builder";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

describe("CampaignBuilder compose step", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            { id: "candidate-1", label: "Direct", body: "Message one" },
            { id: "candidate-2", label: "Friendly", body: "Message two" },
            { id: "candidate-3", label: "Urgent", body: "Message three" },
          ],
        }),
      }),
    );
  });

  it("requires candidate selection before the final message can be edited or continued", async () => {
    render(
      <CampaignBuilder
        senders={[{ id: "sender_1", name: "Cento", status: "approved" }]}
        templates={[
          {
            id: "template_1",
            name: "Blank",
            body: "",
            variables: [],
            fallbackFirstName: "Customer",
            fallbackLastName: "",
          },
        ]}
        groups={[]}
        contacts={[]}
        walletBalance={100}
        timezone="Africa/Accra"
      />,
    );

    fireEvent.change(screen.getByLabelText("Campaign name"), {
      target: { value: "PTA Reminder" },
    });
    fireEvent.click(screen.getByRole("button", { name: /compose/i }));
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

    const continueButton = screen.getByRole("button", { name: "Continue" });
    const finalMessage = screen.getByLabelText("Final message");

    expect(finalMessage).toBeDisabled();
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /choose direct/i }));

    await waitFor(() => {
      expect(finalMessage).toHaveValue("Message one");
    });

    expect(finalMessage).not.toBeDisabled();
    expect(continueButton).toBeEnabled();
  });
});
