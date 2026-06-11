import { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { GlobalProvider, useGlobalState } from './context/GlobalState';
import {
  Moon, Sun, Menu, X, Search, ChevronDown,
  LayoutDashboard, ShoppingCart, Palette, Factory, Package,
  Users, CreditCard, Truck, Clock, BarChart2, TrendingUp,
  FileText, TrendingDown, Bell, AlignLeft, StickyNote, Activity,
  Settings, LogOut, Zap
} from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesOrderEntry from './pages/SalesOrderEntry';
import Inventory from './pages/Inventory';
import Production from './pages/Production';
import Billing from './pages/Billing';
import Artwork from './pages/Artwork';
import Reports from './pages/Reports';
import Clients from './pages/Clients';
import Admin from './pages/Admin';
import Welcome from './pages/Welcome';
import PurchaseOrders from './pages/PurchaseOrders';
import Timesheets from './pages/Timesheets';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import ClientStatement from './pages/ClientStatement';
import Expenses from './pages/Expenses';
import InvoiceAging from './pages/InvoiceAging';
import ActivityTimeline from './pages/ActivityTimeline';
import QuickNotes from './pages/QuickNotes';
import ButtermaxCursor from './components/ButtermaxCursor';
import AIAssistant from './components/AIAssistant';
import CommandPalette from './components/CommandPalette';
import './App.css';

// ─── Nav Groups ────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Operations',
    icon: <Factory size={14} />,
    links: [
      { to: '/sales-order', label: 'Sales Orders', icon: <ShoppingCart size={15} />, desc: 'Create & manage orders' },
      { to: '/artwork', label: 'Artwork', icon: <Palette size={15} />, desc: 'Design & artwork board' },
      { to: '/production', label: 'Production', icon: <Factory size={15} />, desc: '4-stage job board' },
      { to: '/inventory', label: 'Inventory', icon: <Package size={15} />, desc: 'Stock & materials' },
    ]
  },
  {
    label: 'Finance',
    icon: <CreditCard size={14} />,
    adminOnly: true,
    links: [
      { to: '/billing', label: 'Billing', icon: <CreditCard size={15} />, desc: 'Invoices & payments' },
      { to: '/purchase-orders', label: 'Purchases', icon: <Truck size={15} />, desc: 'Vendor purchase orders' },
      { to: '/expenses', label: 'Expenses', icon: <TrendingDown size={15} />, desc: 'Track business costs' },
      { to: '/invoice-aging', label: 'Aging Report', icon: <AlignLeft size={15} />, desc: 'Overdue collections' },
      { to: '/client-statement', label: 'Statements', icon: <FileText size={15} />, desc: 'Client account PDF' },
    ]
  },
  {
    label: 'People',
    icon: <Users size={14} />,
    adminOnly: true,
    links: [
      { to: '/clients', label: 'Clients', icon: <Users size={15} />, desc: 'CRM & contacts' },
      { to: '/timesheets', label: 'Timesheets', icon: <Clock size={15} />, desc: 'Employee attendance' },
    ]
  },
  {
    label: 'Intelligence',
    icon: <TrendingUp size={14} />,
    adminOnly: true,
    links: [
      { to: '/analytics', label: 'Analytics', icon: <BarChart2 size={15} />, desc: 'Revenue & insights' },
      { to: '/reports', label: 'Reports', icon: <TrendingUp size={15} />, desc: 'Business reports' },
      { to: '/notifications', label: 'Alerts', icon: <Bell size={15} />, desc: 'Smart notifications' },
      { to: '/activity', label: 'Activity Log', icon: <Activity size={15} />, desc: 'Audit trail' },
    ]
  },
];

