import { useState } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { FileText, Download, Building2, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

export default function ClientStatement() {
  const { clients, invoices, globalConfig } = useGlobalState();
  const [selectedClient, setSelectedClient] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const clientInvoices = invoices.filter(inv => {
    if (inv.client !== selectedClient) return false;
    if (dateFrom && inv.date < dateFrom) return false;
    if (dateTo && inv.date > dateTo) return false;
    return true;
  });

  const total = clientInvoices.reduce((s, i) => s + i.amount, 0);
  const paid = clientInvoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const outstanding = total - paid;

  const statusColor = (status) => {
    if (status === 'Paid') return '#10b981';
    if (status === 'Overdue') return '#ef4444';
    if (status === 'Partial') return '#f59e0b';
    return '#3b82f6';
  };

  const printStatement = () => {
    const client = clients.find(c => c.name === selectedClient);
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Client Statement - ${selectedClient}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #666; margin-bottom: 24px; }
          .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .info-block { background: #f5f5f5; padding: 16px; border-radius: 8px; }
          .info-block h3 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #888; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #888; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .summary-card { padding: 16px; border-radius: 8px; text-align: center; }
          .summary-card.total { background: #eef2ff; }
          .summary-card.paid { background: #d1fae5; }
          .summary-card.due { background: #fee2e2; }
          .summary-card .amount { font-size: 20px; font-weight: 700; margin: 4px 0; }
          .summary-card .label { font-size: 11px; color: #888; text-transform: uppercase; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #aaa; }
        </style>
      </head>
      <body>
        <h1>${globalConfig.companyName || 'PowerStik India'}</h1>
        <div class="subtitle">${globalConfig.companyAddress || ''}</div>
        <h2 style="font-size:18px; margin-bottom:4px;">Account Statement</h2>
        <div class="subtitle">Client: <strong>${selectedClient}</strong>${dateFrom ? ` | From: ${dateFrom}` : ''}${dateTo ? ` To: ${dateTo}` : ''}</div>

        <div class="header-grid">
          <div class="info-block">
            <h3>Client Details</h3>
            <p style="margin:2px 0">${client?.name || selectedClient}</p>
            <p style="margin:2px 0; color:#666">${client?.email || ''}</p>
            <p style="margin:2px 0; color:#666">${client?.phone || ''}</p>
            <p style="margin:2px 0; color:#666">${client?.address || ''}</p>
            ${client?.gstin ? `<p style="margin:2px 0; color:#666">GSTIN: ${client.gstin}</p>` : ''}
          </div>
          <div class="info-block">
            <h3>Statement Period</h3>
            <p style="margin:2px 0">Generated: ${new Date().toLocaleDateString('en-IN')}</p>
            ${dateFrom ? `<p style="margin:2px 0; color:#666">From: ${dateFrom}</p>` : ''}
            ${dateTo ? `<p style="margin:2px 0; color:#666">To: ${dateTo}</p>` : ''}
            <p style="margin:2px 0; color:#666">Total Invoices: ${clientInvoices.length}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${clientInvoices.map(inv => `
              <tr>
                <td>${inv.id}</td>
                <td>${inv.date || '-'}</td>
                <td>₹${inv.amount.toLocaleString('en-IN')}</td>
                <td>₹${(inv.amountPaid || 0).toLocaleString('en-IN')}</td>
                <td>₹${(inv.amount - (inv.amountPaid || 0)).toLocaleString('en-IN')}</td>
                <td><span class="status-badge">${inv.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-card total">
            <div class="label">Total Billed</div>
            <div class="amount">₹${total.toLocaleString('en-IN')}</div>
          </div>
          <div class="summary-card paid">
            <div class="label">Amount Received</div>
            <div class="amount">₹${paid.toLocaleString('en-IN')}</div>
          </div>
          <div class="summary-card due">
            <div class="label">Balance Due</div>
            <div class="amount">₹${outstanding.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="footer">This is a computer-generated statement. No signature required. | ${globalConfig.companyName}</div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={28} className="icon-accent" />
            Client Account Statements
          </h1>
          <p className="page-subtitle">Generate and print full account statements for any client</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Select Client</label>
          <select className="form-input" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
            <option value="">-- Choose Client --</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">From Date</label>
          <input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">To Date</label>
          <input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={!selectedClient}
          onClick={printStatement}
        >
          <Download size={16} />
          Print / Save PDF
        </button>
      </div>

      {selectedClient && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ borderLeft: '3px solid #6366f1' }}>
              <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}><DollarSign size={18} /></div>
              <div className="stat-info">
                <span className="stat-label">Total Billed</span>
                <span className="stat-value">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid #10b981' }}>
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><CheckCircle size={18} /></div>
              <div className="stat-info">
                <span className="stat-label">Received</span>
                <span className="stat-value">₹{paid.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
              <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}><AlertTriangle size={18} /></div>
              <div className="stat-info">
                <span className="stat-label">Outstanding</span>
                <span className="stat-value">₹{outstanding.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} className="icon-accent" />
              Invoices for {selectedClient}
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>{clientInvoices.length} records</span>
            </h3>
            {clientInvoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.4 }}>No invoices found for this client</div>
            ) : (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clientInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td><span style={{ fontWeight: 600 }}>{inv.id}</span></td>
                      <td>{inv.date || '-'}</td>
                      <td>₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td>₹{(inv.amountPaid || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 600, color: (inv.amount - (inv.amountPaid || 0)) > 0 ? '#ef4444' : '#10b981' }}>
                        ₹{(inv.amount - (inv.amountPaid || 0)).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="status-badge" style={{ color: statusColor(inv.status), background: `${statusColor(inv.status)}20`, border: `1px solid ${statusColor(inv.status)}40` }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!selectedClient && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
          <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Select a client above to view their account statement</p>
        </div>
      )}
    </div>
  );
}
