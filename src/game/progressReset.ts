import type { ScoreboardStore } from "./scoreboard";

export const PROGRESS_RESET_FLAG = "elementra-progress-reset-v1";

export function clearAllProgress(store: ScoreboardStore) {
  const names = store.keys?.() ?? [];
  for (const key of names) {
    if (key.startsWith("elementra-scoreboard-") || key.startsWith("elementra-elements-")) {
      store.removeItem?.(key);
    }
  }
}

export function applyProgressResetOnce(store: ScoreboardStore): boolean {
  if (store.getItem(PROGRESS_RESET_FLAG)) return false;
  clearAllProgress(store);
  store.setItem(PROGRESS_RESET_FLAG, "1");
  return true;
}
