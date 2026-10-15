import { useMemo } from 'react';
import { EmptyState, Field, FilterTag } from '../../components/common/controls';
import { STATUS_CLS } from '../../data/mockData';
import { useAdmin } from '../../store/AdminContext';
import { inr } from '../../utils/format';

export function NegotiationsPage() {
  const admin = useAdmin();
  const {
    negotiations, negoFilter, setNegoFilter, selectedNegoId, selectNego,
    nudgeMessage, setNudgeMessage, relayPrice, setRelayPrice,
    relaySide, setRelaySide, nudge, relay, searchQuery,
  } = admin;

  const list = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return negotiations
      .filter((n) => (negoFilter === 'active' ? n.state !== 'Completed' : n.state === 'Completed'))
      .filter((n) => !q || n.item.toLowerCase().includes(q) || n.seller.toLowerCase().includes(q) || n.buyer.toLowerCase().includes(q));
  }, [negotiations, negoFilter, searchQuery]);

  const active = negotiations.find((n) => n.id === selectedNegoId) ?? negotiations[0];
  if (!active) return <EmptyState message="No negotiations." />;

  const expiry = (urgent: boolean): React.CSSProperties => ({
    fontSize: 11.5, marginTop: 2, fontWeight: 600, color: urgent ? '#d64545' : 'var(--color-neutral-600)',
  });

  return (
    <>
      <div className="callout-info">
        <strong>Visible by design.</strong> Admins see every live negotiation in full — both parties are told
        this at sign-up. Nudges and relayed offers are attributed to the admin who sent them.
      </div>
      <div className="nego-split" style={{ display: 'grid', gridTemplateColumns: '340px minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <FilterTag label="Active" active={negoFilter === 'active'} onClick={() => setNegoFilter('active')} />
            <FilterTag label="Completed" active={negoFilter === 'done'} onClick={() => setNegoFilter('done')} />
          </div>
          <div className="panel">
            {list.map((n) => (
              <div
                key={n.id}
                onClick={() => selectNego(n.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') selectNego(n.id); }}
                style={{
                  padding: '13px 16px', borderBottom: '1px solid var(--color-neutral-200)', cursor: 'pointer',
                  ...(n.id === selectedNegoId
                    ? { background: 'var(--color-accent-100)', boxShadow: 'inset 3px 0 0 var(--color-accent-600)' }
                    : {}),
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{n.item}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{inr(n.standing)}</div>
                </div>
                <div className="text-muted" style={{ fontSize: 11.5, marginTop: 3 }}>
                  {n.seller} → {n.buyer} · {n.bags} bags
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 7 }}>
                  <span className={`tag ${STATUS_CLS[n.state] ?? 'tag-neutral'}`} style={{ fontSize: 10, padding: '2px 8px' }}>{n.state}</span>
                  <span style={expiry(n.urgent)}>{n.expiry}</span>
                </div>
              </div>
            ))}
            {list.length === 0 ? <EmptyState message="No negotiations in this view." /> : null}
          </div>
        </div>

        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{active.item}</div>
              <div className="text-muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                {active.seller} → {active.buyer} · {active.bags} bags · 30KG
              </div>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div className="text-muted" style={{ fontSize: 11, letterSpacing: '.06em' }}>STANDING OFFER</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{inr(active.standing)}</div>
              <div style={expiry(active.urgent)}>{active.expiry}</div>
            </div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--color-neutral-100)' }}>
            {active.thread.map((m, i) => {
              const isBuyer = m.side === 'buyer';
              const isAdmin = m.side === 'admin';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isBuyer ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    maxWidth: '62%', borderRadius: 12, padding: '11px 15px',
                    ...(isBuyer
                      ? { background: 'var(--color-bg)', border: '1px solid var(--color-neutral-300)' }
                      : isAdmin
                        ? { background: 'var(--color-accent-2-100)', border: '1px solid var(--color-accent-2-300)', color: 'var(--color-accent-2-900)' }
                        : { background: 'var(--color-accent-700)', color: '#ffffff' }),
                  }}
                  >
                    <div style={{
                      fontSize: 11, marginBottom: 3,
                      color: isBuyer ? 'var(--color-neutral-600)' : isAdmin ? 'var(--color-accent-2-700)' : 'var(--color-accent-200)',
                    }}
                    >
                      {m.who}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{m.price}</div>
                    <div style={{
                      fontSize: 11, marginTop: 3,
                      color: isBuyer ? 'var(--color-neutral-500)' : isAdmin ? 'var(--color-accent-2-700)' : 'var(--color-accent-200)',
                    }}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Admin actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Message a party">
                <div style={{ display: 'flex', gap: 7 }}>
                  <input
                    className="input"
                    placeholder="e.g. Seller can do ₹12,400 if you take 30 bags"
                    value={nudgeMessage}
                    onChange={(e) => setNudgeMessage(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-secondary" onClick={nudge} style={{ height: 38, padding: '0 14px', fontSize: 12.5, flex: 'none' }}>
                    Send
                  </button>
                </div>
              </Field>
              <Field label="Relay an offer on their behalf">
                <div style={{ display: 'flex', gap: 7 }}>
                  <input
                    className="input"
                    placeholder="₹ price"
                    value={relayPrice}
                    onChange={(e) => setRelayPrice(e.target.value)}
                    inputMode="numeric"
                    style={{ flex: 1 }}
                  />
                  <select
                    className="input"
                    value={relaySide}
                    onChange={(e) => setRelaySide(e.target.value as 'as Seller' | 'as Buyer')}
                    style={{ width: 110, flex: 'none', fontSize: 12.5 }}
                  >
                    <option>as Seller</option>
                    <option>as Buyer</option>
                  </select>
                  <button className="btn btn-primary" onClick={relay} style={{ height: 38, padding: '0 14px', fontSize: 12.5, flex: 'none' }}>
                    Relay
                  </button>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
