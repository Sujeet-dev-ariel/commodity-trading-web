import { useMemo } from 'react';
import { EmptyState } from '../../components/common/controls';
import { useAdmin } from '../../store/AdminContext';

const GRID: React.CSSProperties = {
  gridTemplateColumns:
    '150px minmax(0,.9fr) minmax(0,1.1fr) minmax(0,1.4fr) minmax(0,1.5fr)',
};

function actionCls(action: string): string {
  if (action === 'Edit on behalf') return 'tag-accent-2';
  if (action === 'Negotiation nudge') return 'tag-accent';
  return 'tag-neutral';
}

export function AuditPage() {
  const { audit, auditAdmin, setAuditAdmin, auditAction, setAuditAction, auditQuery, setAuditQuery } = useAdmin();

  const filtered = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    return audit.filter(
      (a) =>
        (auditAdmin === 'All admins' || a.admin === auditAdmin) &&
        (auditAction === 'All actions' || a.action === auditAction) &&
        (!q || a.entity.toLowerCase().includes(q) || a.admin.toLowerCase().includes(q)),
    );
  }, [audit, auditAdmin, auditAction, auditQuery]);

  const admins = useMemo(() => ['All admins', ...Array.from(new Set(audit.map((a) => a.admin)))], [audit]);
  const actions = useMemo(() => ['All actions', ...Array.from(new Set(audit.map((a) => a.action)))], [audit]);

  return (
    <>
      <div className="panel filter-bar">
        <select className="input" value={auditAdmin} onChange={(e) => setAuditAdmin(e.target.value)} style={{ height: 34, width: 180, fontSize: 12.5 }}>
          {admins.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select className="input" value={auditAction} onChange={(e) => setAuditAction(e.target.value)} style={{ height: 34, width: 200, fontSize: 12.5 }}>
          {actions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Entity or firm"
          value={auditQuery}
          onChange={(e) => setAuditQuery(e.target.value)}
          style={{ height: 34, width: 200, fontSize: 12.5 }}
        />
        <div className="text-muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
          Last 30 days · {filtered.length} entries
        </div>
      </div>
      <div className="panel">
        <div className="table-scroll">
          <div className="grid-head" style={{ ...GRID, minWidth: 860 }}>
            <div>WHEN</div><div>ADMIN</div><div>ACTION</div><div>ENTITY</div><div>BEFORE → AFTER</div>
          </div>
          {filtered.map((a, i) => (
            <div key={`${a.when}-${a.entity}-${i}`} className="grid-row" style={{ ...GRID, minWidth: 860 }}>
              <div className="text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{a.when}</div>
              <div style={{ fontWeight: 600 }}>{a.admin}</div>
              <div>
                <span className={`tag ${actionCls(a.action)}`} style={{ fontSize: 10, padding: '2px 8px' }}>{a.action}</span>
              </div>
              <div>{a.entity}</div>
              <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                <span className="text-muted" style={{ textDecoration: 'line-through' }}>{a.before}</span>
                <span style={{ margin: '0 6px', color: 'var(--color-neutral-400)' }}>→</span>
                <span style={{ fontWeight: 600 }}>{a.after}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 ? <EmptyState message="No audit entries match these filters." /> : null}
        </div>
      </div>
    </>
  );
}
