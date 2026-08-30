import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TitleScreen } from "./TitleScreen";

describe("TitleScreen", () => {
  it("shows the logo and a Start button", () => {
    const html = renderToStaticMarkup(<TitleScreen onStart={() => undefined} />);
    expect(html).toContain("Start");
    expect(html).toContain("brand-logo");
    expect(html).toContain("Charlie Bishop");
    expect(html).not.toContain("Element group");
  });
});
