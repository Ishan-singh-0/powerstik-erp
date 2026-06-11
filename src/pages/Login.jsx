import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import './Login.css';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useGlobalState();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId.trim()) { setError('Please enter a User ID.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(userId.trim(), password);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError('Login failed. Please try again.');
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div className="login-container animate-fade-in">
      <Link to="/" className="back-link magnetic-target">
        <ArrowLeft size={20} /> BACK TO HOME
      </Link>
      
      <div 
        className="glass-panel login-card" 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="login-header">
          <img src="/powerstik-logo.png" alt="PowerStik" style={{ height: '40px', objectFit: 'contain', marginBottom: '1rem', filter: 'brightness(1.1)' }} />
          <h2 className="login-title">SYSTEM <span style={{color: '#007bff'}}>LOGIN</span></h2>
          <p className="text-muted">Enter credentials to access PowerStik ERP.</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="buttermax-input-group">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="User ID" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required 
            />
            <span className="input-border"></span>
          </div>
          
          <div className="buttermax-input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <span className="input-border"></span>
          </div>
          
          <button type="submit" className="buttermax-login-btn magnetic-target" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
          </button>
          
          {error && (
            <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', marginTop: '0.5rem' }}>{error}</p>
          )}

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,203,5,0.06)', borderRadius: '10px', border: '1px solid rgba(255,203,5,0.2)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.8' }}>
            <strong style={{ color: '#ffcb05', display: 'block', marginBottom: '4px' }}>Demo Credentials</strong>
            Owner/Admin: <code style={{ color: '#fff' }}>admin</code> &nbsp;·&nbsp;
            Employee: <code style={{ color: '#fff' }}>employee</code><br />
            <span style={{ fontSize: '11px' }}>Any password works for demo</span>
          </div>
        </form>
      </div>
    </div>
  );
}
