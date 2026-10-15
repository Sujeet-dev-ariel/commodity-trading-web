import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../store/AdminContext';
import { useAuth } from '../../store/AuthContext';
import { Sidebar } from './Sidebar';

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  const s = parts.map((w) => w[0]).join('').toUpperCase();
  return s || 'A';
}

export function Header() {
  const { searchQuery, setSearchQuery, countdown } = useAdmin();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    void logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div style={{
        background: 'var(--color-bg)', borderBottom: '1px solid var(--color-neutral-300)',
        padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 20,
      }}
      >
        <button
          className="btn btn-secondary btn-hamburger"
          onClick={() => setDrawerOpen(true)}
          style={{ height: 36, padding: '0 12px', fontSize: 16, flex: 'none' }}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <input
          className="input"
          placeholder="Search firm, phone, item, trade ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ height: 36, maxWidth: 340, flex: 1 }}
          aria-label="Search"
        />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="header-meta" style={{ textAlign: 'right', lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Sunday, 9 August 2026</div>
            <div className="text-muted" style={{ fontSize: 11.5 }}>
              Prices expire in{' '}
              <strong style={{ color: 'var(--color-accent-700)', fontVariantNumeric: 'tabular-nums' }}>
                {countdown}
              </strong>
              {' '}· 2:00 AM IST
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 20,
            borderLeft: '1px solid var(--color-neutral-300)',
          }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 999, background: 'var(--color-accent-700)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flex: 'none',
            }}
            >
              {initialsOf(user?.name ?? 'Admin')}
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name ?? 'Admin'}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>{user?.role ?? 'Admin'}</div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ height: 30, padding: '0 12px', fontSize: 12, marginLeft: 4 }}
              title="Sign out"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {drawerOpen ? (
        <div
          className="sidebar-drawer"
          style={{
            display: 'none', position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(15,42,94,.42)',
          }}
          onClick={() => setDrawerOpen(false)}
          role="presentation"
        >
          <div
            style={{ width: 260, display: 'flex', flexDirection: 'column', background: 'var(--color-accent-900)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
