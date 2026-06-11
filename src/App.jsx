import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { GlobalProvider, useGlobalState } from './context/GlobalState';
import { Moon, Sun, ArrowRight, Menu, X, Search } from 'lucide-react';
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

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('PowerStik_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('PowerStik_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <GlobalProvider>
      <Router>
        <ButtermaxCursor />
        <div className="noise-overlay" />
        <div className="fluid-bg" />
        <AppContent theme={theme} toggleTheme={toggleTheme} />
      </Router>
    </GlobalProvider>
  );
}

function AppContent({ theme, toggleTheme }) {
  const location = useLocation();
  const { currentUser, logout } = useGlobalState();
  const isFullscreenPage = location.pathname === '/' || location.pathname === '/login';
  const isAdmin = currentUser?.role === 'admin';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Protect routes logic
  const ProtectedRoute = ({ children, requireAdmin }) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <div className="app-container">
      {!isFullscreenPage && (
        <nav className="glass-panel navbar">
          <div className="logo">
            <img src={`${import.meta.env.BASE_URL}powerstik-logo.png`} alt="PowerStik" style={{ height: '28px', objectFit: 'contain', filter: 'brightness(1.1)' }} />
          </div>
          
          <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active-nav' : ''}`}>Dashboard</Link>
            <Link to="/sales-order" className={`nav-link ${location.pathname === '/sales-order' ? 'active-nav' : ''}`}>Sales Orders</Link>
            <Link to="/artwork" className={`nav-link ${location.pathname === '/artwork' ? 'active-nav' : ''}`}>Artwork</Link>
            <Link to="/production" className={`nav-link ${location.pathname === '/production' ? 'active-nav' : ''}`}>Production</Link>
            <Link to="/inventory" className={`nav-link ${location.pathname === '/inventory' ? 'active-nav' : ''}`}>Inventory</Link>
            {isAdmin && <Link to="/clients" className={`nav-link ${location.pathname === '/clients' ? 'active-nav' : ''}`}>Clients</Link>}
            {isAdmin && <Link to="/billing" className={`nav-link ${location.pathname === '/billing' ? 'active-nav' : ''}`}>Billing</Link>}
            {isAdmin && <Link to="/purchase-orders" className={`nav-link ${location.pathname === '/purchase-orders' ? 'active-nav' : ''}`}>Purchases</Link>}
            {isAdmin && <Link to="/timesheets" className={`nav-link ${location.pathname === '/timesheets' ? 'active-nav' : ''}`}>Timesheets</Link>}
            {isAdmin && <Link to="/reports" className={`nav-link ${location.pathname === '/reports' ? 'active-nav' : ''}`}>Reports</Link>}
            {isAdmin && <Link to="/analytics" className={`nav-link ${location.pathname === '/analytics' ? 'active-nav' : ''}`}>Analytics</Link>}
            {isAdmin && <Link to="/invoice-aging" className={`nav-link ${location.pathname === '/invoice-aging' ? 'active-nav' : ''}`}>Aging</Link>}
            {isAdmin && <Link to="/expenses" className={`nav-link ${location.pathname === '/expenses' ? 'active-nav' : ''}`}>Expenses</Link>}
            {isAdmin && <Link to="/notifications" className={`nav-link ${location.pathname === '/notifications' ? 'active-nav' : ''}`}>Alerts</Link>}
            {isAdmin && <Link to="/client-statement" className={`nav-link ${location.pathname === '/client-statement' ? 'active-nav' : ''}`}>Statements</Link>}
            <Link to="/notes" className={`nav-link ${location.pathname === '/notes' ? 'active-nav' : ''}`}>Notes</Link>
            {isAdmin && <Link to="/activity" className={`nav-link ${location.pathname === '/activity' ? 'active-nav' : ''}`}>Activity</Link>}
            {isAdmin && <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active-nav' : ''}`}>Admin Portal</Link>}
            
            {currentUser && (
              <button 
                onClick={() => logout()} 
                className="btn-secondary" 
                style={{ marginLeft: '1rem', padding: '6px 12px', fontSize: '0.9rem' }}
              >
                Logout ({currentUser.name})
              </button>
            )}

            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => {
                // Dispatch a synthetic Ctrl+K to open the command palette
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
              }}
              className="btn-secondary"
              title="Open Command Palette"
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={14} /> <kbd style={{ fontSize: '11px', opacity: 0.7 }}>Ctrl K</kbd>
            </button>
          </div>
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
      {currentUser && <AIAssistant />}
      {currentUser && <CommandPalette />}
    </div>
  );
}

export default App;
