import { useCallback, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { PerfHud } from "./components/PerfHud";
import { SoundMenu } from "./components/SoundMenu";
import { ResultsScreen } from "./components/ResultsScreen";
import { TitleScreen } from "./components/TitleScreen";
import { currentUser } from "./game/auth";
import { applyRoundToStats } from "./game/elementStats";
import { applyProgressResetOnce } from "./game/progressReset";
import { defaultStore, recordRound } from "./game/scoreboard";
import type { GameConfig, GameResult } from "./game/types";

const DEFAULT_CONFIG: GameConfig = {
  modeId: "find-element",
  elementSet: "all",
  timed: false,
};

type Screen =
  | { kind: "title" }
  | { kind: "home" }
  | { kind: "play"; config: GameConfig; run: number }
  | { kind: "results"; result: GameResult; entryId: string };

function App() {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [screen, setScreen] = useState<Screen>({ kind: "title" });
  const [user, setUser] = useState<string | null>(() => {
    const store = defaultStore();
    applyProgressResetOnce(store);
    return currentUser(store);
  });

  const start = useCallback((next = config) => {
    setScreen({ kind: "play", config: next, run: Date.now() });
  }, [config]);

  const goTitle = useCallback(() => {
    setScreen({ kind: "title" });
  }, []);

  const goHome = useCallback(() => {
    setScreen({ kind: "home" });
  }, []);

  const saveRun = useCallback((result: GameResult) => {
    const who = currentUser(defaultStore());
    const entry = recordRound(result, defaultStore(), Date.now(), who);
    applyRoundToStats({}, result, defaultStore(), who);
    return entry;
  }, []);

  const finish = useCallback((result: GameResult) => {
    const entry = saveRun(result);
    setScreen({ kind: "results", result, entryId: entry.id });
  }, [saveRun]);

  const quitPlay = useCallback((result: GameResult) => {
    saveRun(result);
    goHome();
  }, [goHome, saveRun]);

  let body = (
    <TitleScreen user={user} onUserChange={setUser} onStart={goHome} />
  );
  if (screen.kind === "home") {
    body = (
      <HomeScreen
        config={config}
        user={user}
        onChange={setConfig}
        onPlay={() => start()}
        onBack={goTitle}
      />
    );
  } else if (screen.kind === "play") {
    body = (
      <GameScreen
        key={screen.run}
        config={screen.config}
        onComplete={finish}
        onQuit={quitPlay}
      />
    );
  } else if (screen.kind === "results") {
    body = (
      <ResultsScreen
        result={screen.result}
        entryId={screen.entryId}
        user={user}
        onReplay={() => start(screen.result.config)}
        onHome={goHome}
      />
    );
  }

  return (
    <>
      <SoundMenu />
      <PerfHud />
      {body}
    </>
  );
}

export default App;
