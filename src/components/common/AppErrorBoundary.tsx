import React from 'react';

/**
 * Last-resort boundary above the router/providers. Route-level errors are
 * handled by errorElement; this catches boot crashes (corrupt storage,
 * failed module init) that those can't reach, with a one-click recovery.
 */
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('[AppErrorBoundary]', error);
  }

  private reset = () => {
    try {
      // Drop all console-owned keys so a poisoned entry can't re-crash boot.
      const doomed = ['kkpk_admin_session', 'kkpk_admin_demo_session', 'kkpk_admin_otp_pending'];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (doomed.includes(key) || key.startsWith('kkpk_'))) localStorage.removeItem(key);
      }
    } catch {
      /* storage unavailable — reload anyway */
    }
    window.location.assign('/login');
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'var(--color-neutral-200)',
        fontFamily: 'system-ui, sans-serif',
      }}
      >
        <div style={{
          width: 440, maxWidth: '100%', background: '#fff', border: '1px solid #dde3ea',
          borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
        }}
        >
          <div style={{ fontWeight: 700, fontSize: 18 }}>The console failed to start</div>
          <p style={{ fontSize: 13, margin: 0, color: '#4d5560' }}>
            {this.state.error.message || 'An unexpected error occurred during startup.'}
          </p>
          <div>
            <button
              onClick={this.reset}
              style={{
                height: 38, padding: '0 18px', fontSize: 13, cursor: 'pointer',
                background: '#2f6feb', color: '#fff', border: 0, borderRadius: 999,
              }}
            >
              Clear saved data & go to login
            </button>
          </div>
        </div>
      </div>
    );
  }
}
