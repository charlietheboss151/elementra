import { useEffect, useState } from "react";
import brandLogo from "../assets/logo.jpg";
import { unlockSpeech } from "../audio/speech";
import { playUi, unlockAudio } from "../audio/sounds";
import { currentUser, logout } from "../game/auth";
import { defaultStore } from "../game/scoreboard";
import { AuthCard } from "./AuthCard";

interface TitleScreenProps {
  user: string | null;
  onUserChange: (user: string | null) => void;
  onStart: () => void;
}

export function TitleScreen({ user, onUserChange, onStart }: TitleScreenProps) {
  const [authOpen, setAuthOpen] = useState(!user);

  useEffect(() => {
    if (user) setAuthOpen(false);
  }, [user]);

  const closeAuth = () => {
    playUi();
    setAuthOpen(false);
  };

  useEffect(() => {
    if (!authOpen || user) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authOpen, user]);

  return (
    <div className="screen title">
      <a className="text-button title-hub-link" href="/">
        All games
      </a>
      <h1 className="sr-only">Elementra: the periodic table guessing game</h1>
      <img
        className="brand-logo"
        src={brandLogo}
        alt="Elementra. Master the table. Beat the clock."
      />
      <p className="byline">
        <span className="byline-label">Designed &amp; built by</span>
        <span className="byline-name">Charlie Bishop</span>
      </p>
      {user ? (
        <p className="auth-status-line">
          Signed in as <strong>{user}</strong>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              playUi();
              logout(defaultStore());
              onUserChange(currentUser(defaultStore()));
              setAuthOpen(true);
            }}
          >
            Log out
          </button>
        </p>
      ) : null}
      {authOpen && !user ? (
        <div
          className="auth-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeAuth();
          }}
        >
          <div className="auth-dialog" role="dialog" aria-modal="true" aria-label="Register or log in">
            <button type="button" className="auth-close" aria-label="Close" onClick={closeAuth}>
              ×
            </button>
            <AuthCard onUserChange={onUserChange} />
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className="play-button title-start"
        onClick={() => {
          unlockAudio();
          unlockSpeech();
          playUi();
          onStart();
        }}
      >
        Play
      </button>
      {!user && !authOpen ? (
        <button
          type="button"
          className="text-button"
          onClick={() => {
            playUi();
            setAuthOpen(true);
          }}
        >
          Log in
        </button>
      ) : null}
    </div>
  );
}
