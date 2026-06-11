import React from 'react';
import { useGlobalState } from '../context/GlobalState';
import './PrintInvoice.css';

export default function PrintInvoice({ invoices }) {
  const { clients, globalConfig } = useGlobalState();

  if (!invoices || invoices.length === 0) return null;

  return (
    <div className="print-only-container">
      {invoices.map((inv, index) => {
        // Try to find the client in CRM by name
        const crmClient = clients?.find(c => c.name.toLowerCase() === inv.client.toLowerCase()) || {
          address: 'PLOT NO.2184, Sector-38\nPhase II Industrial Estate, Rai\nSonipat Haryana-131029',
          gstin: 'Not Provided'
        };

        return (
        <div key={inv.id} className="invoice-page" style={{ pageBreakAfter: index < invoices.length - 1 ? 'always' : 'auto' }}>
          
          {/* Header */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <h1 style={{ color: '#007bff', fontSize: '28px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>⬡</span> {globalConfig.companyName}
              </h1>
              <p>Premium Packaging & Print Solutions</p>
            </div>
            <div className="invoice-meta">
              <h2 style={{ fontSize: '24px', letterSpacing: '4px', textTransform: 'uppercase', color: '#333' }}>INVOICE</h2>
              <table className="meta-table">
                <tbody>
                  <tr>
                    <td><strong>Invoice No:</strong></td>
                    <td>{inv.id}</td>
                  </tr>
                  <tr>
                    <td><strong>Date:</strong></td>
                    <td>{inv.date}</td>
                  </tr>
                  <tr>
                    <td><strong>Status:</strong></td>
                    <td style={{ color: inv.status === 'Paid' ? '#16a34a' : (inv.status === 'Overdue' ? '#dc2626' : '#d97706'), fontWeight: 'bold' }}>
                      {inv.status.toUpperCase()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="divider" />

          {/* Addresses */}
          <div className="invoice-addresses">
            <div className="address-block">
              <h3>Billed To:</h3>
              <p><strong>{inv.client}</strong></p>
              <p style={{ whiteSpace: 'pre-line' }}>{crmClient.address}</p>
              {crmClient.gstin !== 'Not Provided' && crmClient.gstin !== 'TBD' && (
                <p style={{ marginTop: '4px' }}>GSTIN: {crmClient.gstin}</p>
              )}
            </div>
            <div className="address-block text-right">
              <h3>From:</h3>
              <p><strong>{globalConfig.companyName}</strong></p>
              <p style={{ whiteSpace: 'pre-line' }}>{globalConfig.companyAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="invoice-items">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '50%' }}>Description</th>
                <th style={{ width: '15%' }}>Qty</th>
                <th style={{ width: '15%' }}>Rate</th>
                <th style={{ width: '15%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Line items */}
              <tr>
                <td>1</td>
                <td>
                  <strong>Print & Packaging Services</strong><br/>
                  <span style={{ fontSize: '12px', color: '#666' }}>As per approved sales order specifications.</span>
                </td>
                <td>1</td>
                <td>{globalConfig.currency}{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>{globalConfig.currency}{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              {/* Extra spacing row */}
              <tr className="spacer-row"><td colSpan="5"></td></tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="invoice-totals">
            <div className="payment-info">
              <h3>Payment Instructions:</h3>
              <p><strong>Bank:</strong> HDFC Bank Ltd.</p>
              <p><strong>A/C No:</strong> 50200012345678</p>
              <p><strong>IFSC:</strong> HDFC0001234</p>
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>Please include Invoice No. in transfer remarks.</p>
            </div>
            <div className="total-calculation">
              <table className="summary-table">
                <tbody>
                  <tr>
                    <td>Subtotal:</td>
                    <td>{globalConfig.currency}{(inv.amount * (1 - globalConfig.taxRate / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>GST ({globalConfig.taxRate}%):</td>
                    <td>{globalConfig.currency}{(inv.amount * (globalConfig.taxRate / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="grand-total">
                    <td>Grand Total:</td>
                    <td>{globalConfig.currency}{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '12px' }}>Amount Paid:</td>
                    <td style={{ paddingTop: '12px' }}>{globalConfig.currency}{(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style={{ fontSize: '16px' }}>
                    <td style={{ fontWeight: 'bold', paddingTop: '8px' }}>Balance Due:</td>
                    <td style={{ fontWeight: 'bold', paddingTop: '8px', color: (inv.amount - (inv.amountPaid || 0)) > 0 ? '#333' : '#16a34a' }}>
                      {globalConfig.currency}{(inv.amount - (inv.amountPaid || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <div className="signature-box">
              <div className="signature-line">Authorized Signatory</div>
              <p>For {globalConfig.companyName}</p>
            </div>
            <p className="footer-note">Thank you for your business! For any queries regarding this invoice, please contact us.</p>
          </div>
        </div>
        );
      })}
    </div>
  );
}
