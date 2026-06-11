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

  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData('jobId', jobId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) {
      updateJob(jobId, 'status', newStatus);
    }
  };

  const renderColumn = (title, status) => {
    const columnJobs = jobs.filter(j => j.status === status);
    return (
      <div 
        className="kanban-column glass-panel" 
        style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '280px', minHeight: '400px', border: '1px solid rgba(255,255,255,0.05)' }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getStatusIcon(status)} {title}
          </div>
          <span style={{ fontSize: '12px', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px' }}>{columnJobs.length}</span>
        </h4>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {columnJobs.map(job => {
            const percent = Math.min(100, Math.max(0, (job.producedQty / job.targetQty) * 100)) || 0;
            return (
              <div 
                key={job.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, job.id)}
                className="kanban-card magnetic-target"
                style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '1.25rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  cursor: 'grab',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="font-bold text-muted" style={{ fontSize: '12px' }}>{job.id}</span>
                  <span style={{ fontSize: '11px', background: 'rgba(118, 51, 255, 0.1)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                    {job.machine}
                  </span>
                </div>
                <div className="font-bold" style={{ fontSize: '15px' }}>{job.name}</div>
                <div className="text-muted" style={{ fontSize: '13px', marginBottom: '0.5rem' }}>Dept: {job.department}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ProductionInput job={job} updateJob={updateJob} />
                  <span className="text-muted" style={{ fontSize: '13px' }}>/ {job.targetQty.toLocaleString()}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ height: '100%', width: `${percent}%`, background: percent === 100 ? '#4ADE80' : 'var(--accent-gradient)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            );
          })}
          {columnJobs.length === 0 && (
            <div className="text-muted" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '13px', border: '1px dashed var(--border-color)', padding: '2rem', borderRadius: '8px' }}>
              Drop jobs here
            </div>
          )}
        </div>
      </div>
    );
  };

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

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Interactive Kanban Board</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '14px' }}>Drag and drop work orders between columns to instantly update their status.</p>
          
          <div className="kanban-board" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {renderColumn("Queued", "Queued")}
            {renderColumn("Running", "Running")}
            {renderColumn("Paused", "Paused")}
            {renderColumn("Completed", "Completed")}
          </div>
        </div>
      </div>
    </div>
  );
}
