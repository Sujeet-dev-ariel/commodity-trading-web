import { useEffect, useMemo } from 'react';
import { EmptyState, Field, FilterTag } from '../../components/common/controls';
import { STATUS_CLS } from '../../data/mockData';
import { useAdmin } from '../../store/AdminContext';

const FILTERS = [
  { key: 'all', label: 'All users' },
  { key: 'Active', label: 'Active' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Suspended', label: 'Suspended' },
];

const GRID: React.CSSProperties = {
  gridTemplateColumns:
    'minmax(0,1.7fr) minmax(0,1fr) minmax(0,1.1fr) minmax(0,.95fr) minmax(0,1fr) minmax(0,.9fr) 118px',
};

export function UsersPage() {
  const admin = useAdmin();
  const {
    users, userFilter, setUserFilter, suspendUser, editRoles,
    invites, revokeInvite, inviteePhone, setInviteePhone, inviteeFirm, setInviteeFirm,
    inviteBuyer, toggleInviteBuyer, inviteSeller, toggleInviteSeller,
    invitePaymentTerms, setInvitePaymentTerms, inviteError, sendInvite, searchQuery,
    liveMode, invitesLoading, invitesError, refreshInvites, dataSource,
  } = admin;

  // Live backend: invites come from GET /invites (admin or broker role).
  // There is no backend user-directory endpoint, so the table stays local.
  useEffect(() => {
    if (liveMode) void refreshInvites();
  }, [liveMode, refreshInvites]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users
      .filter((u) => userFilter === 'all' || u.status === userFilter)
      .filter((u) => !q || u.firm.toLowerCase().includes(q) || u.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) || u.owner.toLowerCase().includes(q));
  }, [users, userFilter, searchQuery]);

  return (
    <div className="users-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <FilterTag key={f.key} label={f.label} active={userFilter === f.key} onClick={() => setUserFilter(f.key)} />
          ))}
        </div>
        <div className="panel">
          <div className="table-scroll">
            <div className="grid-head" style={{ ...GRID, minWidth: 860 }}>
              <div>FIRM</div><div>PHONE</div><div>MODES</div><div>PAYMENT</div><div>INVITED BY</div><div>LAST ACTIVE</div><div />
            </div>
            {filtered.map((u) => (
              <div key={u.id} className="grid-row" style={{ ...GRID, minWidth: 860 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span>{u.firm}</span>
                    <span className={`tag ${STATUS_CLS[u.status] ?? 'tag-neutral'}`} style={{ fontSize: 10, padding: '2px 8px' }}>{u.status}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5, marginTop: 1 }}>{u.owner}</div>
                </div>
                <div style={{ fontVariantNumeric: 'tabular-nums' }}>{u.phone}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {u.modes.map((m) => (
                    <span key={m} className={`tag ${m === 'Seller' ? 'tag-accent' : 'tag-accent-2'}`} style={{ fontSize: 10, padding: '2px 8px' }}>{m}</span>
                  ))}
                </div>
                <div className="text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{u.paymentTerms || '—'}</div>
                <div className="text-muted">{u.invitedBy}</div>
                <div className="text-muted">{u.lastActive}</div>
                <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={editRoles} style={{ height: 28, padding: '0 10px', fontSize: 11.5 }}>Roles</button>
                  <button className="btn btn-secondary" onClick={() => suspendUser(u.id)} style={{ height: 28, padding: '0 10px', fontSize: 11.5 }}>
                    {u.status === 'Suspended' ? 'Restore' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? <EmptyState message="No users match this filter." /> : null}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>Invite a user</div>
          <Field label="Mobile number">
            <div style={{ display: 'flex', gap: 7 }}>
              <div className="input" style={{ width: 52, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+91</div>
              <input
                className="input"
                placeholder="98xxx xxxxx"
                value={inviteePhone}
                onChange={(e) => setInviteePhone(e.target.value)}
                inputMode="tel"
              />
            </div>
          </Field>
          <Field label="Firm name">
            <input
              className="input"
              placeholder={liveMode ? 'Kept locally — the backend invite stores phone + role only' : 'e.g. Kuber Marketing'}
              value={inviteeFirm}
              onChange={(e) => setInviteeFirm(e.target.value)}
            />
          </Field>
          <div className="field" style={{ margin: 0 }}>
            <label>Modes</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <div className={`tag ${inviteBuyer ? 'tag-accent-2' : 'tag-neutral'}`} onClick={toggleInviteBuyer} style={{ cursor: 'pointer' }} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') toggleInviteBuyer(); }}
              >
                Buyer
              </div>
              <div className={`tag ${inviteSeller ? 'tag-accent' : 'tag-neutral'}`} onClick={toggleInviteSeller} style={{ cursor: 'pointer' }} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') toggleInviteSeller(); }}
              >
                Seller
              </div>
            </div>
          </div>
          {inviteBuyer ? (
            <Field label="Buyer payment terms">
              <select className="input" value={invitePaymentTerms} onChange={(e) => setInvitePaymentTerms(e.target.value)}>
                <option value="8-10 days">8-10 days</option>
                <option value="10-15 days">10-15 days</option>
                <option value="15-20 days">15-20 days</option>
              </select>
            </Field>
          ) : null}
          {inviteError ? <div className="field-error">{inviteError}</div> : null}
          <button className="btn btn-primary btn-block" onClick={sendInvite} style={{ height: 38, fontSize: 13 }}>Send invite</button>
        </div>

        <div className="panel">
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--color-neutral-200)', fontWeight: 700, fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 8 }}>
            Pending invites
            {liveMode && dataSource.invites === 'mock' ? (
              <span className="tag tag-neutral" style={{ fontWeight: 400 }}>Demo data</span>
            ) : null}
          </div>
          {invitesLoading ? <div className="text-muted" style={{ padding: '18px 16px', fontSize: 13 }}>Loading invites…</div> : null}
          {invitesError ? <div className="field-error" style={{ padding: '12px 16px 0' }}>{invitesError}</div> : null}
          {invites.map((i) => (
            <div key={i.id} style={{ padding: '11px 16px', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{i.firm}</div>
                <div className="text-muted" style={{ fontSize: 11.5 }}>{i.meta}</div>
              </div>
              <button className="btn btn-secondary" onClick={() => revokeInvite(i.id)} style={{ height: 28, padding: '0 10px', fontSize: 11.5, flex: 'none' }}>
                Revoke
              </button>
            </div>
          ))}
          {invites.length === 0 && !invitesLoading ? <EmptyState message="No pending invites." /> : null}
        </div>
      </div>
    </div>
  );
}
