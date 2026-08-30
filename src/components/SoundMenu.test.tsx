import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SoundMenu } from "./SoundMenu";

describe("SoundMenu", () => {
  it("opens a sound menu with voices and mute-all", () => {
    const closed = renderToStaticMarkup(<SoundMenu />);
    expect(closed).toContain('aria-label="Sound"');
    expect(closed).not.toContain("Mute all");

    const open = renderToStaticMarkup(<SoundMenu startOpen />);
    expect(open).toContain("Voices");
    expect(open).toContain("Sound effects");
    expect(open).toContain("Mute all");
  });
});
