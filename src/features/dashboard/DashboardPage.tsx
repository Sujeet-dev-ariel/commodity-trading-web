import { Link } from 'react-router-dom';
import { SEED_ACTIVITY, SEED_QUEUE, TONE_COLOR } from '../../data/mockData';
import { useAdmin } from '../../store/AdminContext';
import { inr } from '../../utils/format';

const METRICS = [
  { label: 'Live sell listings', value: '148', delta: '+22 since the 2 AM reset' },
  { label: 'Open buy requirements', value: '12', delta: '8 have at least one offer' },
  { label: 'Active negotiations', value: '4', delta: '2 stalled or near expiry' },
  { label: 'Trades closed today', value: '9', delta: '₹47.2L of goods' },
  { label: 'Brokerage today', value: inr(11802), delta: 'model still open' },
];

export function DashboardPage() {
  const { negotiations } = useAdmin();
  const live = negotiations.filter((n) => n.state !== 'Completed');

  return (
    <>
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {METRICS.map((m) => (
          <div key={m.label} className="panel" style={{ padding: '15px 16px' }}>
            <div className="text-muted" style={{ fontSize: 11.5 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, letterSpacing: '-.015em', fontVariantNumeric: 'tabular-nums' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', marginTop: 3 }}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Needs attention</div>
          <div className="tag tag-accent-2">{SEED_QUEUE.length} open</div>
        </div>
        <div className="queue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {SEED_QUEUE.map((q) => (
            <div key={q.title} style={{ padding: '16px 18px', borderRight: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: 999, flex: 'none', background: TONE_COLOR[q.tone] }} />
                <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{q.count}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{q.title}</div>
              <div className="text-muted" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{q.meta}</div>
              <Link
                to={`/${q.target === 'dash' ? 'dash' : q.target}`}
                className="btn btn-secondary"
                style={{ marginTop: 'auto', alignSelf: 'flex-start', height: 30, padding: '0 13px', fontSize: 12 }}
              >
                {q.action}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18, alignItems: 'start' }}>
        <div className="panel">
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Negotiations happening now</div>
            <Link to="/negotiations" style={{ fontSize: 12, color: 'var(--color-accent-700)', fontWeight: 600 }}>See all →</Link>
          </div>
          {live.map((n) => (
            <div key={n.id} style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.item}</div>
                <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                  {n.seller} → {n.buyer} · {n.bags} bags
                </div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{inr(n.standing)}</div>
                <div style={{ fontSize: 11.5, marginTop: 2, fontWeight: 600, color: n.urgent ? '#d64545' : 'var(--color-neutral-600)' }}>
                  {n.expiry}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-neutral-200)', fontWeight: 700, fontSize: 15 }}>
            Live activity
          </div>
          {SEED_ACTIVITY.map((a) => (
            <div key={`${a.time}-${a.text.slice(0, 12)}`} style={{ padding: '10px 18px', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', gap: 12 }}>
              <div className="text-muted" style={{ fontSize: 11.5, width: 42, flex: 'none', fontVariantNumeric: 'tabular-nums' }}>{a.time}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>{a.text}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
