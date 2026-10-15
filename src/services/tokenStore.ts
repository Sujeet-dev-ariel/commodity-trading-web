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

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
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
