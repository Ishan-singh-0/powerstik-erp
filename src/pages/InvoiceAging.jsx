import { useState, useMemo } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Filter, Layers } from 'lucide-react';
import './Dashboard.css';

const AGING_BUCKETS = [
  { label: '0–30 days', min: 0, max: 30, color: '#10b981' },
  { label: '31–60 days', min: 31, max: 60, color: '#f59e0b' },
  { label: '61–90 days', min: 61, max: 90, color: '#ef4444' },
  { label: '90+ days', min: 91, max: Infinity, color: '#7f1d1d' },
];

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function InvoiceAging() {
  const { invoices, clients } = useGlobalState();
  const [filterBucket, setFilterBucket] = useState('all');

  // Only show unpaid invoices
  const unpaid = invoices.filter(i => i.status !== 'Paid');

  const withAging = useMemo(() => unpaid.map(inv => ({
    ...inv,
    daysOld: daysSince(inv.date),
    balance: inv.amount - (inv.amountPaid || 0),
  })), [unpaid]);

  const getBucket = (days) => AGING_BUCKETS.find(b => days >= b.min && days <= b.max) || AGING_BUCKETS[3];

  const filtered = filterBucket === 'all'
    ? withAging
    : withAging.filter(inv => {
        const b = getBucket(inv.daysOld);
        return b.label === filterBucket;
      });

  // Summary by bucket
  const summary = AGING_BUCKETS.map(bucket => ({
    ...bucket,
    invoices: withAging.filter(inv => {
      const b = getBucket(inv.daysOld);
      return b.label === bucket.label;
    }),
    total: withAging.filter(inv => {
      const b = getBucket(inv.daysOld);
      return b.label === bucket.label;
    }).reduce((s, i) => s + i.balance, 0)
  }));

  const grandTotal = withAging.reduce((s, i) => s + i.balance, 0);

  // Client-wise outstanding
  const byClient = useMemo(() => {
    const map = {};
    withAging.forEach(inv => {
      if (!map[inv.client]) map[inv.client] = { name: inv.client, total: 0, count: 0, oldest: 0 };
      map[inv.client].total += inv.balance;
      map[inv.client].count += 1;
      map[inv.client].oldest = Math.max(map[inv.client].oldest, inv.daysOld);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [withAging]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClipboardList size={28} className="icon-accent" />
            Invoice Aging Report
          </h1>
          <p className="page-subtitle">Track overdue invoices by age — identify high-risk collections</p>
        </div>
      </div>

      {/* Aging Buckets Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {summary.map(bucket => (
          <div
            key={bucket.label}
            className="stat-card"
            style={{ borderLeft: `3px solid ${bucket.color}`, cursor: 'pointer', outline: filterBucket === bucket.label ? `2px solid ${bucket.color}` : 'none' }}
            onClick={() => setFilterBucket(filterBucket === bucket.label ? 'all' : bucket.label)}
          >
            <div className="stat-icon" style={{ background: `${bucket.color}20`, color: bucket.color }}>
              <Clock size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{bucket.label}</span>
              <span className="stat-value">₹{bucket.total.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>{bucket.invoices.length} invoice{bucket.invoices.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Client-wise Outstanding */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600 }}>Client-wise Outstanding</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {byClient.map((c, i) => {
              const risk = c.oldest > 90 ? '#7f1d1d' : c.oldest > 60 ? '#ef4444' : c.oldest > 30 ? '#f59e0b' : '#10b981';
              return (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${risk}30`, color: risk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.6 }}>{c.count} inv · oldest {c.oldest} days</div>
                  </div>
                  <span style={{ fontWeight: 700, color: risk, fontSize: '0.85rem' }}>₹{c.total.toLocaleString('en-IN')}</span>
                </div>
              );
            })}
            {byClient.length === 0 && <div style={{ opacity: 0.4, textAlign: 'center', padding: '1.5rem' }}>No outstanding invoices 🎉</div>}
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Outstanding</span>
            <span style={{ fontWeight: 700, color: '#6366f1' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Invoice Detail Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Layers size={16} className="icon-accent" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Invoice Details</h3>
            {filterBucket !== 'all' && (
              <button onClick={() => setFilterBucket('all')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.6, color: 'inherit' }}>
                Clear Filter
              </button>
            )}
          </div>
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Balance</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const b = getBucket(inv.daysOld);
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.id}</td>
                      <td>{inv.client}</td>
                      <td style={{ fontWeight: 600, color: b.color }}>₹{inv.balance.toLocaleString('en-IN')}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', background: `${b.color}20`, color: b.color, fontSize: '0.75rem', fontWeight: 600 }}>
                          {inv.daysOld}d
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', opacity: 0.4, padding: '2rem' }}>No invoices</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
