import { useState, useMemo } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { Bell, CheckCircle, AlertTriangle, Info, Zap, Trash2, X } from 'lucide-react';
import './Dashboard.css';

export default function Notifications() {
  const { alerts, invoices, productionJobs, inventory, dismissAlert } = useGlobalState();
  const [filter, setFilter] = useState('all');

  // Auto-generate smart alerts based on data
  const smartAlerts = useMemo(() => {
    const generated = [];

    // Overdue invoices
    invoices.filter(i => i.status === 'Overdue').forEach(inv => {
      generated.push({
        id: `smart-inv-${inv.id}`,
        type: 'warning',
        message: `Invoice ${inv.id} for ${inv.client} is OVERDUE (₹${inv.amount.toLocaleString('en-IN')})`,
        source: 'Smart Alert',
        auto: true
      });
    });

    // Critical inventory
    inventory.filter(i => i.status === 'Critical').forEach(item => {
      generated.push({
        id: `smart-inv-${item.id}`,
        type: 'critical',
        message: `${item.name} stock is CRITICAL — only ${item.stock} ${item.unit} remaining`,
        source: 'Smart Alert',
        auto: true
      });
    });

    // Jobs stuck in Pre-Press
    productionJobs.filter(j => j.status === 'Pre-Press').forEach(job => {
      generated.push({
        id: `smart-job-${job.id}`,
        type: 'info',
        message: `Work order ${job.id} (${job.name}) is still in Pre-Press — awaiting artwork approval`,
        source: 'Smart Alert',
        auto: true
      });
    });

    return generated;
  }, [invoices, inventory, productionJobs]);

  const allAlerts = [...smartAlerts, ...alerts.map(a => ({ ...a, auto: false, source: 'System' }))];

  const filtered = filter === 'all' ? allAlerts : allAlerts.filter(a => a.type === filter);

  const typeIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle size={16} color="#ef4444" />;
      case 'warning': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      default: return <Info size={16} color="#3b82f6" />;
    }
  };

  const typeBorder = (type) => {
    switch (type) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={28} className="icon-accent" />
            Notification Center
          </h1>
          <p className="page-subtitle">{allAlerts.length} active alert{allAlerts.length !== 1 ? 's' : ''} — including smart auto-generated alerts</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'critical', 'warning', 'success', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
          >
            {f === 'all' ? `All (${allAlerts.length})` : f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
            <CheckCircle size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No alerts in this category</p>
          </div>
        )}

        {filtered.map(alert => (
          <div
            key={alert.id}
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderLeft: `3px solid ${typeBorder(alert.type)}`,
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div style={{ flexShrink: 0 }}>{typeIcon(alert.type)}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{alert.message}</p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.5 }}>{alert.source}</span>
                {alert.auto && (
                  <span style={{ fontSize: '0.72rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Zap size={10} /> Auto-generated
                  </span>
                )}
              </div>
            </div>
            {!alert.auto && (
              <button
                onClick={() => dismissAlert(alert.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px' }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600 }}>Legend:</span>
        {[['critical','#ef4444','Critical — Immediate action'], ['warning','#f59e0b','Warning — Review needed'], ['success','#10b981','Success — Informational'], ['info','#3b82f6','Info — FYI']].map(([t, c, l]) => (
          <span key={t} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, display: 'inline-block' }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
