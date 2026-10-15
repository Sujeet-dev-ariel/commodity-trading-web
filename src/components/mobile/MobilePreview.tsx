import { SEED_QUEUE, STATUS_CLS } from '../../data/mockData';
import { useAdmin } from '../../store/AdminContext';
import { inr } from '../../utils/format';

/**
 * Mobile preview — mirrors the standalone panel's "Preview as Mobile" mode:
 * an explanatory rail plus a 402×874 phone frame with three tabs
 * (Today / Deals / Users). Desktop-only sections stay desktop-only.
 */
export function MobilePreview() {
  const {
    setViewport, mobileScreen, setMobileScreen,
    negotiations, invites, sendInvite, nudge, relay, countdown,
  } = useAdmin();

  const screens = [
    { key: 'dash' as const, label: 'Dashboard' },
    { key: 'negotiations' as const, label: 'Negotiations' },
    { key: 'users' as const, label: 'Invite & approve' },
  ];
  const tabs = [
    { key: 'dash' as const, label: 'Today' },
    { key: 'negotiations' as const, label: 'Deals' },
    { key: 'users' as const, label: 'Users' },
  ];
  const mobileMetrics = [
    { label: 'Live listings', value: '148' },
    { label: 'Requirements', value: '12' },
    { label: 'Negotiations', value: '4' },
    { label: 'Trades today', value: '9' },
  ];
  const mobileTitle = mobileScreen === 'dash' ? 'Today' : mobileScreen === 'negotiations' ? 'Negotiations' : 'Users';

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 30, padding: 24, flexWrap: 'wrap' }}>
      <div style={{ width: 290, flex: 'none', paddingTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="tag tag-accent-2">ADMIN · MOBILE APP</div>
        <h1 style={{ fontSize: 21 }}>Three sections travel to the phone</h1>
        <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
          Dashboard, invite/approve, and negotiations. Deals move in real time and the admin is rarely at a
          laptop when they do. Listings oversight, the trades table, settings and the audit log stay
          desktop-only — they are dense and filter-heavy.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {screens.map((m) => (
            <div
              key={m.key}
              className={`tag ${mobileScreen === m.key ? 'tag-accent' : 'tag-neutral'}`}
              onClick={() => setMobileScreen(m.key)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setMobileScreen(m.key); }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setViewport('desktop')} style={{ height: 38, fontSize: 13, marginTop: 8 }}>
          Back to desktop console
        </button>
      </div>

      <div style={{
        width: 402, maxWidth: '100%', height: 874, maxHeight: '80vh', flex: 'none',
        borderRadius: 48, border: '10px solid #101828', overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
        background: 'var(--color-neutral-100)',
      }}
      >
        <div style={{ padding: '20px 18px 14px', background: 'var(--color-accent-900)', color: '#ffffff', flex: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '.16em', color: 'var(--color-accent-300)' }}>KKPK ADMIN</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{mobileTitle}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-accent-300)', lineHeight: 1.4 }}>
              <div>expires in</div>
              <div style={{ fontVariantNumeric: 'tabular-nums', color: '#fff', fontWeight: 600 }}>{countdown}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {mobileScreen === 'dash' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {mobileMetrics.map((m) => (
                  <div key={m.label} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-neutral-300)', borderRadius: 10, padding: 12 }}>
                    <div className="text-muted" style={{ fontSize: 11 }}>{m.label}</div>
                    <div style={{ fontSize: 21, fontWeight: 700, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>Needs attention</div>
              {SEED_QUEUE.map((q) => (
                <div key={q.title} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-neutral-300)', borderRadius: 10, padding: 13, display: 'flex', gap: 11, alignItems: 'center' }}>
                  <div style={{ width: 9, height: 9, borderRadius: 999, flex: 'none', background: q.tone === 'bad' ? '#d64545' : q.tone === 'warn' ? '#d98806' : 'var(--color-accent-600)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{q.title}</div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{q.meta}</div>
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 700, flex: 'none', fontVariantNumeric: 'tabular-nums' }}>{q.count}</div>
                </div>
              ))}
            </>
          ) : null}

          {mobileScreen === 'negotiations' ? (
            <>
              {negotiations.map((n) => (
                <div key={n.id} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-neutral-300)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{n.item}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{inr(n.standing)}</div>
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5, marginTop: 3 }}>
                    {n.seller} → {n.buyer} · {n.bags} bags
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <span className={`tag ${STATUS_CLS[n.state] ?? 'tag-neutral'}`} style={{ fontSize: 10, padding: '2px 8px' }}>{n.state}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: n.urgent ? '#d64545' : 'var(--color-neutral-600)' }}>{n.expiry}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
                    <button className="btn btn-secondary" onClick={nudge} style={{ flex: 1, minHeight: 44, fontSize: 12.5 }}>Message</button>
                    <button className="btn btn-primary" onClick={relay} style={{ flex: 1, minHeight: 44, fontSize: 12.5 }}>Relay offer</button>
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {mobileScreen === 'users' ? (
            <>
              <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-neutral-300)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Invite a user</div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Mobile number</label>
                  <input className="input" placeholder="98xxx xxxxx" style={{ minHeight: 44 }} aria-label="Mobile number" />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="tag tag-accent" style={{ cursor: 'pointer' }}>Buyer</div>
                  <div className="tag tag-neutral" style={{ cursor: 'pointer' }}>Seller</div>
                </div>
                <button className="btn btn-primary btn-block" onClick={sendInvite} style={{ minHeight: 44, fontSize: 13 }}>Send invite</button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>Pending invites</div>
              {invites.map((i) => (
                <div key={i.id} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-neutral-300)', borderRadius: 10, padding: 13, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{i.firm}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{i.meta}</div>
                  </div>
                  <button className="btn btn-secondary" style={{ minHeight: 44, padding: '0 14px', fontSize: 12, flex: 'none' }}>Revoke</button>
                </div>
              ))}
            </>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: 4, borderTop: '1px solid var(--color-neutral-300)', background: 'var(--color-bg)', padding: '8px 8px 26px', flex: 'none' }}>
          {tabs.map((t) => (
            <div
              key={t.key}
              onClick={() => setMobileScreen(t.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setMobileScreen(t.key); }}
              style={{
                flex: 1, textAlign: 'center', padding: '11px 0', fontSize: 12, borderRadius: 8,
                minHeight: 44, cursor: 'pointer',
                ...(mobileScreen === t.key
                  ? { background: 'var(--color-accent-100)', color: 'var(--color-accent-700)', fontWeight: 700 }
                  : { color: 'var(--color-neutral-600)' }),
              }}
            >
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
