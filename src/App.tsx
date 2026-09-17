import { useCallback, useEffect, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { PerfHud } from "./components/PerfHud";
import { ResultsScreen } from "./components/ResultsScreen";
import { SettingsDialog } from "./components/SettingsDialog";
import { TitleScreen } from "./components/TitleScreen";
import { currentUser, syncAccount } from "./game/auth";
import { applyRoundToStats } from "./game/elementStats";
import { applyProgressResetOnce } from "./game/progressReset";
import { defaultStore, recordRound } from "./game/scoreboard";
import { loadSetup, saveSetup } from "./game/setupPrefs";
import { applyUiPrefs, loadUiPrefs } from "./game/uiPrefs";
import type { GameConfig, GameResult } from "./game/types";
import { playUi } from "./audio/sounds";

type Screen =
  | { kind: "title" }
  | { kind: "home" }
  | { kind: "play"; config: GameConfig; run: number }
  | { kind: "results"; result: GameResult; entryId: string };

function App() {
  const [user, setUser] = useState<string | null>(() => {
    const store = defaultStore();
    applyProgressResetOnce(store);
    return currentUser(store);
  });
  const [config, setConfig] = useState<GameConfig>(() =>
    loadSetup(defaultStore(), currentUser(defaultStore())),
  );
  const [screen, setScreen] = useState<Screen>({ kind: "title" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showPerfHud, setShowPerfHud] = useState(() => loadUiPrefs().showPerfHud);

  useEffect(() => {
    applyUiPrefs(loadUiPrefs());
  }, []);

  useEffect(() => {
    const store = defaultStore();
    void syncAccount(store).then((ok) => {
      if (!ok) return;
      const who = currentUser(store);
      if (who) setConfig(loadSetup(store, who));
    });
  }, []);

  const changeUser = useCallback((next: string | null) => {
    setUser(next);
    setConfig(loadSetup(defaultStore(), next));
  }, []);

  const changeConfig = useCallback(
    (next: GameConfig) => {
      saveSetup(next, defaultStore(), user);
      setConfig(next);
      void syncAccount(defaultStore());
    },
    [user],
  );

  const start = useCallback((next = config) => {
    setScreen({ kind: "play", config: next, run: Date.now() });
  }, [config]);

  const goTitle = useCallback(() => {
    setScreen({ kind: "title" });
  }, []);

  const goHome = useCallback(() => {
    setScreen({ kind: "home" });
  }, []);

  const openSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    playUi();
    setSettingsOpen(false);
    setShowPerfHud(loadUiPrefs().showPerfHud);
  }, []);

  const saveRun = useCallback((result: GameResult) => {
    const who = currentUser(defaultStore());
    const entry = recordRound(result, defaultStore(), Date.now(), who);
    applyRoundToStats({}, result, defaultStore(), who);
    void syncAccount(defaultStore());
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
    <TitleScreen user={user} onUserChange={changeUser} onStart={goHome} />
  );
  if (screen.kind === "home") {
    body = (
      <HomeScreen
        config={config}
        user={user}
        onChange={changeConfig}
        onPlay={(next) => start(next)}
        onBack={goTitle}
        onOpenSettings={openSettings}
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
      {screen.kind === "home" || settingsOpen ? null : (
        <button type="button" className="settings-fab" onClick={openSettings}>
          Settings
        </button>
      )}
      {settingsOpen ? (
        <SettingsDialog config={config} onChangeConfig={changeConfig} onClose={closeSettings} />
      ) : null}
      {showPerfHud ? <PerfHud /> : null}
      {body}
    </>
  );
}

export default App;
