import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGlobalState } from '../context/GlobalState';
import { Users, Mail, Phone, MapPin, Plus, Edit2, Trash2, X, MessageSquare, Building2, Search } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import PromptModal from '../components/PromptModal';
import './Dashboard.css';

const EMPTY_CLIENT = { name: '', email: '', phone: '', address: '', gstin: '' };

export default function Clients() {
  const { clients, invoices, addClient, updateClient, deleteClient, globalConfig } = useGlobalState();
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_CLIENT);
  const [formErrors, setFormErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const getClientStats = (clientName) => {
    const clientInvoices = invoices.filter(i => i.client === clientName);
    const totalRevenue = clientInvoices.reduce((sum, i) => sum + i.amount, 0);
    const outstanding = clientInvoices.reduce((sum, i) => sum + (i.amount - (i.amountPaid || 0)), 0);
    return { totalRevenue, totalOrders: clientInvoices.length, outstanding };
  };

  const openAdd = () => {
    setEditingClient(null);
    setFormData(EMPTY_CLIENT);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setFormData({ name: client.name, email: client.email, phone: client.phone, address: client.address, gstin: client.gstin });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Client name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (confirmDelete) deleteClient(confirmDelete.id);
    setConfirmDelete(null);
  };

  const cur = globalConfig.currency || '₹';

  return (
    <div className="page-container animate-fade-in">

      {/* Client Form Modal */}
      {isFormOpen && createPortal(
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setIsFormOpen(false); }}>
          <div className="modal-content animate-modal-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} style={{ color: 'var(--accent-primary)' }} />
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button className="icon-btn" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Client / Company Name *</label>
                <input className="form-input" placeholder="e.g. Alpha Corp Pvt Ltd" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} autoFocus />
                {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{formErrors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="billing@company.com" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{formErrors.email}</span>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" placeholder="+91 98765 43210" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Address</label>
                <textarea className="form-input" rows={2} placeholder="Full billing address..." value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{ resize: 'vertical', minHeight: '60px' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">GSTIN (optional)</label>
                <input className="form-input" placeholder="e.g. 27AAAAA0000A1Z5" value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
              </div>

              <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirm Modal */}
      <PromptModal
        isOpen={!!confirmDelete}
        type="confirm"
        title={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={28} className="icon-accent" />
            Clients
          </h1>
          <p className="page-subtitle">{clients.length} client{clients.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          placeholder="Search by name, ID or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '40px', maxWidth: '380px' }}
        />
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.75rem' }}>
        <div className="stat-card" style={{ borderLeftColor: '#6366f1' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Clients</span>
            <span className="stat-value">{clients.length}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <Building2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{cur}{invoices.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <Mail size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Outstanding</span>
            <span className="stat-value">{cur}{invoices.reduce((s, i) => s + (i.amount - (i.amountPaid || 0)), 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Client Cards Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title={search ? 'No clients match your search' : 'No clients yet'}
          subtitle={search ? 'Try a different search term' : 'Add your first client to get started'}
          action={!search && <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16} />Add First Client</button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredClients.map(client => {
            const stats = getClientStats(client.name);
            const overdueInvoices = invoices.filter(inv => inv.client === client.name && inv.status === 'Overdue');
            return (
              <div key={client.id} className="glass-panel" style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderTop: `3px solid ${overdueInvoices.length > 0 ? '#ef4444' : '#6366f1'}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {client.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.id} • Added {client.dateAdded}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button className="icon-btn" onClick={() => openEdit(client)} title="Edit Client">
                      <Edit2 size={15} />
                    </button>
                    <button className="icon-btn" onClick={() => setConfirmDelete(client)} title="Delete Client"
                      style={{ color: '#ef4444' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Contact Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.875rem' }}>
                  {client.email && client.email !== 'TBD' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Mail size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</span>
                    </div>
                  )}
                  {client.phone && client.phone !== 'TBD' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Phone size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && client.address !== 'TBD' && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                      <MapPin size={13} style={{ flexShrink: 0, marginTop: '3px', color: 'var(--text-muted)' }} />
                      <span style={{ lineHeight: '1.4', fontSize: '0.82rem' }}>{client.address}</span>
                    </div>
                  )}
                  {client.gstin && client.gstin !== 'TBD' && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '5px', display: 'inline-block', alignSelf: 'flex-start' }}>
                      GST: {client.gstin}
                    </div>
                  )}
                </div>

                {/* Revenue Stats */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Orders</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700 }}>{stats.totalOrders}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Revenue</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{cur}{stats.totalRevenue.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Due</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: stats.outstanding > 0 ? '#f59e0b' : '#10b981' }}>
                      {cur}{stats.outstanding.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Payment Reminders for Overdue */}
                {overdueInvoices.map(inv => {
                  const msg = `*PAYMENT REMINDER*\nDear ${client.name},\n\nThis is a gentle reminder that Invoice #${inv.id} for ₹${inv.amount.toLocaleString('en-IN')} is overdue.\n\nPlease process payment at your earliest convenience.\n\nThank you,\n${globalConfig.companyName || 'PowerStik'}`;
                  return (
                    <button key={inv.id} className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', padding: '0.5rem 0.9rem', borderColor: '#f59e0b', color: '#f59e0b', width: '100%', justifyContent: 'center' }}
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')}>
                      <MessageSquare size={13} />
                      WhatsApp Reminder — {inv.id}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
