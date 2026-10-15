import { useMemo } from 'react';
import { EmptyState } from '../../components/common/controls';
import { useAdmin } from '../../store/AdminContext';
import { inr, lakhs } from '../../utils/format';

const GRID: React.CSSProperties = {
  gridTemplateColumns:
    '84px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,.6fr) minmax(0,.8fr) minmax(0,.95fr) minmax(0,.95fr) minmax(0,1fr)',
};

export function TradesPage() {
  const { trades, exportCsv, searchQuery } = useAdmin();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter((t) =>
      [t.code, t.item, t.seller, t.buyer, t.broker].some((v) => v.toLowerCase().includes(q)));
  }, [trades, searchQuery]);

  const summary = [
    { label: 'Trades closed today', value: '9', meta: '7 through a broker, 2 direct', hot: false },
    { label: 'Value traded today', value: lakhs(4720000), meta: 'across 6 firms', hot: false },
    { label: 'Brokerage earned today', value: inr(11802), meta: 'Ratan ₹5,420 · Sanjay ₹4,240 · Naveen ₹2,142', hot: false },
    { label: 'Brokerage this month', value: inr(268700), meta: 'placeholder until the model is set', hot: true },
  ];

  const handleExport = () => {
    exportCsv('trades', 'trades.csv', [
      ['Trade', 'Item', 'Seller', 'Buyer', 'Bags', 'Price', 'Value', 'Broker', 'Brokerage'],
      ...filtered.map((t) => [
        t.code, t.item, t.seller, t.buyer, String(t.bags), String(t.price),
        String(t.price * t.bags), t.broker,
        t.broker === 'Self' ? '' : String(Math.round(t.price * t.bags * 0.0025)),
      ]),
    ]);
  };

  return (
    <>
      <div className="broker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {summary.map((b) => (
          <div
            key={b.label}
            style={b.hot
              ? { background: 'var(--color-accent-2-100)', border: '1px solid var(--color-accent-2-300)', borderRadius: 10, padding: '15px 16px' }
              : { background: 'var(--color-bg)', border: '1px solid var(--color-neutral-300)', borderRadius: 10, padding: '15px 16px' }}
          >
            <div className="text-muted" style={{ fontSize: 11.5 }}>{b.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>{b.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', marginTop: 3 }}>{b.meta}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="table-scroll">
          <div className="grid-head" style={{ ...GRID, minWidth: 1020 }}>
            <div>TRADE</div><div>ITEM</div><div>SELLER</div><div>BUYER</div><div>BAGS</div><div>PRICE</div><div>VALUE</div><div>BROKER</div>
            <div style={{ color: 'var(--color-accent-2-700)', whiteSpace: 'nowrap' }}>BROKERAGE ⚑</div>
          </div>
          {filtered.map((t) => (
            <div key={t.code} className="grid-row" style={{ ...GRID, minWidth: 1020 }}>
              <div style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-neutral-600)' }}>{t.code}</div>
              <div style={{ fontWeight: 600 }}>{t.item}</div>
              <div>{t.seller}</div>
              <div>{t.buyer}</div>
              <div style={{ fontVariantNumeric: 'tabular-nums' }}>{t.bags}</div>
              <div style={{ fontVariantNumeric: 'tabular-nums' }}>{inr(t.price)}</div>
              <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{lakhs(t.price * t.bags)}</div>
              <div>
                <span className={`tag ${t.broker === 'Self' ? 'tag-neutral' : 'tag-accent'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                  {t.broker}
                </span>
              </div>
              <div style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-neutral-600)' }}>
                {t.broker === 'Self' ? '—' : inr(Math.round(t.price * t.bags * 0.0025))}
              </div>
            </div>
          ))}
          {filtered.length === 0 ? <EmptyState message="No trades match the search." /> : null}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="callout-info" style={{ flex: 1, minWidth: 260 }}>
          <span className="tag tag-accent-2" style={{ fontSize: 10, padding: '2px 8px', marginRight: 8 }}>FOR DISCUSSION</span>
          Commission model is unresolved — percentage of trade value, flat per bag, or simply recorded
          manually. The brokerage column is a placeholder until that is decided.
        </div>
        <button className="btn btn-secondary" onClick={handleExport} style={{ height: 40, padding: '0 18px', fontSize: 13, flex: 'none' }}>
          Export CSV
        </button>
      </div>
    </>
  );
}
