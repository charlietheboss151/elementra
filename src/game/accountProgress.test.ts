import { describe, expect, it } from "vitest";
import {
  emptyProgress,
  mergeElementStats,
  mergeProgress,
  mergeScoreboards,
  sanitizeProgress,
} from "./accountProgress";
import type { ScoreboardEntry } from "./scoreboard";

const hydrogen = {
  id: "h-1",
  at: 20,
  modeId: "find-element",
  elementSet: "all" as const,
  timed: false,
  accuracy: 100,
  elapsedMs: 800,
  correct: 1,
  total: 1,
  score: 3,
  incomplete: false,
};

const helium = {
  id: "he-1",
  at: 10,
  modeId: "symbol",
  elementSet: "common" as const,
  timed: true,
  accuracy: 50,
  elapsedMs: 2000,
  correct: 1,
  total: 2,
  score: 1,
  incomplete: false,
};

describe("accountProgress", () => {
  it("unions scoreboard rows by id and keeps the newest first", () => {
    const merged = mergeScoreboards([hydrogen], [helium, { ...hydrogen, accuracy: 0 }]);
    expect(merged.map((row: ScoreboardEntry) => row.id)).toEqual(["h-1", "he-1"]);
    expect(merged[0]?.accuracy).toBe(100);
  });

  it("keeps the higher count for each element rank field", () => {
    expect(
      mergeElementStats({ 1: { first: 2, second: 0, third: 1, miss: 0 } }, { 1: { first: 1, second: 4, third: 0, miss: 3 }, 8: { first: 0, second: 0, third: 0, miss: 2 } }),
    ).toEqual({
      1: { first: 2, second: 4, third: 1, miss: 3 },
      8: { first: 0, second: 0, third: 0, miss: 2 },
    });
  });

  it("prefers local setup when merging progress", () => {
    const localSetup = { modeId: "symbol", elementSet: "common" as const, timed: true };
    const remoteSetup = { modeId: "find-element", elementSet: "all" as const, timed: false };
    expect(mergeProgress({ ...emptyProgress(), setup: localSetup }, { ...emptyProgress(), setup: remoteSetup }).setup).toEqual(
      localSetup,
    );
    expect(mergeProgress(emptyProgress(), { ...emptyProgress(), setup: remoteSetup }).setup).toEqual(remoteSetup);
  });

  it("drops junk progress from the server", () => {
    const cleaned = sanitizeProgress({
      scoreboard: [{ id: "bad" }, hydrogen],
      elementStats: { "1": { first: 3, second: 0, third: 0, miss: 1 }, nope: { first: 1 } },
      setup: { modeId: "find-element", elementSet: "all", timed: false },
    });
    expect(cleaned.scoreboard).toEqual([hydrogen]);
    expect(cleaned.elementStats).toEqual({ 1: { first: 3, second: 0, third: 0, miss: 1 } });
    expect(cleaned.setup).toEqual({ modeId: "find-element", elementSet: "all", timed: false });
  });
});
