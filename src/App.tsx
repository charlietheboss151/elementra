import { useCallback, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import type { GameConfig, GameResult } from "./game/types";

const DEFAULT_CONFIG: GameConfig = {
  modeId: "find-element",
  difficulty: "easy",
  questionCount: 10,
  timed: false,
};

type Screen =
  | { kind: "home" }
  | { kind: "play"; config: GameConfig; run: number }
  | { kind: "results"; result: GameResult };

function App() {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [screen, setScreen] = useState<Screen>({ kind: "home" });

  const start = useCallback(
    (next = config) => {
      setScreen({ kind: "play", config: next, run: Date.now() });
    },
    [config],
  );

  if (screen.kind === "play") {
    return (
      <GameScreen
        key={screen.run}
        config={screen.config}
        onComplete={(result) => setScreen({ kind: "results", result })}
        onQuit={() => setScreen({ kind: "home" })}
      />
    );
  }

  if (screen.kind === "results") {
    return (
      <ResultsScreen
        result={screen.result}
        onReplay={() => start(screen.result.config)}
        onHome={() => setScreen({ kind: "home" })}
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
