import { useMemo } from 'react';
import { EmptyState, Pagination, usePagination } from '../../components/common/controls';
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

  const tradeValue = (t: { bags: number; price: number }) => t.price * t.bags;
  const {
    page, setPage, totalPages, pageItems,
  } = usePagination(filtered, 10, searchQuery);
  const totalValue = filtered.reduce((s, t) => s + tradeValue(t), 0);
  const viaBroker = filtered.filter((t) => t.broker !== 'Self').length;
  const direct = filtered.length - viaBroker;
  const firms = new Set(filtered.flatMap((t) => [t.seller, t.buyer])).size;

  const summary = [
    { label: 'Trades closed', value: String(filtered.length), meta: filtered.length ? `${viaBroker} through a broker, ${direct} direct` : 'no trades recorded yet', hot: false },
    { label: 'Value traded', value: lakhs(totalValue), meta: filtered.length ? `across ${firms} firms` : '—', hot: false },
    { label: 'Brokerage earned', value: inr(Math.round(totalValue * 0.0025)), meta: 'placeholder until the model is set', hot: false },
    { label: 'Brokerage this month', value: inr(0), meta: 'placeholder until the model is set', hot: true },
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
      <div className="broker-grid">
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
          {pageItems.map((t) => (
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
          {filtered.length === 0 ? <EmptyState message="No trades yet — closed trades recorded this session appear here." /> : null}
        </div>
        {totalPages > 1 ? (
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-neutral-200)' }}>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={10}
              onPageChange={setPage}
            />
          </div>
        ) : null}
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
