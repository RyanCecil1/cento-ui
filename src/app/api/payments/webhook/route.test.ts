// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getDemoStore } from "@/lib/demo/store";
import { POST } from "./route";

describe("POST /api/payments/webhook", () => {
  beforeEach(() => {
    const store = getDemoStore();
    store.paymentEvents = [];
    store.topUpOrders = [
      {
        id: "topup_123",
        workspaceId: "workspace_demo",
        creditsPurchased: 8000,
        amountGhs: 420,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  it("ignores duplicate payment confirmation events", async () => {
    const body = {
      eventId: "evt_123",
      topUpOrderId: "topup_123",
      creditsPurchased: 8000,
      status: "confirmed" as const,
    };

    const first = await POST(
      new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

    const second = await POST(
      new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });
});

