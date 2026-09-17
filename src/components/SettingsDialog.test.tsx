import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SettingsDialog } from "./SettingsDialog";

const config = { modeId: "find-element", elementSet: "common" as const, timed: false };

describe("SettingsDialog", () => {
  it("shows sound, play, and display settings", () => {
    const html = renderToStaticMarkup(
      <SettingsDialog config={config} onChangeConfig={() => undefined} onClose={() => undefined} />,
    );
    expect(html).toContain("Settings");
    expect(html).toContain("Voices");
    expect(html).toContain("Sound effects");
    expect(html).toContain("Mute all");
    expect(html).toContain("Race the clock");
    expect(html).toContain("Show fps");
    expect(html).toContain("Still icons");
  });
});
