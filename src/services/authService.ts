/**





* Auth service. Contract verified against D:\Tradding_backend:
 * routes/auth.js, controllers/auth.controller.js, services/auth.service.js,
 * services/otp.service.js, lib/validators.js.
 *
 * - Live mode (VITE_API_BASE_URL set, e.g. http://localhost:3000/api/v1):
 *   POST /auth/login { phone: "+91XXXXXXXXXX" } -> OTP sent
 *   (dev backend stub accepts code "1111", 4-6 digits per OTP_REGEX).
 *   POST /auth/verify-otp { phone, otp } -> { accessToken, refreshToken, user }
 *   Tokens + user persist in localStorage; the api client attaches the
 *   Bearer token and refreshes it (see api.ts / tokenStore.ts).
 * - Demo mode (no base URL): the previous local OTP flow, kept so the UI
 *   works end to end with zero backend. Clearly marked, swappable.
 */
import { authApi, toE164Indian } from './backend';
import { isBackendConfigured } from './api';
import { clearSession, loadSession, saveSession, type PersistedUser } from './tokenStore';

export interface SessionUser {
  id: string;
  /** 10-digit display form. */
  phone: string;
  name: string;
  /** Display role, e.g. "Primary admin". */
  role: string;
  /** Backend roles (demo sessions always carry ['admin']). */
  roles: string[];
  firm: string;
}

export const OTP_LENGTH = 4;
export const OTP_TTL_MS = 5 * 60 * 1000;
export const RESEND_COOLDOWN_S = 30;

interface DemoPending {
  phone: string;
  code: string;
  expiresAt: number;
}
const DEMO_PENDING_KEY = 'kkpk_admin_otp_pending';
const DEMO_SESSION_KEY = 'kkpk_admin_demo_session';

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
}

export function isValidPhone(raw: string): boolean {
  const d = normalizePhone(raw);
  return /^[6-9]\d{9}$/.test(d);
}

export function isValidOtpLive(code: string): boolean {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code.trim());
}

function lookupDemoAdmin(phone: string): SessionUser {
  // No-backend mode: there is no user directory to look up, so every verified
  // number signs in as a generic local admin for that session.
  return { id: `demo-${phone}`, phone, name: 'Admin', role: 'Admin', roles: ['admin'], firm: '' };
}

function toSessionUser(u: PersistedUser): SessionUser {
  // Defensive defaults: the backend contract says these fields exist, but a
  // sloppy proxy or future API change shouldn't white-screen the console.
  const phoneRaw = typeof u.phone === 'string' ? u.phone : '';
  const roles = Array.isArray(u.roles) ? u.roles.filter((r): r is string => typeof r === 'string') : [];
  const digits = phoneRaw.replace(/\D/g, '').slice(-10);
  const isAdmin = roles.includes('admin');
  const label = isAdmin && roles.length === 1 ? 'Primary admin'
    : roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ') || 'Admin';
  const name = (typeof u.name === 'string' && u.name.trim()) || (typeof u.firmName === 'string' ? u.firmName : '') || digits || 'Admin';
  return {
    id: typeof u.id === 'string' ? u.id : `unknown-${Date.now()}`,
    phone: digits || phoneRaw,
    name,
    role: isAdmin && !u.name ? 'Primary admin' : label,
    roles,
    firm: typeof u.firmName === 'string' ? u.firmName : '',
  };
}

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.phone === 'string' &&
    typeof v.name === 'string' &&
    typeof v.role === 'string' &&
    Array.isArray(v.roles) &&
    typeof v.firm === 'string'
  );
}

function discardDemoSession() {
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* storage unavailable — nothing to discard */
  }
}
function readDemoPending(): DemoPending | null {
  try {
    const raw = localStorage.getItem(DEMO_PENDING_KEY);
    return raw ? (JSON.parse(raw) as DemoPending) : null;
  } catch {
    return null;
  }
}

export const authService = {
  isDemoMode: () => !isBackendConfigured(),

  getSessionUser(): SessionUser | null {
    if (isBackendConfigured()) {
      const s = loadSession();
      return s ? toSessionUser(s.user) : null;
    }
    let raw: string | null;
    try {
      raw = localStorage.getItem(DEMO_SESSION_KEY);
    } catch {
      return null;
    }
    if (!raw) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      discardDemoSession();
      return null;
    }
    if (!isSessionUser(parsed)) {
      discardDemoSession();
      return null;
    }
    return parsed;
  },

  /**
   * Request an OTP for a 10-digit mobile number.
   * @returns demoCode in demo mode (shown on-screen, no SMS backend);
   * null in live mode (backend sends / logs the OTP).
   */
  async requestOtp(phoneDigits: string): Promise<{ demoCode: string | null }> {
    if (!isValidPhone(phoneDigits)) throw new Error('Enter a valid 10-digit mobile number.');
    const normalized = normalizePhone(phoneDigits);
    if (isBackendConfigured()) {
      await authApi.login(toE164Indian(normalized));
      return { demoCode: null };
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const pending: DemoPending = { phone: normalized, code, expiresAt: Date.now() + OTP_TTL_MS };
    localStorage.setItem(DEMO_PENDING_KEY, JSON.stringify(pending));
    return { demoCode: code };
  },

  async verifyOtp(phoneDigits: string, code: string): Promise<SessionUser> {
    const normalized = normalizePhone(phoneDigits);
    const trimmed = code.trim();
    if (isBackendConfigured()) {
      if (!isValidOtpLive(trimmed)) throw new Error('Enter the 4-digit code.');
      const res = await authApi.verifyOtp(toE164Indian(normalized), trimmed);
      saveSession({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user });
      return toSessionUser(res.user);
    }
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(trimmed)) {
      throw new Error(`Enter the ${OTP_LENGTH}-digit code.`);
    }
    const pending = readDemoPending();
    if (!pending || pending.phone !== normalized) {
      throw new Error('No active code for this number — request a fresh one.');
    }
    if (Date.now() > pending.expiresAt) {
      localStorage.removeItem(DEMO_PENDING_KEY);
      throw new Error('That code expired — request a fresh one.');
    }
    if (pending.code !== trimmed) {
      throw new Error('Incorrect code — check and try again.');
    }
    localStorage.removeItem(DEMO_PENDING_KEY);
    const user = lookupDemoAdmin(normalized);
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    if (isBackendConfigured()) {
      const refreshToken = loadSession()?.refreshToken;
      clearSession();
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          /* session already cleared locally; nothing else to do */
        }
      }
      return;
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(DEMO_PENDING_KEY);
  },
};
