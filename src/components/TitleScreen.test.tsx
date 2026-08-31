import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TitleScreen } from "./TitleScreen";

describe("TitleScreen", () => {
  it("shows Play and a register dialog you can close", () => {
    const html = renderToStaticMarkup(
      <TitleScreen user={null} onUserChange={() => undefined} onStart={() => undefined} />,
    );
    expect(html).toContain(">Play<");
    expect(html).toContain("Register");
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain("brand-logo");
    expect(html).toContain("Charlie Bishop");
    expect(html).toContain('href="/"');
    expect(html).toContain("All games");
    expect(html).not.toContain("Element group");
  });
});
