import { useState, useEffect } from 'react';
import { Settings, Play, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import './Dashboard.css';

const ProductionInput = ({ job, updateJob }) => {
  const [val, setVal] = useState(job.producedQty);

  // Sync state if job updates externally
  useEffect(() => {
    setVal(job.producedQty);
  }, [job.producedQty]);

  const handleBlur = () => {
    updateJob(job.id, 'producedQty', Number(val));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBlur();
  };

  return (
    <input 
      type="number"
      min="0"
      max={job.targetQty}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        width: '80px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        padding: '4px',
        borderRadius: '4px',
        textAlign: 'right',
        fontWeight: 'bold'
      }}
    />
  );
};

export default function Production() {
  const { loading, productionJobs: jobs, updateProductionJob: updateJob } = useGlobalState();

  // Live efficiency: avg completion % across non-queued jobs
  const efficiencyJobs = jobs.filter(j => j.targetQty > 0);
  const liveEfficiency = efficiencyJobs.length > 0
    ? Math.round(efficiencyJobs.reduce((sum, j) => sum + Math.min(100, (j.producedQty / j.targetQty) * 100), 0) / efficiencyJobs.length)
    : 0;

  // State handling now managed in GlobalState.jsx
  // `updateJob` logic is completely offloaded to the context.

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Running': return <Play size={16} className="text-gradient" />;
      case 'Completed': return <CheckCircle2 size={16} color="#4ADE80" />;
      case 'Paused': return <AlertCircle size={16} color="#FACC15" />;
      default: return <Clock size={16} color="var(--text-muted)" />;
    }
  };

  if (loading) {
    return <div className="loading-state">Loading Production Floor Data...</div>;
  }

  const activeJobs = jobs.filter(j => j.status === 'Running' || j.status === 'Paused').length;
  const queuedJobs = jobs.filter(j => j.status === 'Queued').length;

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content" style={{ padding: '0' }}>
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Production Floor</h2>
            <p className="text-muted">Live monitoring and interactive status updates for active work orders.</p>
          </div>
          <button className="btn-secondary flex-center gap-2"><Settings size={16} /> Manage Machines</button>
        </header>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel stat-card" style={{ padding: '1rem' }}>
            <h3 className="text-muted">Active Work Orders</h3>
            <p className="font-bold text-2xl">{activeJobs}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1rem' }}>
            <h3 className="text-muted">Jobs in Queue</h3>
            <p className="font-bold text-2xl">{queuedJobs}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1rem' }}>
            <h3 className="text-muted">Efficiency Rate</h3>
            <p className="text-gradient font-bold text-2xl">{liveEfficiency}%</p>
          </div>
        </div>

        <div className="glass-panel widget" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Active Work Orders</h3>
          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Job Name</th>
                  <th>Department</th>
                  <th>Assigned Machine</th>
                  <th>Status</th>
                  <th>Production Qty (Produced / Target)</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  const percent = Math.min(100, Math.max(0, (job.producedQty / job.targetQty) * 100)) || 0;
                  
                  return (
                    <tr key={job.id}>
                      <td className="font-bold text-muted">{job.id}</td>
                      <td className="font-bold">{job.name}</td>
                      <td>{job.department}</td>
                      <td>{job.machine}</td>
                      <td>
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                          {getStatusIcon(job.status)}
                          <select 
                            value={job.status}
                            onChange={(e) => updateJob(job.id, 'status', e.target.value)}
                            style={{
                              background: 'transparent',
                              color: 'inherit',
                              border: '1px solid var(--border-color)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <option style={{ background: '#111' }} value="Queued">Queued</option>
                            <option style={{ background: '#111' }} value="Running">Running</option>
                            <option style={{ background: '#111' }} value="Paused">Paused</option>
                            <option style={{ background: '#111' }} value="Completed">Completed</option>
                          </select>
                        </div>
                      </td>
                      <td style={{ width: '320px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ProductionInput job={job} updateJob={updateJob} />
                            <span className="text-muted">/ {job.targetQty.toLocaleString()}</span>
                            <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                              {percent.toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ background: 'var(--bg-tertiary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              background: job.status === 'Completed' ? '#4ADE80' : 'var(--accent-gradient)', 
                              height: '100%', 
                              width: `${percent}%`,
                              transition: 'width 0.3s ease-in-out'
                            }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
