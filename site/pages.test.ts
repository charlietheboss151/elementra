import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("site pages", () => {
  it("links Elementra and Cosmica from the hub", () => {
    const hub = readFileSync(resolve(root, "index.html"), "utf8");
    expect(hub).toContain('href="/elementra/"');
    expect(hub).toContain('href="/cosmica/"');
    expect(hub).toContain("cosmica-logo.png");
    expect(hub).not.toContain("Coming soon");
    expect(hub).not.toContain('id="root"');
  });

  it("keeps the Elementra app on the /elementra/ entry", () => {
    const game = readFileSync(resolve(root, "elementra/index.html"), "utf8");
    expect(game).toContain('id="root"');
    expect(game).toContain("/src/main.tsx");
  });
});
