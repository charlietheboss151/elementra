import { useCallback, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { PerfHud } from "./components/PerfHud";
import { ResultsScreen } from "./components/ResultsScreen";
import { TitleScreen } from "./components/TitleScreen";
import { recordRound } from "./game/scoreboard";
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

  const goTitle = useCallback(() => {
    setScreen({ kind: "title" });
  }, []);

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

  let body = <TitleScreen onStart={goHome} />;
  if (screen.kind === "home") {
    body = (
      <HomeScreen
        config={config}
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
        onQuit={goHome}
      />
    );
  } else if (screen.kind === "results") {
    body = (
      <ResultsScreen
        result={screen.result}
        entryId={screen.entryId}
        onReplay={() => start(screen.result.config)}
        onHome={goHome}
      />
    );
  }

  return (
    <>
      <PerfHud />
      {body}
    </>
  );
}

export default App;
