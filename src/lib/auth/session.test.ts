// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createRequestSupabaseAuthClient, getUser } = vi.hoisted(() => {
  const mockedGetUser = vi.fn();
  const mockedCreateRequestSupabaseAuthClient = vi.fn(() => ({
    auth: {
      getUser: mockedGetUser,
    },
  }));

  return {
    createRequestSupabaseAuthClient: mockedCreateRequestSupabaseAuthClient,
    getUser: mockedGetUser,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createRequestSupabaseAuthClient,
}));

import { requireOwnerSession } from "./session";

describe("requireOwnerSession", () => {
  beforeEach(() => {
    getUser.mockReset();
    createRequestSupabaseAuthClient.mockClear();
  });

  it("rejects missing access tokens before calling Supabase", async () => {
    await expect(requireOwnerSession("   ")).rejects.toThrow("Authentication required");
    expect(createRequestSupabaseAuthClient).not.toHaveBeenCalled();
  });

  it("returns the current request user for a valid access token", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "owner-user-id",
        },
      },
    });

    await expect(requireOwnerSession("access-token")).resolves.toEqual({
      userId: "owner-user-id",
    });

    expect(createRequestSupabaseAuthClient).toHaveBeenCalledWith("access-token");
  });
});
