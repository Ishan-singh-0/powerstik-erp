import { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useGlobalState } from '../context/GlobalState';
import './Dashboard.css';

export default function Reports() {
  const { invoices, productionJobs, inventory, globalConfig } = useGlobalState();
  const [reportType, setReportType] = useState('sales');
  // Dynamically compute Sales Data from global invoices
  const salesData = invoices.map(inv => ({
    name: inv.id,
    revenue: inv.amount,
    margin: inv.amount * 0.35 // Estimated 35% margin
  })).slice(0, 7); // Show last 7

  // Dynamically compute Production Data
  const productionData = productionJobs.map(job => ({
    name: job.name.length > 15 ? job.name.substring(0, 15) + '…' : job.name,
    efficiency: job.targetQty > 0 ? Math.round(Math.min(100, Math.max(0, (job.producedQty / job.targetQty) * 100)) * 10) / 10 : 0
  }));

  // Dynamically compute Inventory Data grouped by category
  const inventoryGroups = inventory.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = 0;
    acc[item.category] += (item.stock * 15); // Avg unit value of 15 for valuation
    return acc;
  }, {});
  
  const inventoryData = Object.keys(inventoryGroups).map(key => ({
    name: key,
    value: inventoryGroups[key]
  }));

  const exportCSV = () => {
    let dataToExport = [];
    let headers = [];
    
    if (reportType === 'sales') {
      headers = ['Week', `Revenue (${globalConfig.currency})`, `Margin (${globalConfig.currency})`];
      dataToExport = salesData.map(d => [d.name, d.revenue, d.margin]);
    } else if (reportType === 'production') {
      headers = ['Day', 'Efficiency (%)'];
      dataToExport = productionData.map(d => [d.name, d.efficiency]);
    } else {
      headers = ['Category', `Valuation (${globalConfig.currency})`];
      dataToExport = inventoryData.map(d => [d.name, d.value]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + dataToExport.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="font-bold">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color }}>
              {p.name}: {reportType !== 'production' ? globalConfig.currency : ''}{p.value}{reportType === 'production' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content" style={{ padding: '0' }}>
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Analytics & Reports</h2>
            <p className="text-muted">Generate comprehensive reports and export data.</p>
          </div>
          <div className="so-actions">
            <button className="btn-secondary flex-center gap-2"><Calendar size={16} /> Last 30 Days</button>
            <button className="btn-primary flex-center gap-2" onClick={exportCSV}><Download size={16} /> Export CSV</button>
          </div>
        </header>

        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div 
            className={`glass-panel stat-card ${reportType === 'sales' ? 'active' : ''}`} 
            style={{ cursor: 'pointer', border: reportType === 'sales' ? '1px solid var(--accent-primary)' : '' }}
            onClick={() => setReportType('sales')}
          >
            <div className="stat-icon-wrapper"><TrendingUp size={24} className="accent-icon" /></div>
            <div>
              <h3 className="text-muted">Sales Report</h3>
              <p className="font-bold">Revenue & Margins</p>
            </div>
          </div>
          <div 
            className={`glass-panel stat-card ${reportType === 'production' ? 'active' : ''}`} 
            style={{ cursor: 'pointer', border: reportType === 'production' ? '1px solid var(--accent-primary)' : '' }}
            onClick={() => setReportType('production')}
          >
            <div className="stat-icon-wrapper"><BarChart3 size={24} className="accent-icon" /></div>
            <div>
              <h3 className="text-muted">Production Report</h3>
              <p className="font-bold">Machine Efficiency</p>
            </div>
          </div>
          <div 
            className={`glass-panel stat-card ${reportType === 'inventory' ? 'active' : ''}`} 
            style={{ cursor: 'pointer', border: reportType === 'inventory' ? '1px solid var(--accent-primary)' : '' }}
            onClick={() => setReportType('inventory')}
          >
            <div className="stat-icon-wrapper"><PieChart size={24} className="accent-icon" /></div>
            <div>
              <h3 className="text-muted">Inventory Report</h3>
              <p className="font-bold">Stock Valuations</p>
            </div>
          </div>
        </div>

        <div className="glass-panel widget" style={{ padding: '2rem', height: '500px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
            {reportType === 'sales' && 'Revenue vs Margin Overview'}
            {reportType === 'production' && 'Daily Machine Efficiency'}
            {reportType === 'inventory' && 'Inventory Valuation Breakdown'}
          </h3>
          
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {reportType === 'sales' ? (
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--accent-primary)" name="Revenue" />
                  <Bar dataKey="margin" fill="#4ADE80" name="Margin" />
                </BarChart>
              ) : reportType === 'production' ? (
                <LineChart data={productionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" stroke="#FACC15" name="Efficiency %" strokeWidth={3} />
                </LineChart>
              ) : (
                <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" fill="#60A5FA" name={`Valuation (${globalConfig.currency})`} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="glass-panel widget" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Data Breakdown</h3>
          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  {reportType === 'sales' && (
                    <><th>Period</th><th>Revenue</th><th>Margin</th></>
                  )}
                  {reportType === 'production' && (
                    <><th>Day</th><th>Efficiency</th></>
                  )}
                  {reportType === 'inventory' && (
                    <><th>Category</th><th>Valuation</th></>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportType === 'sales' && salesData.map(d => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td className="font-bold text-gradient">{globalConfig.currency}{d.revenue.toLocaleString('en-IN')}</td>
                    <td className="font-bold" style={{ color: '#4ADE80' }}>{globalConfig.currency}{Math.round(d.margin).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {reportType === 'production' && productionData.map(d => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td className="font-bold" style={{ color: '#FACC15' }}>{d.efficiency.toFixed(1)}%</td>
                  </tr>
                ))}
                {reportType === 'inventory' && inventoryData.map(d => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td className="font-bold text-gradient">{globalConfig.currency}{d.value.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
