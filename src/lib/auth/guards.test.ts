import { describe, expect, it } from "vitest";
import { assertWorkspaceAccess } from "./guards";

describe("assertWorkspaceAccess", () => {
  it("allows same-workspace access", () => {
    expect(() =>
      assertWorkspaceAccess({
        sessionWorkspaceId: "workspace-a",
        resourceWorkspaceId: "workspace-a",
      }),
    ).not.toThrow();
  });

  it("rejects cross-workspace access", () => {
    expect(() =>
      assertWorkspaceAccess({
        sessionWorkspaceId: "workspace-a",
        resourceWorkspaceId: "workspace-b",
      }),
    ).toThrow("Workspace access denied");
  });
});
