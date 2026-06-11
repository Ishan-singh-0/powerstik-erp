import React from 'react';
import { useGlobalState } from '../context/GlobalState';
import './PrintInvoice.css';

// Theme style definitions
const THEMES = {
  modern: {
    accentColor: '#007bff',
    headerBg: 'linear-gradient(135deg, #007bff 0%, #00d4ff 100%)',
    headerText: '#fff',
    tableHeadBg: '#007bff',
    tableHeadText: '#fff',
    grandTotalBg: '#007bff',
    grandTotalText: '#fff',
    borderRadius: '12px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  classic: {
    accentColor: '#1a1a1a',
    headerBg: '#1a1a1a',
    headerText: '#fff',
    tableHeadBg: '#333',
    tableHeadText: '#fff',
    grandTotalBg: '#1a1a1a',
    grandTotalText: '#fff',
    borderRadius: '0px',
    fontFamily: "'Times New Roman', serif",
  },
  minimal: {
    accentColor: '#333',
    headerBg: '#fff',
    headerText: '#111',
    tableHeadBg: '#f3f4f6',
    tableHeadText: '#333',
    grandTotalBg: '#f3f4f6',
    grandTotalText: '#111',
    borderRadius: '4px',
    fontFamily: "'Inter', sans-serif",
  },
};

export default function PrintInvoice({ invoices, theme = 'modern' }) {
  const { clients, globalConfig } = useGlobalState();
  const t = THEMES[theme] || THEMES.modern;

  if (!invoices || invoices.length === 0) return null;

  return (
    <div className="print-only-container">
      {invoices.map((inv, index) => {
        const crmClient = clients?.find(c => c.name.toLowerCase() === inv.client.toLowerCase()) || {
          address: 'Address not available in CRM.',
          gstin: 'Not Provided'
        };
        const subtotal = inv.amount * (1 - globalConfig.taxRate / 100);
        const tax = inv.amount * (globalConfig.taxRate / 100);
        const balance = inv.amount - (inv.amountPaid || 0);

        return (
          <div
            key={inv.id}
            className="invoice-page"
            style={{
              pageBreakAfter: index < invoices.length - 1 ? 'always' : 'auto',
              fontFamily: t.fontFamily,
              borderRadius: t.borderRadius,
              overflow: 'hidden',
              border: `1px solid #ddd`
            }}
          >
            {/* Header */}
            <div style={{ background: t.headerBg, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ color: t.headerText, fontSize: '26px', margin: 0, fontWeight: 700 }}>
                  ⬡ {globalConfig.companyName}
                </h1>
                <p style={{ color: t.headerText, opacity: 0.75, margin: '4px 0 0', fontSize: '13px' }}>Premium Packaging & Print Solutions</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ color: t.headerText, fontSize: '26px', letterSpacing: '4px', margin: 0 }}>INVOICE</h2>
                <p style={{ color: t.headerText, opacity: 0.8, fontSize: '13px', marginTop: '6px' }}>#{inv.id}</p>
                <p style={{ color: t.headerText, opacity: 0.8, fontSize: '13px' }}>Date: {inv.date}</p>
                <p style={{
                  color: inv.status === 'Paid' ? '#4ade80' : (inv.status === 'Overdue' ? '#f87171' : '#fbbf24'),
                  fontWeight: 'bold',
                  fontSize: '12px',
                  marginTop: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  display: 'inline-block'
                }}>
                  {inv.status?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Addresses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px 32px', borderBottom: `2px solid ${t.accentColor}20` }}>
              <div>
                <h3 style={{ color: t.accentColor, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Billed To</h3>
                <p style={{ fontWeight: 700, margin: 0 }}>{inv.client}</p>
                <p style={{ whiteSpace: 'pre-line', color: '#555', fontSize: '13px', margin: '4px 0' }}>{crmClient.address}</p>
                {crmClient.gstin && crmClient.gstin !== 'Not Provided' && (
                  <p style={{ fontSize: '12px', color: '#666' }}>GSTIN: {crmClient.gstin}</p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ color: t.accentColor, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>From</h3>
                <p style={{ fontWeight: 700, margin: 0 }}>{globalConfig.companyName}</p>
                <p style={{ whiteSpace: 'pre-line', color: '#555', fontSize: '13px', margin: '4px 0' }}>{globalConfig.companyAddress}</p>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ padding: '0 32px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px' }}>
                <thead>
                  <tr style={{ background: t.tableHeadBg, color: t.tableHeadText }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px' }}>#</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px' }}>Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px' }}>Rate</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px 12px', borderBottom: '1px solid #eee', fontSize: '13px' }}>1</td>
                    <td style={{ padding: '14px 12px', borderBottom: '1px solid #eee', fontSize: '13px' }}>
                      <strong>Print & Packaging Services</strong><br />
                      <span style={{ fontSize: '11px', color: '#888' }}>As per approved sales order specifications.</span>
                    </td>
                    <td style={{ padding: '14px 12px', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '13px' }}>1</td>
                    <td style={{ padding: '14px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontSize: '13px' }}>{globalConfig.currency}{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 12px', borderBottom: '1px solid #eee', textAlign: 'right', fontSize: '13px' }}>{globalConfig.currency}{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals & Payment Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px 32px', marginTop: '8px' }}>
              <div>
                <h3 style={{ color: t.accentColor, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Payment Instructions</h3>
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}><strong>Bank:</strong> HDFC Bank Ltd.</p>
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}><strong>A/C No:</strong> 50200012345678</p>
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}><strong>IFSC:</strong> HDFC0001234</p>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>Include Invoice #{inv.id} in transfer remarks.</p>
              </div>
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 0', color: '#555' }}>Subtotal:</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>{globalConfig.currency}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: '#555' }}>GST ({globalConfig.taxRate}%):</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>{globalConfig.currency}{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr style={{ background: t.grandTotalBg, color: t.grandTotalText }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, borderRadius: `${t.borderRadius} 0 0 ${t.borderRadius}` }}>Grand Total:</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, borderRadius: `0 ${t.borderRadius} ${t.borderRadius} 0` }}>{globalConfig.currency}{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: '#555', paddingTop: '10px' }}>Amount Paid:</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', paddingTop: '10px', color: '#16a34a' }}>{globalConfig.currency}{(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', fontWeight: 700, color: balance > 0 ? '#dc2626' : '#16a34a' }}>Balance Due:</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, color: balance > 0 ? '#dc2626' : '#16a34a' }}>{globalConfig.currency}{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: `${t.accentColor}08`, borderTop: `2px solid ${t.accentColor}20`, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Thank you for your business with {globalConfig.companyName}!</p>
              <div style={{ textAlign: 'right' }}>
                <div style={{ width: '120px', borderTop: `1px solid ${t.accentColor}`, marginBottom: '4px', marginLeft: 'auto' }}></div>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Authorized Signatory</p>
                <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>For {globalConfig.companyName}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
