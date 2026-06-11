import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Multi-purpose modal replacing all native browser prompts/alerts/confirms.
 * 
 * Types:
 *  - 'prompt'  → Shows a text input. onConfirm called with the input value.
 *  - 'confirm' → Shows a Yes/No. onConfirm called with true.
 *  - 'alert'   → Shows an informational/success/warning message. Only OK button.
 */
export default function PromptModal({ isOpen, type, title, defaultValue, onConfirm, onClose }) {
  const [inputValue, setInputValue] = useState(defaultValue || '');

  useEffect(() => {
    setInputValue(defaultValue || '');
  }, [defaultValue, isOpen]);

  if (!isOpen) return null;

  const isSuccess = title?.startsWith('✅');
  const isWarning = title?.startsWith('⚠️');
  const isAlert   = type === 'alert' || isSuccess || isWarning;

  const accentColor = isSuccess ? '#4ade80' : isWarning ? '#fbbf24' : 'var(--accent-primary)';

  const modalContent = (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel animate-modal-in" style={{ maxWidth: '420px', padding: '1.75rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, paddingRight: '8px' }}>
            {isSuccess && <CheckCircle size={20} color="#4ade80" style={{ flexShrink: 0 }} />}
            {isWarning && <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0 }} />}
            {!isSuccess && !isWarning && type === 'confirm' && <Info size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 }}>{title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ flexShrink: 0 }}><X size={18} /></button>
        </div>

        {/* Body */}
        {type === 'prompt' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              autoFocus
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) onConfirm(inputValue);
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>
        )}

        {type === 'confirm' && !isAlert && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            This action cannot be undone. Are you sure you want to proceed?
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          {!isAlert && (
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          )}
          <button
            style={{
              background: isAlert ? accentColor : 'var(--accent-gradient)',
              color: 'white',
              border: 'none',
              padding: '9px 22px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              minWidth: '80px',
              transition: 'opacity 0.15s',
            }}
            onClick={() => {
              onConfirm(type === 'prompt' ? inputValue : true);
            }}
          >
            {isAlert ? 'OK' : type === 'confirm' ? 'Confirm' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
