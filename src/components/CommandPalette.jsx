import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalState';
import { Search, X, LayoutDashboard, ShoppingCart, Palette, Factory, Package, Users, FileText, BarChart2, Shield, Zap } from 'lucide-react';
import './CommandPalette.css';

const NAV_COMMANDS = [
  { label: 'Go to Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Navigate' },
  { label: 'Go to Sales Orders', path: '/sales-order', icon: ShoppingCart, category: 'Navigate' },
  { label: 'Go to Artwork Board', path: '/artwork', icon: Palette, category: 'Navigate' },
  { label: 'Go to Production Floor', path: '/production', icon: Factory, category: 'Navigate' },
  { label: 'Go to Inventory', path: '/inventory', icon: Package, category: 'Navigate' },
  { label: 'Go to Clients (CRM)', path: '/clients', icon: Users, category: 'Navigate', requireAdmin: true },
  { label: 'Go to Billing', path: '/billing', icon: FileText, category: 'Navigate', requireAdmin: true },
  { label: 'Go to Reports', path: '/reports', icon: BarChart2, category: 'Navigate', requireAdmin: true },
  { label: 'Go to Admin Portal', path: '/admin', icon: Shield, category: 'Navigate', requireAdmin: true },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { invoices, clients, productionJobs, currentUser } = useGlobalState();
  const isAdmin = currentUser?.role === 'admin';

  // Build dynamic results from data
  const getResults = useCallback(() => {
    const q = query.toLowerCase().trim();
    const allCommands = [];

    // Navigation commands
    NAV_COMMANDS.filter(c => !c.requireAdmin || isAdmin).forEach(cmd => {
      if (!q || cmd.label.toLowerCase().includes(q)) {
        allCommands.push({ ...cmd, type: 'nav' });
      }
    });

    if (q.length >= 2) {
      // Search invoices
      invoices.filter(inv =>
        inv.id.toLowerCase().includes(q) || inv.client.toLowerCase().includes(q)
      ).slice(0, 4).forEach(inv => {
        allCommands.push({
          label: `Invoice ${inv.id} — ${inv.client}`,
          sublabel: `₹${inv.amount.toLocaleString('en-IN')} · ${inv.status}`,
          path: '/billing',
          icon: FileText,
          category: 'Invoice',
          type: 'data'
        });
      });

      // Search clients
      clients.filter(c =>
        c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      ).slice(0, 4).forEach(client => {
        allCommands.push({
          label: client.name,
          sublabel: client.email,
          path: '/clients',
          icon: Users,
          category: 'Client',
          type: 'data'
        });
      });

      // Search production jobs
      productionJobs.filter(j =>
        j.id.toLowerCase().includes(q) || j.name.toLowerCase().includes(q)
      ).slice(0, 4).forEach(job => {
        allCommands.push({
          label: `${job.id} — ${job.name}`,
          sublabel: `${job.status} · ${job.department}`,
          path: '/production',
          icon: Factory,
          category: 'Work Order',
          type: 'data'
        });
      });
    }

    return allCommands.slice(0, 12);
  }, [query, invoices, clients, productionJobs, isAdmin]);

  const results = getResults();

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Arrow key navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].path);
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    navigate(item.path);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  let lastCategory = null;

  return (
    <div className="cp-overlay" onClick={() => setIsOpen(false)}>
      <div className="cp-modal glass-panel" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="cp-search-row">
          <Search size={18} className="cp-search-icon" />
          <input
            ref={inputRef}
            className="cp-input"
            placeholder="Search pages, invoices, clients, work orders..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <button className="cp-close" onClick={() => setIsOpen(false)}><X size={16} /></button>
        </div>

        {/* Results */}
        <div className="cp-results">
          {results.length === 0 && (
            <div className="cp-empty">No results found for "{query}"</div>
          )}
          {results.map((item, idx) => {
            const Icon = item.icon;
            const showCategory = item.category !== lastCategory;
            lastCategory = item.category;
            return (
              <div key={idx}>
                {showCategory && <div className="cp-category-label">{item.category}</div>}
                <button
                  className={`cp-result-item ${idx === selectedIndex ? 'cp-selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="cp-result-icon"><Icon size={16} /></span>
                  <span className="cp-result-text">
                    <span className="cp-result-label">{item.label}</span>
                    {item.sublabel && <span className="cp-result-sublabel">{item.sublabel}</span>}
                  </span>
                  {item.type === 'nav' && <span className="cp-result-hint"><Zap size={12} /> Jump</span>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="cp-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
