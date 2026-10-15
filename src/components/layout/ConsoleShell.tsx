import { MobilePreview } from '../mobile/MobilePreview';
import { TosAcceptPage } from '../../features/auth/TosAcceptPage';
import { useAdmin } from '../../store/AdminContext';
import { useAuth } from '../../store/AuthContext';
import { AdminLayout } from './AdminLayout';

/**
 * Picks the console surface: mobile preview, ToS gate, or the desktop
 * layout. Keeps those cross-cutting concerns out of the route table.
 */
export function ConsoleShell() {
  const { viewport } = useAdmin();
  const { isLive, tosStatus } = useAuth();

  if (viewport === 'mobile') {
    return (
      <div className="admin-shell">
        <MobilePreview />
      </div>
    );
  }

  // Live backend + ToS not accepted -> block the whole panel (the API would
  // 403 every listings/taxonomy call with TOS_ACCEPTANCE_REQUIRED anyway).
  if (isLive && tosStatus?.needsAcceptance) {
    return (
      <div className="admin-shell">
        <TosAcceptPage />
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminLayout />
    </div>
  );
}
