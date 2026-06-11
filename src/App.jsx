import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { GlobalProvider, useGlobalState } from './context/GlobalState';
import { Moon, Sun, ArrowRight } from 'lucide-react';
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
import ButtermaxCursor from './components/ButtermaxCursor';
import AIAssistant from './components/AIAssistant';
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
            <img src="/powerstik-logo.png" alt="PowerStik" style={{ height: '28px', objectFit: 'contain', filter: 'brightness(1.1)' }} />
          </div>
          <div className="nav-links">
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active-nav' : ''}`}>Dashboard</Link>
            <Link to="/sales-order" className={`nav-link ${location.pathname === '/sales-order' ? 'active-nav' : ''}`}>Sales Orders</Link>
            <Link to="/artwork" className={`nav-link ${location.pathname === '/artwork' ? 'active-nav' : ''}`}>Artwork</Link>
            <Link to="/production" className={`nav-link ${location.pathname === '/production' ? 'active-nav' : ''}`}>Production</Link>
            <Link to="/inventory" className={`nav-link ${location.pathname === '/inventory' ? 'active-nav' : ''}`}>Inventory</Link>
            {isAdmin && <Link to="/clients" className={`nav-link ${location.pathname === '/clients' ? 'active-nav' : ''}`}>Clients</Link>}
            {isAdmin && <Link to="/billing" className={`nav-link ${location.pathname === '/billing' ? 'active-nav' : ''}`}>Billing</Link>}
            {isAdmin && <Link to="/reports" className={`nav-link ${location.pathname === '/reports' ? 'active-nav' : ''}`}>Reports</Link>}
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
        </Routes>
      </main>
      <AIAssistant />
    </div>
  );
}

export default App;
