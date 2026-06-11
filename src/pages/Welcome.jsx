import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, BarChart2, Package, Users, Zap, Shield, Clock } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useEffect } from 'react';
import './Welcome.css';

const FEATURES = [
  { icon: <BarChart2 size={20} />, title: 'Real-Time Analytics', desc: 'Live revenue dashboards, sales leaderboards & invoice aging reports.' },
  { icon: <Package size={20} />, title: 'Inventory Control', desc: 'Track stock levels, burn rates, and get critical alerts automatically.' },
  { icon: <Users size={20} />, title: 'Client CRM', desc: 'Full client management with payment reminders via WhatsApp.' },
  { icon: <Zap size={20} />, title: 'AI Assistant', desc: 'Built-in AI command center for instant business insights.' },
  { icon: <Shield size={20} />, title: 'Role-Based Access', desc: 'Admin and employee roles with granular permission control.' },
  { icon: <Clock size={20} />, title: 'Production Tracking', desc: '4-stage Kanban job board from Pre-Press to Dispatch.' },
];

const STATS = [
  { value: '12+', label: 'Modules' },
  { value: '100%', label: 'Cloud-Based' },
  { value: '0', label: 'Setup Fees' },
];

export default function Welcome() {
  const { currentUser } = useGlobalState();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true });
  }, [currentUser, navigate]);

  return (
    <div className="welcome-container">
      {/* Ambient background glows */}
      <div className="welcome-glow welcome-glow-1" />
      <div className="welcome-glow welcome-glow-2" />

      {/* Navbar */}
      <nav className="welcome-nav">
        <div className="welcome-logo">
          <img
            src={`${import.meta.env.BASE_URL}powerstik-logo.png`}
            alt="PowerStik"
            style={{ height: '28px', objectFit: 'contain', filter: 'brightness(1.1)' }}
          />
        </div>
        <Link to="/login" className="welcome-login-btn">
          Sign In <ArrowRight size={14} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="welcome-hero">
        <div className="welcome-badge">
          <span className="badge-dot" />
          Enterprise ERP for Indian Print & Label Industry
        </div>

        <h1 className="welcome-title">
          Run your entire<br />
          <span className="welcome-title-accent">print business</span><br />
          from one place.
        </h1>

        <p className="welcome-subtitle">
          PowerStik ERP brings together orders, production, billing, inventory,
          and client management — purpose-built for battery sticker & label manufacturers.
        </p>

        <div className="welcome-actions">
          <Link to="/login" className="welcome-cta-primary">
            Get Started <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="welcome-cta-secondary">
            View Demo
          </Link>
        </div>

        {/* Stats row */}
        <div className="welcome-stats">
          {STATS.map(s => (
            <div key={s.label} className="welcome-stat">
              <span className="welcome-stat-value">{s.value}</span>
              <span className="welcome-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="welcome-features">
        <p className="welcome-section-label">What's Included</p>
        <h2 className="welcome-section-title">Everything you need, nothing you don't.</h2>
        <div className="welcome-feature-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="welcome-feature-card">
              <div className="welcome-feature-icon">{f.icon}</div>
              <div>
                <div className="welcome-feature-title">{f.title}</div>
                <div className="welcome-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="welcome-cta-section">
        <h2 className="welcome-cta-title">Ready to streamline your operations?</h2>
        <p className="welcome-cta-sub">Log in now and start managing your business intelligently.</p>
        <Link to="/login" className="welcome-cta-primary" style={{ display: 'inline-flex', marginTop: '1.75rem' }}>
          Access PowerStik ERP <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <span>© {new Date().getFullYear()} PowerStik Enterprise Suite. All rights reserved.</span>
        <div className="welcome-footer-checks">
          <span><CheckCircle size={12} /> Secure</span>
          <span><CheckCircle size={12} /> Private</span>
          <span><CheckCircle size={12} /> Made in India</span>
        </div>
      </footer>

      {/* Marquee */}
      <div className="welcome-marquee-wrapper">
        <div className="welcome-marquee">
          <span>BATTERY STICKERS</span>
          <span className="marquee-dot">·</span>
          <span>WARRANTY CARDS</span>
          <span className="marquee-dot">·</span>
          <span>BARCODE LABELS</span>
          <span className="marquee-dot">·</span>
          <span>METALIZED LABELS</span>
          <span className="marquee-dot">·</span>
          <span>ROLL FORM LABELS</span>
          <span className="marquee-dot">·</span>
          <span>FOIL STAMPING</span>
          <span className="marquee-dot">·</span>
          <span>LEAFLETS</span>
          <span className="marquee-dot">·</span>
          <span>BATTERY STICKERS</span>
          <span className="marquee-dot">·</span>
          <span>WARRANTY CARDS</span>
          <span className="marquee-dot">·</span>
          <span>BARCODE LABELS</span>
          <span className="marquee-dot">·</span>
          <span>METALIZED LABELS</span>
          <span className="marquee-dot">·</span>
          <span>ROLL FORM LABELS</span>
          <span className="marquee-dot">·</span>
          <span>FOIL STAMPING</span>
          <span className="marquee-dot">·</span>
          <span>LEAFLETS</span>
          <span className="marquee-dot">·</span>
        </div>
      </div>
    </div>
  );
}
