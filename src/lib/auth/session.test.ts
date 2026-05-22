// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createRequestSupabaseAuthClient, createServerSupabaseClient, getUser, from, select, eq, single } = vi.hoisted(() => {
  const mockedGetUser = vi.fn();
  const mockedCreateRequestSupabaseAuthClient = vi.fn(() => ({
    auth: {
      getUser: mockedGetUser,
    },
  }));
  const mockedSingle = vi.fn();
  const mockedEq = vi.fn(() => ({
    single: mockedSingle,
  }));
  const mockedSelect = vi.fn(() => ({
    eq: mockedEq,
  }));
  const mockedFrom = vi.fn(() => ({
    select: mockedSelect,
  }));
  const mockedCreateServerSupabaseClient = vi.fn(() => ({
    from: mockedFrom,
  }));

  return {
    createRequestSupabaseAuthClient: mockedCreateRequestSupabaseAuthClient,
    createServerSupabaseClient: mockedCreateServerSupabaseClient,
    getUser: mockedGetUser,
    from: mockedFrom,
    select: mockedSelect,
    eq: mockedEq,
    single: mockedSingle,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createRequestSupabaseAuthClient,
  createServerSupabaseClient,
}));

import { requireOwnerSession, requireOwnerWorkspaceContext } from "./session";

describe("requireOwnerSession", () => {
  beforeEach(() => {
    getUser.mockReset();
    createRequestSupabaseAuthClient.mockClear();
    createServerSupabaseClient.mockClear();
    from.mockClear();
    select.mockClear();
    eq.mockClear();
    single.mockReset();
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

  it("returns the owned workspace context for a valid access token", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "owner-user-id",
        },
      },
    });
    single.mockResolvedValue({
      data: {
        id: "workspace-id",
        verification_status: "verified",
      },
      error: null,
    });

    await expect(requireOwnerWorkspaceContext("access-token")).resolves.toEqual({
      userId: "owner-user-id",
      workspaceId: "workspace-id",
      verificationStatus: "verified",
    });

    expect(createServerSupabaseClient).toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith("workspaces");
  });
});
