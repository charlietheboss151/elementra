import { useState } from "react";
import { playUi } from "../audio/sounds";
import { currentUser, login, register } from "../game/auth";
import { defaultStore } from "../game/scoreboard";

function store() {
  return defaultStore();
}

interface AuthCardProps {
  onUserChange: (user: string | null) => void;
}

export function AuthCard({ onUserChange }: AuthCardProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="auth-card"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        playUi();
        const result =
          mode === "register"
            ? await register(name, password, store())
            : await login(name, password, store());
        setBusy(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setPassword("");
        onUserChange(currentUser(store()));
      }}
    >
      <p className="auth-lead">
        Optional: register to keep scores and element ranks on any device you log
        in from. Usernames are unique — if someone already picked that name, you
        will see “That username is taken.”
      </p>
      <label>
        Name
        <input
          autoComplete="username"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error ? <p className="auth-error">{error}</p> : null}
      <button type="submit" className="play-button auth-submit" disabled={busy}>
        {mode === "register" ? "Register" : "Log in"}
      </button>
      <button
        type="button"
        className="text-button"
        onClick={() => {
          playUi();
          setError("");
          setMode(mode === "register" ? "login" : "register");
        }}
      >
        {mode === "register" ? "I already have an account" : "Create an account"}
      </button>
    </form>
  );
}
