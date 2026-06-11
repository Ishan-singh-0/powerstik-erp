import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Welcome.css';

export default function Welcome() {
  return (
    <div className="welcome-container animate-fade-in">
      <nav className="welcome-nav">
        <div className="logo magnetic-target">
          <img src="/powerstik-logo.png" alt="PowerStik" style={{ height: '36px', objectFit: 'contain', filter: 'brightness(1.1)' }} />
        </div>
        <Link to="/login" className="btn-secondary magnetic-target" style={{ border: '1px solid rgba(0, 123, 255, 0.4)', color: '#007bff'}}>
          Client Login
        </Link>
      </nav>

      <div className="welcome-content">
        <h1 className="welcome-title">
          <span className="title-line"><span className="mask-reveal" style={{animationDelay: '0.1s'}}>POWER</span></span>
          <span className="title-line"><span className="mask-reveal" style={{animationDelay: '0.2s', color: '#007bff'}}>STIK</span></span>
          <span className="title-line"><span className="mask-reveal" style={{animationDelay: '0.3s', fontSize: '0.45em', letterSpacing: '0.15em'}}>ENTERPRISE SUITE</span></span>
        </h1>
        
        <p className="welcome-subtitle mask-reveal" style={{animationDelay: '0.5s'}}>
          India's leading battery sticker & industrial label enterprise management platform.<br/>
          Streamline orders, production, artwork & billing — all in one place.
        </p>
        
        <div className="welcome-actions mask-reveal" style={{animationDelay: '0.6s'}}>
          <Link to="/login" className="btn-primary magnetic-target magnetic-btn" style={{ background: '#ffcb05', color: '#000', fontWeight: 800 }}>
            ENTER THE SYSTEM <ArrowRight size={18} style={{ marginLeft: '12px' }} />
          </Link>
        </div>
      </div>

      <div className="marquee-container">
        <div className="marquee-content">
          BATTERY STICKERS • WARRANTY CARDS • LEAFLETS • BARCODE LABELS • METALIZED LABELS • ROLL FORM LABELS • BATTERY STICKERS • WARRANTY CARDS • LEAFLETS • BARCODE LABELS • METALIZED LABELS • ROLL FORM LABELS •
        </div>
      </div>
    </div>
  );
}
