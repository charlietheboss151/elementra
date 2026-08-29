import { useCallback, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { recordRound } from "./game/scoreboard";
import type { GameConfig, GameResult } from "./game/types";

const DEFAULT_CONFIG: GameConfig = {
  modeId: "find-element",
  elementSet: "all",
  timed: false,
};

type Screen =
  | { kind: "home" }
  | { kind: "play"; config: GameConfig; run: number }
  | { kind: "results"; result: GameResult; entryId: string };

function App() {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [screen, setScreen] = useState<Screen>({ kind: "home" });

  const goHome = useCallback(() => {
    setScreen({ kind: "home" });
  }, []);

  const start = useCallback((next = config) => {
    setScreen({ kind: "play", config: next, run: Date.now() });
  }, [config]);

  const finish = useCallback((result: GameResult) => {
    const entry = recordRound(result);
    setScreen({ kind: "results", result, entryId: entry.id });
  }, []);

  if (screen.kind === "play") {
    return (
      <GameScreen
        key={screen.run}
        config={screen.config}
        onComplete={finish}
        onQuit={goHome}
      />
    );
  }

  if (screen.kind === "results") {
    return (
      <ResultsScreen
        result={screen.result}
        entryId={screen.entryId}
        onReplay={() => start(screen.result.config)}
        onHome={goHome}
      />
    );
  }

  return (
    <HomeScreen
      config={config}
      onChange={setConfig}
      onPlay={() => start()}
    />
  );
}

export default App;
