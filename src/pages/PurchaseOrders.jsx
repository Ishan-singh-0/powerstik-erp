import { useState } from 'react';
import { useGlobalState } from '../context/GlobalState';
import PromptModal from '../components/PromptModal';
import { ShoppingCart, Plus, Trash2, CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import './Dashboard.css';

export default function PurchaseOrders() {
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, globalConfig, currentUser } = useGlobalState();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });
  const [filter, setFilter] = useState('All');

  const openPrompt = (title, defaultValue, onConfirm) =>
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  const openConfirm = (title, onConfirm) =>
    setModalConfig({ isOpen: true, type: 'confirm', title, defaultValue: '', onConfirm });
  const closeModal = () => setModalConfig(m => ({ ...m, isOpen: false }));
  const handleModalConfirm = (value) => {
    const cb = modalConfig.onConfirm;
    closeModal();
    if (cb) setTimeout(() => cb(value), 10);
  };

  const handleCreate = () => {
    openPrompt('Enter Vendor Name:', '', (vendor) => {
      if (!vendor) return;
      openPrompt('Enter Material / Description:', '', (description) => {
        if (!description) return;
        openPrompt(`Enter Amount (${globalConfig.currency}):`, '', (amount) => {
          if (!amount || isNaN(amount)) return;
          addPurchaseOrder({
            id: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
            vendor,
            description,
            amount: Number(amount),
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            createdBy: currentUser?.name || 'System'
          });
        });
      });
    });
  };

  const handleDelete = (id) => {
    openConfirm(`Delete Purchase Order ${id}?`, (ok) => { if (ok) deletePurchaseOrder(id); });
  };

  const handleStatusChange = (po) => {
    const next = po.status === 'Pending' ? 'Approved' : po.status === 'Approved' ? 'Received' : 'Pending';
    updatePurchaseOrder(po.id, 'status', next);
  };

  const statusBadge = (s) => {
    if (s === 'Approved') return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}><CheckCircle size={12} style={{ marginRight: 4 }} />Approved</span>;
    if (s === 'Received') return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: 'rgba(96,165,250,0.1)', color: '#60A5FA' }}><Package size={12} style={{ marginRight: 4 }} />Received</span>;
    return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: 'rgba(250,204,21,0.1)', color: '#FACC15' }}><Clock size={12} style={{ marginRight: 4 }} />Pending</span>;
  };

  const filtered = filter === 'All' ? purchaseOrders : purchaseOrders.filter(p => p.status === filter);
  const totalPending = purchaseOrders.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalApproved = purchaseOrders.filter(p => p.status === 'Approved').reduce((s, p) => s + p.amount, 0);
  const totalReceived = purchaseOrders.filter(p => p.status === 'Received').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content">
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Purchase Orders</h2>
            <p className="text-muted">Manage raw material and vendor purchase requests.</p>
          </div>
          <button className="btn-primary flex-center gap-2" onClick={handleCreate}>
            <Plus size={16} /> New Purchase Order
          </button>
        </header>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #FACC15' }}>
            <h3 className="text-muted">Pending Value</h3>
            <p className="font-bold text-2xl" style={{ color: '#FACC15', marginTop: '0.5rem' }}>{globalConfig.currency}{totalPending.toLocaleString('en-IN')}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #4ADE80' }}>
            <h3 className="text-muted">Approved Value</h3>
            <p className="font-bold text-2xl" style={{ color: '#4ADE80', marginTop: '0.5rem' }}>{globalConfig.currency}{totalApproved.toLocaleString('en-IN')}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #60A5FA' }}>
            <h3 className="text-muted">Total POs</h3>
            <p className="font-bold text-2xl" style={{ marginTop: '0.5rem' }}>{purchaseOrders.length}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem', borderTop: '3px solid #a78bfa' }}>
            <h3 className="text-muted">Received Value</h3>
            <p className="font-bold text-2xl" style={{ color: '#a78bfa', marginTop: '0.5rem' }}>{globalConfig.currency}{totalReceived.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} className="text-gradient" /> All Purchase Orders
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Pending', 'Approved', 'Received'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: filter === f ? 'var(--accent-gradient)' : 'transparent',
                    color: filter === f ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >{f}</button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="items-table">
              <thead>
                <tr>
                  <th>PO ID</th>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No purchase orders found.</td></tr>
                )}
                {filtered.map(po => (
                  <tr key={po.id}>
                    <td className="font-bold text-gradient">{po.id}</td>
                    <td>{po.date}</td>
                    <td className="font-bold">{po.vendor}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.description}</td>
                    <td className="font-bold">{globalConfig.currency}{po.amount.toLocaleString('en-IN')}</td>
                    <td className="text-muted">{po.createdBy}</td>
                    <td>
                      <button
                        onClick={() => handleStatusChange(po)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Click to advance status"
                      >
                        {statusBadge(po.status)}
                      </button>
                    </td>
                    <td>
                      <button className="icon-btn" onClick={() => handleDelete(po.id)} title="Delete PO">
                        <Trash2 size={15} color="#f87171" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
