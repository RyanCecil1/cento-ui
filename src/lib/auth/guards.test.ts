import { describe, expect, it } from "vitest";
import { assertWorkspaceAccess } from "./guards";

describe("assertWorkspaceAccess", () => {
  it("rejects cross-workspace access", () => {
    expect(() =>
      assertWorkspaceAccess({
        sessionWorkspaceId: "workspace-a",
        resourceWorkspaceId: "workspace-b",
      }),
    ).toThrow("Workspace access denied");
  });
});
