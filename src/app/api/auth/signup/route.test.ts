// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  createUserMock,
  deleteUserMock,
  listUsersMock,
  updateUserByIdMock,
  insertMock,
  signInWithPasswordMock,
  setSessionTokenMock,
} = vi.hoisted(() => ({
  createUserMock: vi.fn(),
  deleteUserMock: vi.fn(),
  listUsersMock: vi.fn(),
  updateUserByIdMock: vi.fn(),
  insertMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  setSessionTokenMock: vi.fn(),
}));

vi.mock("@/lib/auth/app-session", () => ({
  setSessionToken: setSessionTokenMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: listUsersMock,
        createUser: createUserMock,
        deleteUser: deleteUserMock,
        updateUserById: updateUserByIdMock,
      },
    },
    from(table: string) {
      if (table !== "workspaces") {
        throw new Error(`Unhandled table ${table}`);
      }

      return {
        insert: insertMock,
      };
    },
  })),
  createRequestSupabaseAuthClient: vi.fn(() => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  })),
}));

import { POST } from "./route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    createUserMock.mockReset();
    deleteUserMock.mockReset();
    listUsersMock.mockReset();
    updateUserByIdMock.mockReset();
    insertMock.mockReset();
    signInWithPasswordMock.mockReset();
    setSessionTokenMock.mockReset();

    listUsersMock.mockResolvedValue({ data: { users: [] } });
    createUserMock.mockResolvedValue({
      data: { user: { id: "user_123", email: "owner@example.com" } },
      error: null,
    });
    updateUserByIdMock.mockResolvedValue({ data: {}, error: null });
    signInWithPasswordMock.mockResolvedValue({
      data: { session: { access_token: "token_123" } },
      error: null,
    });

    let insertCallCount = 0;
    insertMock.mockImplementation(() => {
      insertCallCount += 1;

      if (insertCallCount === 1) {
        return { error: { message: "column primary_audience does not exist" } };
      }

      return { error: null };
    });
  });

  it("rejects invalid signup payloads", async () => {
    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "owner@example.com" }),
      headers: { "content-type": "application/json" },
    });

    await expect(POST(request)).rejects.toThrow();
  });

  it("falls back when the workspace profile columns are not present yet", async () => {
    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "owner@example.com",
        password: "strong-pass-123",
        workspaceName: "GraceHub",
        fullName: "Grace Hub Owner",
        phoneNumber: "+233200000001",
        primaryAudience: "Church members",
        useCase: "Service reminders",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ next: "/app" });
    expect(insertMock).toHaveBeenCalledTimes(2);
    expect(createUserMock).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "strong-pass-123",
      email_confirm: true,
      user_metadata: {
        full_name: "Grace Hub Owner",
        phone_number: "+233200000001",
      },
    });
    expect(updateUserByIdMock).toHaveBeenCalledWith("user_123", {
      user_metadata: {
        full_name: "Grace Hub Owner",
        phone_number: "+233200000001",
        workspace_profile: {
          primaryAudience: "Church members",
          useCase: "Service reminders",
          senderMode: "shared",
        },
      },
    });
    expect(setSessionTokenMock).toHaveBeenCalledWith("token_123");
  });
});
