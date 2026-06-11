import { useMemo } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { TrendingUp, Users, Package, DollarSign, BarChart2, PieChart, Award, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

export default function Analytics() {
  const { invoices, clients, productionJobs, inventory } = useGlobalState();

  // Revenue by month
  const revenueByMonth = useMemo(() => {
    const months = {};
    invoices.forEach(inv => {
      const month = inv.date ? inv.date.substring(0, 7) : 'Unknown';
      months[month] = (months[month] || 0) + inv.amount;
    });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  }, [invoices]);

  const maxRevenue = Math.max(...revenueByMonth.map(([, v]) => v), 1);

  // Revenue by client
  const revenueByClient = useMemo(() => {
    const map = {};
    invoices.forEach(inv => {
      map[inv.client] = (map[inv.client] || 0) + inv.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [invoices]);

  const maxClient = Math.max(...revenueByClient.map(([, v]) => v), 1);

  // KPIs
  const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const pendingRevenue = totalRevenue - totalCollected;
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
  const completedJobs = productionJobs.filter(j => j.status === 'QC & Ready' || j.status === 'Completed').length;
  const criticalItems = inventory.filter(i => i.status === 'Critical').length;

  // Production stage breakdown
  const stages = ['Pre-Press', 'Printing', 'Post-Press', 'QC & Ready'];
  const stageData = stages.map(s => ({
    stage: s,
    count: productionJobs.filter(j => j.status === s).length
  }));

  const stageColors = {
    'Pre-Press': '#6366f1',
    'Printing': '#3b82f6',
    'Post-Press': '#f59e0b',
    'QC & Ready': '#10b981',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Insights</h1>
          <p className="page-subtitle">Business intelligence at a glance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid #10b981' }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><DollarSign size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6' }}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}><TrendingUp size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Collected</span>
            <span className="stat-value">₹{totalCollected.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}><AlertTriangle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Outstanding</span>
            <span className="stat-value">₹{pendingRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}><AlertTriangle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Overdue Invoices</span>
            <span className="stat-value">{overdueCount}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #8b5cf6' }}>
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}><Package size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Jobs Completed</span>
            <span className="stat-value">{completedJobs}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #ec4899' }}>
          <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Active Clients</span>
            <span className="stat-value">{clients.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Revenue Trend Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart2 size={18} className="icon-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Revenue Trend (Last 6 Months)</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '180px', padding: '0 0.5rem' }}>
            {revenueByMonth.map(([month, val]) => (
              <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>₹{(val/1000).toFixed(0)}k</span>
                <div style={{
                  width: '100%',
                  height: `${(val / maxRevenue) * 140}px`,
                  background: 'linear-gradient(180deg, #6366f1, #3b82f6)',
                  borderRadius: '6px 6px 0 0',
                  minHeight: '8px',
                  transition: 'height 0.5s ease'
                }} />
                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{month.substring(5)}</span>
              </div>
            ))}
            {revenueByMonth.length === 0 && (
              <div style={{ width: '100%', textAlign: 'center', opacity: 0.4, paddingTop: '60px' }}>No data yet</div>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Award size={18} className="icon-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Top Clients by Revenue</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {revenueByClient.map(([name, val], i) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ 
                      width: '20px', height: '20px', borderRadius: '50%', 
                      background: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ec4899'][i],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, flexShrink: 0
                    }}>{i + 1}</span>
                    {name}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.9 }}>₹{val.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%',
                    width: `${(val / maxClient) * 100}%`,
                    background: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ec4899'][i],
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
            {revenueByClient.length === 0 && <div style={{ opacity: 0.4, textAlign: 'center' }}>No client data</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Production Stage Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PieChart size={18} className="icon-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Production Stage Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stageData.map(({ stage, count }) => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: stageColors[stage], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.85rem' }}>{stage}</span>
                <div style={{ flex: 2, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{
                    height: '100%',
                    width: `${productionJobs.length ? (count / productionJobs.length) * 100 : 0}%`,
                    background: stageColors[stage],
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '24px', textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Health */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Package size={18} className="icon-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Inventory Health</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'In Stock', status: 'In Stock', color: '#10b981' },
              { label: 'Low Stock', status: 'Low Stock', color: '#f59e0b' },
              { label: 'Critical', status: 'Critical', color: '#ef4444' },
            ].map(({ label, status, color }) => {
              const count = inventory.filter(i => i.status === status).length;
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.85rem' }}>{label}</span>
                  <div style={{ flex: 2, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                    <div style={{
                      height: '100%',
                      width: `${inventory.length ? (count / inventory.length) * 100 : 0}%`,
                      background: color,
                      borderRadius: '4px'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '24px', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
            {criticalItems > 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.8rem', color: '#ef4444' }}>
                ⚠️ {criticalItems} item(s) critically low — reorder immediately
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
