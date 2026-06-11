import { useState, useMemo } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { Activity, Clock, Box, TrendingUp, IndianRupee, CheckCircle, AlertTriangle, Shield, Play, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PromptModal from '../components/PromptModal';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, productionJobs, inventory, invoices, activityLogs, updateProductionJob, logActivity, globalConfig } = useGlobalState();
  const [selectedRoleView, setSelectedRoleView] = useState(currentUser?.role || 'employee');

  const activeJobs = productionJobs.filter(j => j.status === 'Running' || j.status === 'Queued');
  const criticalItems = inventory.filter(i => i.status === 'Critical');
  const outstandingInvoices = invoices.filter(i => i.amount > (i.amountPaid || 0));
  
  const totalRevenue = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
  const totalPending = invoices.reduce((sum, i) => sum + (i.amount - (i.amountPaid || 0)), 0);

  // Financial Chart Data (Revenue by Month)
  const chartData = useMemo(() => {
    const monthlyData = {};
    invoices.forEach(inv => {
      if (inv.date) {
        const date = new Date(inv.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
        monthlyData[monthYear] += (inv.amountPaid || 0);
      }
    });

    const data = Object.keys(monthlyData).map(month => ({
      name: month,
      revenue: monthlyData[month]
    }));
    
    return data.length > 0 ? data : [{ name: 'No Data', revenue: 0 }];
  }, [invoices]);

  // Sales Leaderboard
  const leaderboard = useMemo(() => {
    const reps = {};
    invoices.forEach(inv => {
      const rep = inv.salesRep || inv.client;
      if (!reps[rep]) reps[rep] = { name: rep, revenue: 0, deals: 0 };
      reps[rep].revenue += inv.amount;
      reps[rep].deals += 1;
    });
    return Object.values(reps).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [invoices]);

  // My Tasks logic
  const myJobs = useMemo(() => {
    if (currentUser?.role === 'production') {
      return productionJobs.filter(j => j.status !== 'Completed').slice(0, 5);
    }
    return activeJobs.slice(0, 5);
  }, [productionJobs, currentUser]);

  const handleStartJob = (jobId) => {
    updateProductionJob(jobId, 'status', 'Running');
    logActivity(`Started Job ${jobId}`);
  };

  const handleCompleteJob = (jobId) => {
    updateProductionJob(jobId, 'status', 'Completed');
    logActivity(`Completed Job ${jobId}`);
  };

  // Modal State for Quick Actions
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });

  const openPrompt = (title, defaultValue, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  };
  const openAlert = (title, onConfirm = null) => {
    setModalConfig({ isOpen: true, type: 'alert', title, onConfirm });
  };
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleModalConfirm = (value) => {
    const callback = modalConfig.onConfirm;
    closeModal();
    if (callback) {
      setTimeout(() => callback(value), 10);
    }
  };

  const handleLogMachineStatus = () => {
    openPrompt("Enter Machine Status (e.g., 'Heidelberg paused for maintenance'):", "", (statusText) => {
      if (statusText) {
        logActivity('Machine Status Update', statusText);
        openAlert('✅ Status logged successfully! The Admin will see this on their dashboard.');
      }
    });
  };

  const handleRequestMaterial = () => {
    openPrompt("What raw material do you need?", "e.g., 500 Kgs Glossy Paper", (requestText) => {
      if (requestText) {
        logActivity('Material Request', requestText);
        openAlert('✅ Material request sent to Admin!');
      }
    });
  };

  // -------------------------------------------------------------
  // ADMIN (OWNER) DASHBOARD
  // -------------------------------------------------------------
  if (currentUser?.role === 'admin') {
    return (
      <div className="dashboard-layout animate-fade-in">
        <div className="dashboard-content">
          <header className="dashboard-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <div>
              <h2 className="text-gradient">Owner Portal</h2>
              <p className="text-muted">High-level financial overview and system activity.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ background: 'rgba(0, 123, 255, 0.1)', color: '#007bff', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} /> Admin Mode
              </span>
            </div>
          </header>

          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #4ADE80' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} className="text-gradient" /> Total Revenue
                </h3>
              </div>
              <p className="font-bold text-2xl" style={{ color: '#4ADE80', marginTop: '0.5rem' }}>{globalConfig.currency}{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #ffcb05' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IndianRupee size={18} color="#ffcb05" /> Pending Payments
                </h3>
              </div>
              <p className="font-bold text-2xl" style={{ color: '#ffcb05', marginTop: '0.5rem' }}>{globalConfig.currency}{totalPending.toLocaleString('en-IN')}</p>
            </div>

            <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-primary)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-muted">Active Production Jobs</h3>
                <Activity size={20} color="var(--accent-primary)" />
              </div>
              <p className="font-bold text-2xl" style={{ marginTop: '0.5rem' }}>{activeJobs.length}</p>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '2rem' }}>
            {/* Financial Overview Chart */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} className="text-gradient" /> Financial Cash Flow (Live)
              </h3>
              <div style={{ height: '280px', width: '100%', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${globalConfig.currency}${(value / 1000)}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                      formatter={(value) => [`${globalConfig.currency}${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#4ADE80" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Activity Log */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#007bff" /> System Activity Audit
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                {activityLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#007bff', marginTop: '6px' }}></div>
                    <div>
                      <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{log.user}</span> {log.action}
                      </p>
                      {log.details && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.details}</p>}
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(log.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Leaderboard */}
          <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="#f59e0b" /> Sales Leaderboard
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No invoice data available yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {leaderboard.map((rep, idx) => {
                  const rankColors = ['#f59e0b', '#9ca3af', '#cd7c3f'];
                  const rankColor = rankColors[idx] || 'var(--text-muted)';
                  const rankLabel = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                  return (
                    <div key={rep.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: '10px', border: `1px solid ${idx < 3 ? rankColor + '44' : 'var(--border-color)'}` }}>
                      <span style={{ fontSize: idx < 3 ? '1.5rem' : '1rem', minWidth: '2rem', textAlign: 'center', fontWeight: 'bold', color: rankColor }}>{rankLabel}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1rem', color: idx < 3 ? rankColor : 'var(--text-primary)' }}>{rep.name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{rep.deals} deal{rep.deals !== 1 ? 's' : ''} closed</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#4ade80' }}>{globalConfig.currency}{rep.revenue.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>total revenue</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPLOYEE PORTAL (Production/Design/Sales)
  // -------------------------------------------------------------
  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content">
        <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <h2>Welcome back, {currentUser?.name}</h2>
          <p className="text-muted">Here are your pending tasks and quick actions for today.</p>
        </header>

        <div className="grid-2" style={{ gap: '2rem' }}>
          {/* My Tasks Section */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} className="text-gradient" /> My Assigned Tasks
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myJobs.length === 0 ? (
                <p className="text-muted" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  No pending tasks! Great job.
                </p>
              ) : (
                myJobs.map(job => (
                  <div key={job.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{job.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.id} • {job.machine}</p>
                    </div>
                    <div>
                      {job.status === 'Queued' ? (
                        <button className="icon-btn" onClick={() => handleStartJob(job.id)} title="Start Job" style={{ background: 'rgba(0,123,255,0.1)' }}>
                          <Play size={16} color="#007bff" />
                        </button>
                      ) : job.status === 'Running' ? (
                        <button className="icon-btn" onClick={() => handleCompleteJob(job.id)} title="Complete Job" style={{ background: 'rgba(74,222,128,0.1)' }}>
                          <CheckCircle size={16} color="#4ADE80" />
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.status}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info & Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#f87171" /> Action Required Alerts
              </h3>
              
              {criticalItems.length > 0 ? (
                <div style={{ background: 'rgba(248, 113, 113, 0.1)', borderLeft: '4px solid #f87171', padding: '1rem', borderRadius: '4px' }}>
                  <p style={{ fontWeight: 'bold', color: '#f87171', marginBottom: '8px' }}>Critical Inventory Warning</p>
                  <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingLeft: '1.2rem', margin: 0 }}>
                    {criticalItems.map(item => (
                      <li key={item.id} style={{ marginBottom: '4px' }}>{item.name} is critically low ({item.stock} {item.unit})</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted">All systems optimal. No alerts.</p>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box size={20} color="var(--accent-primary)" /> Quick Shortcuts
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="btn-secondary" onClick={handleLogMachineStatus} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1px solid rgba(118,51,255,0.2)' }}>
                  <Activity size={24} color="var(--accent-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Log Machine Status</span>
                </button>
                <button className="btn-secondary" onClick={handleRequestMaterial} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1px solid rgba(118,51,255,0.2)' }}>
                  <Box size={24} color="var(--accent-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Request Raw Material</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      <PromptModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        defaultValue={modalConfig.defaultValue}
        onConfirm={handleModalConfirm}
        onClose={closeModal}
      />
    </div>
  );
}
