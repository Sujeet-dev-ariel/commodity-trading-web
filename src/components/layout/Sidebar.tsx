import { NavLink } from 'react-router-dom';
import { NAV } from '../../data/mockData';
import { useAdmin } from '../../store/AdminContext';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { freightRoutes, setViewport, viewport } = useAdmin();
  const pending = freightRoutes.filter((r) => r.status === 'Pending review').length;

  const navStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '9px 12px', borderRadius: 7, fontSize: 13.5, cursor: 'pointer',
    textDecoration: 'none',
    ...(active
      ? { background: 'var(--color-accent-700)', fontWeight: 600, color: '#ffffff' }
      : { color: 'var(--color-accent-200)' }),
  });
  const vpStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 6, fontSize: 12,
    cursor: 'pointer', border: 0, font: 'inherit',
    ...(active
      ? { background: 'var(--color-accent-600)', color: '#ffffff', fontWeight: 600 }
      : { background: 'var(--color-accent-800)', color: 'var(--color-accent-200)' }),
  });

  return (
    <aside
      className="sidebar-desktop"
      style={{
        background: 'var(--color-accent-900)', color: '#ffffff',
        padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 22,
      }}
    >
      <div style={{ padding: '0 6px' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.16em', color: 'var(--color-accent-300)' }}>
          KKPK PLATFORM
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>Admin console</div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }} aria-label="Admin sections">
        {NAV.map((n) => {
          const badge = n.key === 'freight' && pending > 0 ? String(pending) : n.badge;
          const showBadge = n.key === 'freight' ? pending > 0 : Boolean(n.badge);
          return (
            <NavLink
              key={n.key}
              to={`/${n.key === 'dash' ? 'dash' : n.key}`}
              onClick={onNavigate}
              style={({ isActive }) => navStyle(isActive)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 999, flex: 'none',
                  background: n.mobile ? 'var(--color-accent-2-500)' : 'transparent',
                }}
                />
                <span>{n.label}</span>
              </span>
              <span style={showBadge
                ? {
                  background: 'var(--color-accent-2-600)', color: '#062b40',
                  fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px',
                }
                : { display: 'none' }}
              >
                {badge}
              </span>
            </NavLink>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5,
          color: 'var(--color-accent-300)', padding: '0 6px',
        }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-accent-2-500)' }} />
          <span>MOBILE-ESSENTIAL SECTION</span>
        </div>
        <div style={{ padding: '0 6px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.12em', color: 'var(--color-accent-300)', marginBottom: 6 }}>
            PREVIEW AS
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={vpStyle(viewport === 'desktop')} onClick={() => setViewport('desktop')}>Desktop</button>
            <button style={vpStyle(viewport === 'mobile')} onClick={() => setViewport('mobile')}>Mobile</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
