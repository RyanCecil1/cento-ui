import { describe, expect, it } from "vitest";
import { resolveAudience } from "./filters";

describe("resolveAudience", () => {
  it("drops invalid, duplicate, and suppressed recipients", () => {
    const result = resolveAudience([
      { id: "1", phoneE164: "+233241111111", isSuppressed: false, isDuplicate: false, isValid: true },
      { id: "2", phoneE164: "+233241111111", isSuppressed: false, isDuplicate: true, isValid: true },
      { id: "3", phoneE164: "+233241222222", isSuppressed: true, isDuplicate: false, isValid: true },
    ]);

    expect(result.deliverable).toHaveLength(1);
    expect(result.summary).toEqual({
      deliverable: 1,
      duplicates: 1,
      suppressed: 1,
      invalid: 0,
    });
  });
});

