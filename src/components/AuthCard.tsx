import { useState } from "react";
import { playUi } from "../audio/sounds";
import { currentUser, login, logout, register } from "../game/auth";
import { defaultStore } from "../game/scoreboard";

function store() {
  return defaultStore();
}

interface AuthCardProps {
  user: string | null;
  onUserChange: (user: string | null) => void;
}

export function AuthCard({ user, onUserChange }: AuthCardProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="auth-card">
        <p className="auth-status">
          Signed in as <strong>{user}</strong>
        </p>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            playUi();
            logout(store());
            onUserChange(currentUser(store()));
          }}
        >
          Log out
        </button>
      </div>
    );
  }

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
        Optional: register to keep scores and element ranks on this device. Or play as a
        guest.
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
