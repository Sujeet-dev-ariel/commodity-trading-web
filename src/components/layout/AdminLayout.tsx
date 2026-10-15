import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PAGES } from '../../data/mockData';
import { useAdmin } from '../../store/AdminContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const PATH_TO_SCREEN: Record<string, string> = {
  dash: 'dash', users: 'users', listings: 'listings', negotiations: 'negotiations',
  trades: 'trades', settings: 'settings', audit: 'audit', freight: 'freight',
};

/**
 * Desktop console shell: sidebar + header + per-route page head + outlet.
 * Owns the header primary action, scroll restoration and document title
 * so individual pages stay focused on their own content.
 */
export function AdminLayout() {
  const { toast, flash, uploadFreightSheet, exportCsv, rows, trades } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const seg = location.pathname.split('/')[1] || 'dash';
  const page = PAGES[PATH_TO_SCREEN[seg] ?? 'dash'] ?? PAGES.dash;

  // Scroll to top on every navigation (new "page" per route).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Keep the tab title in sync with the active section.
  useEffect(() => {
    document.title = `${page[0]} · KKPK Admin`;
  }, [page]);

  const handlePrimary = () => {
    if (seg === 'freight') {
      uploadFreightSheet();
      return;
    }
    if (seg === 'trades') {
      exportCsv('trades', 'trades.csv', [
        ['Trade', 'Item', 'Seller', 'Buyer', 'Bags', 'Price', 'Broker'],
        ...trades.map((t) => [t.code, t.item, t.seller, t.buyer, String(t.bags), String(t.price), t.broker]),
      ]);
      return;
    }
    if (seg === 'listings') {
      exportCsv('listings', 'listings.csv', [
        ['Side', 'Firm', 'Item', 'Category', 'Weight', 'Price', 'Status'],
        ...rows.map((r) => [r.side, r.firm, r.item, r.category, r.weight, r.price == null ? 'N/A' : String(r.price), r.status]),
      ]);
      return;
    }
    if (seg === 'users') {
      navigate('/users');
      flash('User list is shown below — use Send invite to add a user');
      return;
    }
    flash('Action stub — wire in build');
  };

  return (
    <div className="admin-grid">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <div className="content-pad" style={{ padding: '22px 28px 56px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 23, marginBottom: 3 }}>{page[0]}</h1>
              <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>{page[1]}</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handlePrimary}
              style={{ height: 38, padding: '0 18px', fontSize: 13 }}
            >
              {page[2]}
            </button>
          </div>
          {toast ? <div className="toast" role="status">{toast}</div> : null}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
