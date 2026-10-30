import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';

/**
 * Terms gate (backend: requireTosAccepted, TOS_ACCEPTANCE_REQUIRED).
 * Shown in live mode when GET /tos/status reports needsAcceptance —
 * after OTP verification and before entering the panel, per CLAUDE.md §4.1.1.
 */
export function TosAcceptPage() {
  const { tosStatus, acceptTos, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const version = tosStatus?.currentVersion;

  const agree = async () => {
    if (!version) return;
    setBusy(true);
    setError(null);
    try {
      await acceptTos(version.version);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record acceptance.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--color-neutral-200)',
    }}
    >
      <div style={{ width: 520, maxWidth: '100%' }}>
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', color: 'var(--color-accent-700)', fontWeight: 700 }}>
            KKPK PLATFORM
          </div>
          <h1 style={{ fontSize: 24, margin: '6px 0 4px' }}>Terms of Service &amp; Privacy Policy</h1>
          <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
            {version ? (
              <>Version {version.version} · effective {new Date(version.effectiveDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</>
            ) : (
              <>Loading current version…</>
            )}
          </p>
        </div>
        <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            By continuing, you agree to the Terms of Service and Privacy Policy.
            Your acceptance (version + timestamp, tied to your verified phone) is
            recorded — you will only be asked again when a new version is published.
          </p>
          <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
            {version?.termsUrl ? <a href={version.termsUrl} target="_blank" rel="noreferrer">Read Terms</a> : null}
            {version?.privacyUrl ? <a href={version.privacyUrl} target="_blank" rel="noreferrer">Read Privacy Policy</a> : null}
            {!version?.termsUrl && !version?.privacyUrl ? (
              <span className="text-muted">Full text links were not provided with this version.</span>
            ) : null}
          </div>
          {error ? <div className="field-error">{error}</div> : null}
          <button className="btn btn-primary btn-block" onClick={() => void agree()} disabled={busy || !version} style={{ minHeight: 44, fontSize: 14 }}>
            {busy ? 'Recording…' : 'Agree & Continue'}
          </button>
          <button className="btn btn-secondary btn-block" onClick={() => void logout()} style={{ minHeight: 40, fontSize: 13 }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  const { roles, logout } = useAuth();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--color-neutral-200)',
    }}
    >
      <div className="panel panel-pad" style={{ width: 440, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Admin access required</div>
        <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
          This console is admin-only. Your account holds: {roles.length ? roles.join(', ') : 'no roles'}.
        </p>
        <button className="btn btn-secondary" onClick={() => void logout()} style={{ minHeight: 40, fontSize: 13, alignSelf: 'flex-start' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
