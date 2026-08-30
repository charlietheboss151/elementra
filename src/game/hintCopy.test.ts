import { describe, expect, it } from "vitest";
import { hintButtonText, hintTip } from "./hintCopy";

describe("hintCopy", () => {
  it("explains period then family on the full table, and period-only on a family group", () => {
    expect(hintButtonText(null, "all")).toBe("Hint");
    expect(hintTip(null, "all")).toContain("period");
    expect(hintTip(null, "all")).toContain("family");
    expect(hintButtonText("period", "all")).toBe("Hint again");
    expect(hintTip("period", "all")).toContain("again");
    expect(hintButtonText("category", "all")).toBe("Hint used");

    expect(hintTip(null, "transition-metal")).toContain("period");
    expect(hintTip(null, "transition-metal")).not.toContain("family");
    expect(hintButtonText("period", "transition-metal")).toBe("Hint used");
  });
});
