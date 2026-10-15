import { NavLink } from 'react-router-dom';
import { NAV } from '../../data/mockData';
import { useAdmin } from '../../store/AdminContext';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { freightRoutes } = useAdmin();
  const pending = freightRoutes.filter((r) => r.status === 'Pending review').length;

  const navStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '9px 12px', borderRadius: 7, fontSize: 13.5, cursor: 'pointer',
    textDecoration: 'none',
    ...(active
      ? { background: 'var(--color-accent-700)', fontWeight: 600, color: '#ffffff' }
      : { color: 'var(--color-accent-200)' }),
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
              to={`/${n.key}`}
              onClick={onNavigate}
              style={({ isActive }) => navStyle(isActive)}
            >
              <span>{n.label}</span>
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
    </aside>
  );
}
