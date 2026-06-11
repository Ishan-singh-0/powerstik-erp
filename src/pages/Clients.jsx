import { useState } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { Users, Mail, Phone, MapPin, DollarSign, Briefcase, Plus, Edit2 } from 'lucide-react';
import PromptModal from '../components/PromptModal';
import './Dashboard.css';

export default function Clients() {
  const { clients, invoices, productionJobs, addClient, updateClient, globalConfig } = useGlobalState();
  const [search, setSearch] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });
  const [editingClient, setEditingClient] = useState(null);

  const openPrompt = (title, defaultValue, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  };
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const handleModalConfirm = (value) => {
    const callback = modalConfig.onConfirm;
    closeModal();
    if (callback) setTimeout(() => callback(value), 10);
  };

  const handleAddClient = () => {
    openPrompt("Enter Client Name:", "", (name) => {
      if (!name) return;
      addClient({
        name,
        email: 'TBD',
        phone: 'TBD',
        address: 'TBD',
        gstin: 'TBD'
      });
    });
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateClient(editingClient.id, editingClient);
    setEditingClient(null);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const getClientStats = (clientName) => {
    const clientInvoices = invoices.filter(i => i.client === clientName);
    const totalRevenue = clientInvoices.reduce((sum, i) => sum + i.amount, 0);
    // Since production jobs are named "Client Name - Product", we can loosely match them
    // Or just count invoices as orders. We'll count invoices as total orders.
    const totalOrders = clientInvoices.length;
    return { totalRevenue, totalOrders };
  };

  const totalCRMRevenue = invoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content" style={{ padding: '0' }}>
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Client Management (CRM)</h2>
            <p className="text-muted">Manage your client relationships, addresses, and lifetime value.</p>
          </div>
          <button className="btn-primary flex-center gap-2" onClick={handleAddClient}>
            <Plus size={16} /> New Client
          </button>
        </header>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem' }}>
            <h3 className="text-muted">Total Active Clients</h3>
            <p className="font-bold text-2xl text-gradient">{clients.length}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem' }}>
            <h3 className="text-muted">Total CRM Revenue</h3>
            <p className="font-bold text-2xl" style={{ color: '#4ADE80' }}>{globalConfig.currency}{totalCRMRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="glass-panel widget" style={{ padding: '2rem' }}>
          <div className="widget-header" style={{ marginBottom: '2rem' }}>
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <input 
                type="text" 
                placeholder="Search clients by name or ID..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '16px' }}
              />
            </div>
          </div>

          <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredClients.map(client => {
              const stats = getClientStats(client.name);
              return (
                <div key={client.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid #ffcb05' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{client.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>{client.id} • Added {client.dateAdded}</p>
                    </div>
                    <button className="icon-btn" onClick={() => handleEditClient(client)} title="Edit Client">
                      <Edit2 size={16} color="#ffcb05" />
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                      <Mail size={14} color="#888" /> <span>{client.email}</span>
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                      <Phone size={14} color="#888" /> <span>{client.phone}</span>
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', alignItems: 'flex-start' }}>
                      <MapPin size={14} color="#888" style={{ marginTop: '3px' }} /> 
                      <span style={{ lineHeight: '1.4' }}>{client.address}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Orders</p>
                      <p className="font-bold" style={{ fontSize: '1.1rem' }}>{stats.totalOrders}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Lifetime Revenue</p>
                      <p className="font-bold" style={{ fontSize: '1.1rem', color: '#ffcb05' }}>{globalConfig.currency}{stats.totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredClients.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                <Users size={48} color="#444" style={{ margin: '0 auto 1rem' }} />
                <h3>No clients found.</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <PromptModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        defaultValue={modalConfig.defaultValue}
        onConfirm={handleModalConfirm}
        onClose={closeModal}
      />

      {/* Edit Client Modal Overlay */}
      {editingClient && (
        <div className="modal-overlay">
          <div className="prompt-modal animate-modal-in" style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Edit Client Profile</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Client Name</label>
                <input required type="text" value={editingClient.name} onChange={e => setEditingClient({...editingClient, name: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Email</label>
                  <input type="email" value={editingClient.email} onChange={e => setEditingClient({...editingClient, email: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Phone</label>
                  <input type="text" value={editingClient.phone} onChange={e => setEditingClient({...editingClient, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Billing Address</label>
                <textarea rows="3" value={editingClient.address} onChange={e => setEditingClient({...editingClient, address: e.target.value})}></textarea>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>GSTIN</label>
                <input type="text" value={editingClient.gstin} onChange={e => setEditingClient({...editingClient, gstin: e.target.value})} />
              </div>
              
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingClient(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
