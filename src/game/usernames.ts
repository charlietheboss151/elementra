export const USERNAME_TAKEN = "That username is taken.";

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function usernameLooksValid(username: string): boolean {
  return username.length >= 3 && username.length <= 24 && /^[a-z0-9_]+$/.test(username);
}

export type ClaimUsername = (username: string) => Promise<{ ok: true } | { ok: false; error: string }>;

export function memoryUsernameClaims(): ClaimUsername {
  const taken = new Set<string>();
  return async (username) => {
    if (taken.has(username)) return { ok: false, error: USERNAME_TAKEN };
    taken.add(username);
    return { ok: true };
  };
}

export function allowAllUsernameClaims(): ClaimUsername {
  return async () => ({ ok: true });
}

export async function claimUsernameOnServer(username: string): ReturnType<ClaimUsername> {
  let response: Response;
  try {
    response = await fetch("/api/usernames.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
  } catch {
    return { ok: false, error: "Couldn't check that username. Try again." };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "ok" in payload &&
    (payload as { ok: unknown }).ok === true
  ) {
    return { ok: true };
  }

  const error =
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error: unknown }).error === "string"
      ? (payload as { error: string }).error
      : USERNAME_TAKEN;

  if (response.status === 409 || error === USERNAME_TAKEN) {
    return { ok: false, error: USERNAME_TAKEN };
  }

  return { ok: false, error };
}
