import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeScreen } from "./HomeScreen";

const config = { modeId: "find-element", elementSet: "common" as const, timed: false };

describe("HomeScreen", () => {
  it("shows mode logos and keeps element groups off the home screen", () => {
    const html = renderToStaticMarkup(
      <HomeScreen
        config={config}
        user={null}
        onChange={() => undefined}
        onPlay={() => undefined}
        onBack={() => undefined}
      />,
    );
    expect(html).toContain("mode-body-art");
    expect(html).toContain("Find by name");
    expect(html).toContain("Atomic number");
    expect(html).toContain("Symbol");
    expect(html).toContain("Property clues");
    expect(html).toContain("Type the name");
    expect(html).toContain("Mixed");
    expect(html).toContain("Choose a mode");
    expect(html).toContain("Settings");
    expect(html).toContain("Stats");
    expect(html).toContain("Periodic table");
    expect(html).toContain("How to Play");
    expect(html).not.toContain("Element group");
    expect(html).not.toContain("Start Find Element by Name");
    expect(html).not.toContain("Read the name, then click");
  });

  it("opens an element-group menu after a mode is chosen", () => {
    const html = renderToStaticMarkup(
      <HomeScreen
        config={config}
        user={null}
        onChange={() => undefined}
        onPlay={() => undefined}
        onBack={() => undefined}
        startPickingModeId="symbol"
      />,
    );
    expect(html).toContain("Element group");
    expect(html).toContain("Common elements");
    expect(html).toContain(">Start<");
    expect(html).toContain('aria-labelledby="group-menu-title"');
  });

  it("opens the complete periodic table from the nav button", () => {
    const html = renderToStaticMarkup(
      <HomeScreen
        config={config}
        user={null}
        onChange={() => undefined}
        onPlay={() => undefined}
        onBack={() => undefined}
        startTableOpen
      />,
    );
    expect(html).toContain("All 118 elements");
    expect(html).toContain("periodic-table--explorer");
    expect(html).toContain('aria-labelledby="table-dialog-title"');
  });
});
