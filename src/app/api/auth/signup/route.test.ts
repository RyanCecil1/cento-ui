// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/app-session", () => ({
  setSessionToken: vi.fn(async () => undefined),
}));

import { getDemoStore } from "@/lib/demo/store";
import { POST } from "./route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    const store = getDemoStore();
    store.users = store.users.filter((user) => user.email !== "owner@example.com");
  });

  it("rejects signup without workspace name and password", async () => {
    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "owner@example.com" }),
      headers: { "content-type": "application/json" },
    });

    await expect(POST(request)).rejects.toThrow();
  });
});

