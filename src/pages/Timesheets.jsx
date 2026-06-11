import { useState, useMemo } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { Clock, Users, Plus, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import PromptModal from '../components/PromptModal';
import './Dashboard.css';

const SHIFTS = ['Morning (6AM–2PM)', 'Afternoon (2PM–10PM)', 'Night (10PM–6AM)'];

export default function Timesheets() {
  const { timesheets, addTimesheet, users, currentUser, globalConfig } = useGlobalState();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const openPrompt = (title, defaultValue, onConfirm) =>
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  const closeModal = () => setModalConfig(m => ({ ...m, isOpen: false }));
  const handleModalConfirm = (value) => {
    const cb = modalConfig.onConfirm;
    closeModal();
    if (cb) setTimeout(() => cb(value), 10);
  };

  const handleClockIn = () => {
    openPrompt('Select Employee ID:', currentUser?.id || '', (empId) => {
      if (!empId) return;
      openPrompt('Select Shift:', SHIFTS[0], (shift) => {
        addTimesheet({
          id: `TS-${Date.now()}`,
          empId,
          empName: users.find(u => u.id === empId)?.name || empId,
          date: new Date().toISOString().split('T')[0],
          shift: shift || SHIFTS[0],
          hoursWorked: 8,
          status: 'Present'
        });
      });
    });
  };

  const filtered = useMemo(() =>
    timesheets.filter(t => t.date.startsWith(selectedMonth)),
    [timesheets, selectedMonth]
  );

  const totalHours = filtered.reduce((s, t) => s + (t.hoursWorked || 0), 0);
  const presentDays = filtered.filter(t => t.status === 'Present').length;
  const absentDays = filtered.filter(t => t.status === 'Absent').length;

  const byEmployee = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      if (!map[t.empId]) map[t.empId] = { name: t.empName, total: 0, days: 0 };
      map[t.empId].total += t.hoursWorked || 0;
      map[t.empId].days += 1;
    });
    return Object.values(map);
  }, [filtered]);

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content">
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Employee Timesheets</h2>
            <p className="text-muted">Track attendance, shifts, and worked hours across all staff.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: 'auto' }}
            />
            <button className="btn-primary flex-center gap-2" onClick={handleClockIn}>
              <Plus size={16} /> Log Attendance
            </button>
          </div>
        </header>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-primary)' }}>
            <h3 className="text-muted">Total Hours Logged</h3>
            <p className="font-bold text-2xl text-gradient" style={{ marginTop: '0.5rem' }}>{totalHours}h</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #4ADE80' }}>
            <h3 className="text-muted">Present Days</h3>
            <p className="font-bold text-2xl" style={{ color: '#4ADE80', marginTop: '0.5rem' }}>{presentDays}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #f87171' }}>
            <h3 className="text-muted">Absent Days</h3>
            <p className="font-bold text-2xl" style={{ color: '#f87171', marginTop: '0.5rem' }}>{absentDays}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #a78bfa' }}>
            <h3 className="text-muted">Active Employees</h3>
            <p className="font-bold text-2xl" style={{ color: '#a78bfa', marginTop: '0.5rem' }}>{byEmployee.length}</p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
          {/* Employee Summary */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Users size={18} className="text-gradient" /> Hours by Employee
            </h3>
            {byEmployee.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No records for this month.</p>
            ) : byEmployee.map((emp, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="font-bold">{emp.name}</span>
                  <span className="text-muted" style={{ fontSize: '13px' }}>{emp.total}h / {emp.days} days</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (emp.total / (emp.days * 8)) * 100)}%`, background: 'var(--accent-gradient)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Log */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Calendar size={18} className="text-gradient" /> Recent Entries
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {filtered.slice(0, 10).length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No entries this month.</p>
              ) : filtered.slice(0, 10).map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div>
                    <p className="font-bold" style={{ fontSize: '13px', margin: 0 }}>{t.empName}</p>
                    <p className="text-muted" style={{ fontSize: '11px', margin: 0 }}>{t.date} · {t.shift}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                      background: t.status === 'Present' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: t.status === 'Present' ? '#4ADE80' : '#f87171'
                    }}>{t.status}</span>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '13px', margin: '2px 0 0' }}>{t.hoursWorked}h</p>
                  </div>
                </div>
              ))}
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
