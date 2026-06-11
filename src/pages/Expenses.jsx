import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useGlobalState } from '../context/GlobalState';
import { DollarSign, Plus, Trash2, Tag, TrendingDown, Calendar, X } from 'lucide-react';
import PromptModal from '../components/PromptModal';
import './Dashboard.css';

const EXPENSE_CATEGORIES = ['Raw Materials', 'Utilities', 'Salaries', 'Maintenance', 'Transport', 'Marketing', 'Office Supplies', 'Other'];
const STORAGE_KEY = 'PowerStik_Expenses';
const EMPTY_FORM = { description: '', amount: '', category: EXPENSE_CATEGORIES[0], date: new Date().toISOString().split('T')[0], notes: '' };

const loadExpenses = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

export default function Expenses() {
  const { globalConfig } = useGlobalState();
  const [expenses, setExpenses] = useState(() => loadExpenses());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');

  const cur = globalConfig.currency || '₹';

  const save = (newExpenses) => {
    setExpenses(newExpenses);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errs.amount = 'Valid amount is required';
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    const newExp = {
      id: `EXP-${Date.now()}`,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category || EXPENSE_CATEGORIES[0],
      date: formData.date || new Date().toISOString().split('T')[0],
      notes: formData.notes || '',
    };
    save([newExp, ...expenses]);
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (confirmDelete) save(expenses.filter(e => e.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const filtered = useMemo(() => expenses.filter(e => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterMonth && !e.date.startsWith(filterMonth)) return false;
    return true;
  }), [expenses, filterCategory, filterMonth]);

  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const maxCat = Math.max(...byCategory.map(([, v]) => v), 1);
  const catColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

  return (
    <div className="page-container animate-fade-in">

      {/* Add Expense Modal */}
      {isFormOpen && createPortal(
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsFormOpen(false); }}>
          <div className="modal-content animate-modal-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown size={18} style={{ color: '#ef4444' }} />
                Log New Expense
              </h3>
              <button className="icon-btn" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description *</label>
                <input className="form-input" placeholder="e.g. Monthly electricity bill" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} autoFocus />
                {formErrors.description && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{formErrors.description}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Amount ({cur}) *</label>
                  <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                  {formErrors.amount && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{formErrors.amount}</span>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="Any additional notes..." value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="modal-footer" style={{ marginTop: '0.25rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Log Expense</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirm */}
      <PromptModal
        isOpen={!!confirmDelete}
        type="confirm"
        title={`Delete "${confirmDelete?.description}"?`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <TrendingDown size={28} className="icon-accent" />
            Expense Tracker
          </h1>
          <p className="page-subtitle">Track and categorize all business expenses</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">{cur}{totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#6366f1' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <Tag size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Categories Used</span>
            <span className="stat-value">{byCategory.length}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
            <Calendar size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            By Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {byCategory.map(([cat, val], i) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: catColors[i % catColors.length], display: 'inline-block', flexShrink: 0 }} />
                    {cat}
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>{cur}{val.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(val / maxCat) * 100}%`, background: catColors[i % catColors.length], borderRadius: '3px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
            {byCategory.length === 0 && (
              <div style={{ opacity: 0.4, textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>
                No expenses logged yet
              </div>
            )}
          </div>
        </div>

        {/* Expense List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <select className="form-input" style={{ flex: 1, minWidth: '130px' }} value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="form-input" type="month" value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)} style={{ flex: 1 }} />
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filtered.length === 0 && (
              <div style={{ opacity: 0.4, textAlign: 'center', padding: '2.5rem', fontSize: '0.875rem' }}>
                No expenses match your filters
              </div>
            )}
            {filtered.map((exp, idx) => (
              <div key={exp.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0',
                borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: catColors[EXPENSE_CATEGORIES.indexOf(exp.category) % catColors.length]
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>{exp.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{exp.category}</span>
                    <span>·</span>
                    <span>{exp.date}</span>
                    {exp.notes && <><span>·</span><span style={{ fontStyle: 'italic' }}>{exp.notes}</span></>}
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem', flexShrink: 0 }}>
                  {cur}{exp.amount.toLocaleString('en-IN')}
                </span>
                <button onClick={() => setConfirmDelete(exp)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', transition: 'color 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
