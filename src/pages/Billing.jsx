import { useState } from 'react';
import { FileText, Printer, CheckCircle, Clock, Search, Download, Trash2 } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import PromptModal from '../components/PromptModal';
import PrintInvoice from '../components/PrintInvoice';
import './Dashboard.css';

export default function Billing() {
  const { loading, invoices, recordInvoicePayment, addInvoice, deleteInvoice } = useGlobalState();
  const [search, setSearch] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState(new Set());
  const [printData, setPrintData] = useState([]);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });

  const openPrompt = (title, defaultValue, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  };
  const openConfirm = (title, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, defaultValue: '', onConfirm });
  };
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleModalConfirm = (value) => {
    const callback = modalConfig.onConfirm;
    closeModal();
    if (callback) {
      setTimeout(() => callback(value), 10);
    }
  };

  // Invoices provided by GlobalState

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(search.toLowerCase()) || 
    inv.client.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'Paid') return <span className="trend positive"><CheckCircle size={14} /> Paid</span>;
    if (status === 'Partial') return <span className="trend" style={{ color: '#FACC15', background: 'rgba(250, 204, 21, 0.1)' }}><Clock size={14} /> Partial</span>;
    if (status === 'Overdue') return <span className="trend negative"><Clock size={14} /> Overdue</span>;
    return <span className="trend" style={{ color: '#ffcb05', background: 'rgba(255, 203, 5, 0.1)' }}><Clock size={14} /> Pending</span>;
  };

  const handleRecordPayment = (inv) => {
    const balance = inv.amount - (inv.amountPaid || 0);
    openPrompt(`Record Payment for ${inv.id}`, balance.toString(), (amount) => {
      if (!amount || isNaN(amount) || Number(amount) <= 0) return;
      recordInvoicePayment(inv.id, amount);
    });
  };

  const handleDeleteInvoice = (invId) => {
    openConfirm(`Are you sure you want to delete Invoice ${invId}? This will automatically cancel and delete any linked Production or Artwork jobs.`, (confirmed) => {
      if (confirmed) {
        deleteInvoice(invId);
      }
    });
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedInvoices);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedInvoices(next);
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map(i => i.id)));
    }
  };

  const handleCreateInvoice = () => {
    openPrompt("Enter Client Name:", "", (client) => {
      if (!client) return;
      openPrompt("Enter Invoice Amount (₹):", "", (amount) => {
        if (!amount || isNaN(amount)) return;
        addInvoice({
          id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
          client: client,
          amount: Number(amount),
          date: new Date().toISOString().split('T')[0]
        });
      });
    });
  };

  const handlePrint = (ids) => {
    if (ids.length === 0) return;
    openConfirm(`✅ Preparing print layout for ${ids.length} invoice(s)...`, () => {
      const invoicesToPrint = invoices.filter(i => ids.includes(i.id));
      setPrintData(invoicesToPrint);
      // Wait for React to render the hidden print template, then print
      setTimeout(() => {
        window.print();
        setTimeout(() => setPrintData([]), 1000); // Clear after printing
      }, 500);
    });
  };

  const handleDownload = (ids) => {
    if (ids.length === 0) return;
    openConfirm(`✅ Downloading ${ids.length} PDF(s)...`, () => {});
  };

  if (loading) {
    return <div className="loading-state">Loading Billing Data...</div>;
  }

  const totalOutstanding = invoices.reduce((sum, i) => sum + (i.amount - (i.amountPaid || 0)), 0);
  const totalReceived = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content" style={{ padding: '0' }}>
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Billing & Invoicing</h2>
            <p className="text-muted">Manage invoices, payments, and print challans.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {selectedInvoices.size > 0 && (
              <>
                <button className="btn-secondary flex-center gap-2" onClick={() => handleDownload(Array.from(selectedInvoices))}>
                  <Download size={16} /> Download Selected
                </button>
                <button className="btn-secondary flex-center gap-2" onClick={() => handlePrint(Array.from(selectedInvoices))}>
                  <Printer size={16} /> Print Selected
                </button>
              </>
            )}
            <button className="btn-primary flex-center gap-2" onClick={handleCreateInvoice}>
              <FileText size={16} /> Create Invoice
            </button>
          </div>
        </header>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem' }}>
            <h3 className="text-muted">Total Outstanding</h3>
            <p className="font-bold text-2xl text-gradient">₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem' }}>
            <h3 className="text-muted">Invoices Generated (30d)</h3>
            <p className="font-bold text-2xl">{invoices.length}</p>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '1.5rem' }}>
            <h3 className="text-muted">Payments Received</h3>
            <p className="font-bold text-2xl" style={{ color: '#4ADE80' }}>₹{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="glass-panel widget" style={{ padding: '2rem' }}>
          <div className="widget-header" style={{ marginBottom: '2rem' }}>
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <Search size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Search by Invoice # or Client..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={filteredInvoices.length > 0 && selectedInvoices.size === filteredInvoices.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Invoice No.</th>
                  <th>Client Name</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} style={{ background: selectedInvoices.has(inv.id) ? 'rgba(118, 51, 255, 0.1)' : 'transparent' }}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedInvoices.has(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                      />
                    </td>
                    <td className="font-bold text-gradient">{inv.id}</td>
                    <td className="font-bold">{inv.client}</td>
                    <td>{inv.date}</td>
                    <td className="font-bold">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="font-bold" style={{ color: (inv.amount - (inv.amountPaid || 0)) > 0 ? '#ffcb05' : '#4ADE80' }}>
                      ₹{(inv.amount - (inv.amountPaid || 0)).toLocaleString('en-IN')}
                    </td>
                    <td>{getStatusBadge(inv.status)}</td>
                    <td>
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                        {inv.status !== 'Paid' && (
                          <button className="icon-btn" title="Record Payment" onClick={() => handleRecordPayment(inv)}>
                            <CheckCircle size={16} color="#4ADE80" />
                          </button>
                        )}
                        <button className="icon-btn" title="Download PDF" onClick={() => handleDownload([inv.id])}><Download size={16} /></button>
                        <button className="icon-btn" title="Print Invoice / Challan" onClick={() => handlePrint([inv.id])}><Printer size={16} /></button>
                        <button className="icon-btn-danger" style={{ padding: '6px' }} title="Delete Invoice" onClick={() => handleDeleteInvoice(inv.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No invoices found.
                    </td>
                  </tr>
                )}
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

      <PrintInvoice invoices={printData} />
    </div>
  );
}
