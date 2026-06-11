import { useState, useMemo } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { DollarSign, Plus, Trash2, Tag, TrendingDown, Calendar } from 'lucide-react';
import PromptModal from '../components/PromptModal';
import './Dashboard.css';

const EXPENSE_CATEGORIES = ['Raw Materials', 'Utilities', 'Salaries', 'Maintenance', 'Transport', 'Marketing', 'Office Supplies', 'Other'];

const STORAGE_KEY = 'PowerStik_Expenses';

const loadExpenses = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
};

export default function Expenses() {
  const [expenses, setExpenses] = useState(() => loadExpenses());
  const [modal, setModal] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');

  const save = (newExpenses) => {
    setExpenses(newExpenses);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
  };

  const addExpense = () => {
    setModal({
      title: 'Log New Expense',
      fields: [
        { name: 'description', label: 'Description', type: 'text' },
        { name: 'amount', label: 'Amount (₹)', type: 'number' },
        { name: 'category', label: 'Category', type: 'select', options: EXPENSE_CATEGORIES },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'notes', label: 'Notes (optional)', type: 'text' },
      ],
      onSubmit: (data) => {
        const newExp = {
          id: `EXP-${Date.now()}`,
          description: data.description,
          amount: parseFloat(data.amount) || 0,
          category: data.category || EXPENSE_CATEGORIES[0],
          date: data.date || new Date().toISOString().split('T')[0],
          notes: data.notes || '',
        };
        save([newExp, ...expenses]);
        setModal(null);
      },
      onCancel: () => setModal(null)
    });
  };

  const deleteExpense = (id) => {
    if (window.confirm('Delete this expense?')) {
      save(expenses.filter(e => e.id !== id));
    }
  };

  // Filter
  const filtered = useMemo(() => expenses.filter(e => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterMonth && !e.date.startsWith(filterMonth)) return false;
    return true;
  }), [expenses, filterCategory, filterMonth]);

  // Analytics
  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0);
  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const maxCat = Math.max(...byCategory.map(([, v]) => v), 1);

  const catColors = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6'];

  return (
    <div className="page-container">
      {modal && <PromptModal {...modal} />}

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingDown size={28} className="icon-accent" />
            Expense Tracker
          </h1>
          <p className="page-subtitle">Track and categorize all business expenses</p>
        </div>
        <button className="btn-primary" onClick={addExpense} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {/* KPI */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}><DollarSign size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">₹{totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #6366f1' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}><Tag size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">Categories</span>
            <span className="stat-value">{byCategory.length}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6' }}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}><Calendar size={18} /></div>
          <div className="stat-info">
            <span className="stat-label">Records</span>
            <span className="stat-value">{filtered.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600 }}>By Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {byCategory.map(([cat, val], i) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: catColors[i % catColors.length], display: 'inline-block' }} />
                    {cat}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>₹{val.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${(val / maxCat) * 100}%`, background: catColors[i % catColors.length], borderRadius: '3px' }} />
                </div>
              </div>
            ))}
            {byCategory.length === 0 && <div style={{ opacity: 0.4, textAlign: 'center', padding: '1rem' }}>No expenses logged yet</div>}
          </div>
        </div>

        {/* Filters + Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <select className="form-input" style={{ flex: 1, minWidth: '120px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="form-input" type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ flex: 1 }} />
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {filtered.length === 0 && <div style={{ opacity: 0.4, textAlign: 'center', padding: '2rem' }}>No expenses match your filters</div>}
            {filtered.map(exp => (
              <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{exp.description}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', gap: '0.5rem' }}>
                    <span>{exp.category}</span>
                    <span>·</span>
                    <span>{exp.date}</span>
                    {exp.notes && <><span>·</span><span>{exp.notes}</span></>}
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem' }}>₹{exp.amount.toLocaleString('en-IN')}</span>
                <button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
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
