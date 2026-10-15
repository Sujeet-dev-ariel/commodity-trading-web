/**
 * Token + session persistence for the live backend.
 * Kept in its own module so the API client can attach/refresh tokens
 * without importing the auth service (no import cycles).
 */

export interface PersistedSession {
  accessToken: string;
  refreshToken: string;
  user: PersistedUser;
}

/** Backend AppUser shape (subset we rely on). */
export interface PersistedUser {
  id: string;
  phone: string;
  name: string | null;
  firmName: string | null;
  roles: string[];
  status: string;
}

const SESSION_KEY = 'kkpk_admin_session';

/**
 * Runtime shape guard. localStorage outlives our code — entries written by
 * older builds (or hand-edited by users) must never crash the boot path.
 * Anything that isn't a well-formed session is discarded (self-heal).
 */
function isPersistedSession(value: unknown): value is PersistedSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  const user = s.user as Record<string, unknown> | null;
  return (
    typeof s.accessToken === 'string' &&
    s.accessToken.length > 0 &&
    typeof s.refreshToken === 'string' &&
    !!user &&
    typeof user === 'object' &&
    typeof user.phone === 'string' &&
    Array.isArray(user.roles)
  );
}

function discardCorruptSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable (private mode) — nothing to discard */
  }
}

export function loadSession(): PersistedSession | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    discardCorruptSession();
    return null;
  }
  if (!isPersistedSession(parsed)) {
    discardCorruptSession();
    return null;
  }
  return parsed;
}

export function saveSession(session: PersistedSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function saveAccessToken(accessToken: string) {
  const s = loadSession();
  if (s) saveSession({ ...s, accessToken });
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
