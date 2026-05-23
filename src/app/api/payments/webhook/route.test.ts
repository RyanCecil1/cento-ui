// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { applyWalletCredit } = vi.hoisted(() => ({
  applyWalletCredit: vi.fn(),
}));

const paymentEvents = [
  {
    id: "topup_123",
    workspace_id: "workspace_demo",
    payment_reference: "ref_123",
    metadata: {},
  },
];
const seenProviderEvents = new Set<string>();

vi.mock("@/lib/wallet/repository", () => ({
  applyWalletCredit,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => ({
    from(table: string) {
      if (table !== "payment_events") {
        throw new Error(`Unhandled table ${table}`);
      }

      return {
        select() {
          return {
            eq(_field: string, _value: string) {
              return {
                eq(_field2: string, providerEventId: string) {
                  return {
                    maybeSingle: async () => ({
                      data: seenProviderEvents.has(providerEventId) ? { id: providerEventId } : null,
                    }),
                  };
                },
                maybeSingle: async () => ({
                  data: paymentEvents.find((event) => event.id === _value) ?? null,
                  error: null,
                }),
              };
            },
          };
        },
        update() {
          return {
            eq: async () => ({ error: null }),
          };
        },
      };
    },
  })),
}));

import { POST } from "./route";

describe("POST /api/payments/webhook", () => {
  beforeEach(() => {
    seenProviderEvents.clear();
    applyWalletCredit.mockReset();
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

    seenProviderEvents.add("evt_123");

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