// ─── Dropdown Menu ─────────────────────────────────────────────────────────────
function NavDropdown({ group, location, onClose }) {
  const isActive = group.links.some(l => location.pathname === l.to);

  return (
    <div className="nav-dropdown-wrapper">
      <button className={`nav-dropdown-trigger ${isActive ? 'active-nav' : ''}`}>
        {group.icon}
        {group.label}
        <ChevronDown size={12} className="chevron" />
      </button>
      <div className="nav-dropdown-panel">
        <div className="nav-dropdown-header">{group.label}</div>
        <div className="nav-dropdown-items">
          {group.links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-dropdown-item ${location.pathname === link.to ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="ndi-icon">{link.icon}</span>
              <span className="ndi-text">
                <span className="ndi-label">{link.label}</span>
                <span className="ndi-desc">{link.desc}</span>
              </span>
              {location.pathname === link.to && <span className="ndi-dot" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────────
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('PowerStik_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('PowerStik_theme', theme);
  }, [theme]);

  return (
    <GlobalProvider>
      <Router>
        <ButtermaxCursor />
        <div className="noise-overlay" />
        <div className="fluid-bg" />
        <AppContent theme={theme} setTheme={setTheme} />
      </Router>
    </GlobalProvider>
  );
}

function AppContent({ theme, setTheme }) {
  const location = useLocation();
  const { currentUser, logout } = useGlobalState();
  const isFullscreenPage = location.pathname === '/' || location.pathname === '/login';
  const isAdmin = currentUser?.role === 'admin';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ProtectedRoute = ({ children, requireAdmin }) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
  };

  const visibleGroups = NAV_GROUPS.filter(g => !g.adminOnly || isAdmin);

  return (
    <div className="app-container">
      {!isFullscreenPage && (
        <nav className="premium-navbar">
          <div className="navbar-inner">
            {/* Logo */}
            <Link to="/dashboard" className="navbar-logo" onClick={() => setMobileOpen(false)}>
              <img
                src={`${import.meta.env.BASE_URL}powerstik-logo.png`}
                alt="PowerStik"
                style={{ height: '26px', objectFit: 'contain', filter: 'brightness(1.1)' }}
              />
            </Link>

            {/* Desktop nav groups */}
            <div className="navbar-center">
              <Link
                to="/dashboard"
                className={`nav-pill ${location.pathname === '/dashboard' ? 'active-nav' : ''}`}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>

              {visibleGroups.map(group => (
                <NavDropdown
                  key={group.label}
                  group={group}
                  location={location}
                  onClose={() => setMobileOpen(false)}
                />
              ))}

              <Link
                to="/notes"
                className={`nav-pill ${location.pathname === '/notes' ? 'active-nav' : ''}`}
              >
                <StickyNote size={14} />
                Notes
              </Link>
            </div>

            {/* Right actions */}
            <div className="navbar-right">
              {/* Ctrl+K Search */}
              <button
                className="navbar-search-btn"
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
                title="Command Palette (Ctrl+K)"
              >
                <Search size={14} />
                <span>Search</span>
                <kbd>⌘K</kbd>
              </button>

              {/* Theme toggle */}
              <button
                className="navbar-icon-btn"
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* User menu */}
              {currentUser && (
                <div className="navbar-user-menu" ref={userMenuRef}>
                  <button
                    className="navbar-user-btn"
                    onClick={() => setUserMenuOpen(o => !o)}
                  >
                    <div className="navbar-avatar">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="navbar-username">{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown size={12} style={{ opacity: 0.6 }} />
                  </button>

                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <div className="user-dropdown-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.name}</div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.5, textTransform: 'capitalize' }}>{currentUser.role}</div>
                        </div>
                      </div>
                      <div className="user-dropdown-divider" />
                      {isAdmin && (
                        <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                          <Settings size={14} /> Admin Portal
                        </Link>
                      )}
                      <button
                        className="user-dropdown-item danger"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="navbar-icon-btn mobile-only"
                onClick={() => setMobileOpen(o => !o)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="mobile-nav-panel">
              <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              {visibleGroups.flatMap(g => g.links).map(link => (
                <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  {link.icon} {link.label}
                </Link>
              ))}
              <Link to="/notes" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                <StickyNote size={16} /> Notes
              </Link>
              {currentUser && (
                <button className="mobile-nav-link danger" onClick={() => { logout(); setMobileOpen(false); }}>
                  <LogOut size={16} /> Sign Out
                </button>
              )}
            </div>
          )}
        </nav>
      )}

      <main className={isFullscreenPage ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/sales-order" element={<ProtectedRoute><SalesOrderEntry /></ProtectedRoute>} />
          <Route path="/artwork" element={<ProtectedRoute><Artwork /></ProtectedRoute>} />
          <Route path="/production" element={<ProtectedRoute><Production /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute requireAdmin><Clients /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute requireAdmin><Billing /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute requireAdmin><Reports /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
          <Route path="/purchase-orders" element={<ProtectedRoute requireAdmin><PurchaseOrders /></ProtectedRoute>} />
          <Route path="/timesheets" element={<ProtectedRoute requireAdmin><Timesheets /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute requireAdmin><Analytics /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute requireAdmin><Notifications /></ProtectedRoute>} />
          <Route path="/client-statement" element={<ProtectedRoute requireAdmin><ClientStatement /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute requireAdmin><Expenses /></ProtectedRoute>} />
          <Route path="/invoice-aging" element={<ProtectedRoute requireAdmin><InvoiceAging /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute requireAdmin><ActivityTimeline /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><QuickNotes /></ProtectedRoute>} />
        </Routes>
      </main>
      {currentUser && !isFullscreenPage && <AIAssistant />}
      {currentUser && !isFullscreenPage && <CommandPalette />}
    </div>
  );
}

export default App;
