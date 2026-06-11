import { useGlobalState } from '../context/GlobalState';
import { Clock, User, Activity, FileText, Package, Layers } from 'lucide-react';
import './Dashboard.css';

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const actionIcon = (action) => {
  if (action.toLowerCase().includes('login')) return <User size={14} />;
  if (action.toLowerCase().includes('invoice') || action.toLowerCase().includes('order')) return <FileText size={14} />;
  if (action.toLowerCase().includes('inventory') || action.toLowerCase().includes('stock')) return <Package size={14} />;
  if (action.toLowerCase().includes('production') || action.toLowerCase().includes('job')) return <Layers size={14} />;
  return <Activity size={14} />;
};

const actionColor = (action) => {
  if (action.toLowerCase().includes('login')) return '#6366f1';
  if (action.toLowerCase().includes('delete')) return '#ef4444';
  if (action.toLowerCase().includes('invoice') || action.toLowerCase().includes('payment')) return '#10b981';
  if (action.toLowerCase().includes('order')) return '#3b82f6';
  return '#f59e0b';
};

export default function ActivityTimeline() {
  const { activityLogs } = useGlobalState();

  // Group by date
  const grouped = activityLogs.reduce((acc, log) => {
    const date = log.time ? log.time.split('T')[0] : 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={28} className="icon-accent" />
            Activity Timeline
          </h1>
          <p className="page-subtitle">Full audit trail of all system events — last {activityLogs.length} actions</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sortedDates.map(date => (
          <div key={date}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '4px 12px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, color: '#6366f1' }}>
                {date === new Date().toISOString().split('T')[0] ? 'Today' : date}
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.72rem', opacity: 0.4 }}>{grouped[date].length} event{grouped[date].length !== 1 ? 's' : ''}</span>
            </div>

            <div style={{ position: 'relative', paddingLeft: '28px' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: '9px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, rgba(99,102,241,0.4), transparent)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {grouped[date].map((log, i) => {
                  const color = actionColor(log.action);
                  return (
                    <div key={log.id || i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', position: 'relative' }}>
                      {/* Dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-23px',
                        top: '10px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: `0 0 6px ${color}60`
                      }}>
                        {actionIcon(log.action)}
                      </div>

                      <div className="glass-panel" style={{ flex: 1, padding: '0.6rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{log.action}</div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.55, display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                            <User size={10} style={{ marginTop: '1px' }} />
                            <span>{log.user}</span>
                            {log.details && <><span>·</span><span>{log.details}</span></>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.5, fontSize: '0.72rem', flexShrink: 0 }}>
                          <Clock size={11} />
                          {log.time ? timeAgo(log.time) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {activityLogs.length === 0 && (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>
            <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No activity recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
