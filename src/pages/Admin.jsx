import { useState } from 'react';
import { useGlobalState } from '../context/GlobalState';
import { UserPlus, Trash2, Key, Shield, Download, Upload, Database, Settings } from 'lucide-react';
import './Dashboard.css';

export default function Admin() {
  const { users, addUser, deleteUser, currentUser, exportDatabase, importDatabase, globalConfig, updateGlobalConfig } = useGlobalState();
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('production');

  const [configForm, setConfigForm] = useState(globalConfig || {
    currency: '₹',
    taxRate: 18,
    companyName: 'PowerStik India',
    companyAddress: '123 Factory Lane, Industrial Area, Pune'
  });

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateGlobalConfig(configForm);
    alert('Global Settings updated successfully!');
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <Shield size={48} color="#f87171" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ color: '#f87171' }}>Access Denied</h2>
            <p className="text-muted">You do not have permission to view the Admin Portal.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleGenerateUser = (e) => {
    e.preventDefault();
    if (!newUserId.trim() || !newPassword.trim() || !newName.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    
    // Check if ID already exists
    if (users.find(u => u.id.toLowerCase() === newUserId.toLowerCase())) {
      alert('User ID already exists!');
      return;
    }

    addUser({
      id: newUserId.toLowerCase(),
      password: newPassword,
      name: newName,
      role: newRole
    });

    setNewUserId('');
    setNewPassword('');
    setNewName('');
    setNewRole('production');
    alert('Employee account generated successfully!');
  };

  const handleDelete = (id) => {
    if (id === 'admin') {
      alert('Cannot delete the master admin account.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this employee account?')) {
      deleteUser(id);
    }
  };

  const handleBackup = () => {
    const data = exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PowerStik_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const success = importDatabase(event.target.result);
        if (success) {
          alert('Database restored successfully! The application will now reload to apply changes.');
          window.location.reload();
        } else {
          alert('Failed to restore database. Invalid file format.');
        }
      } catch (err) {
        alert('Failed to read backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h2>Admin Portal</h2>
          <p className="text-muted">Manage system access and generate employee credentials.</p>
        </header>

        <div className="grid-2" style={{ gap: '2rem' }}>
          {/* Create User Form */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={20} className="text-gradient" /> Generate Employee Account
            </h3>
            
            <form onSubmit={handleGenerateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group-col">
                <label>Employee Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="input-group-col">
                <label>User ID</label>
                <input 
                  type="text" 
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="e.g. emp_john"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="input-group-col">
                <label>Password</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. strongpass123"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="input-group-col">
                <label>Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="production">Production Floor</option>
                  <option value="design">Design Team</option>
                  <option value="sales">Sales Team</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
                <Key size={18} /> Create Credentials
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#007bff" /> Active System Users
            </h3>
            
            <div className="table-responsive">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="font-bold">{user.id}</td>
                      <td>{user.name}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: user.role === 'admin' ? 'rgba(0,123,255,0.1)' : 'rgba(255,255,255,0.05)',
                          color: user.role === 'admin' ? '#007bff' : 'var(--text-muted)'
                        }}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {user.id !== 'admin' && (
                          <button className="icon-btn" title="Delete User" onClick={() => handleDelete(user.id)}>
                            <Trash2 size={16} color="#f87171" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0, 123, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 123, 255, 0.1)' }}>
              <h4 style={{ color: '#007bff', marginBottom: '0.5rem', fontSize: '14px' }}>Hosting Notice</h4>
              <p className="text-muted" style={{ fontSize: '13px' }}>
                Currently, these users are saved in your local browser storage. To allow employees to log in from their own phones or computers, this system must be connected to a cloud database like <strong>Google Firebase</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Database Management Section */}
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} className="text-gradient" /> Database Management
          </h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Export your entire ERP database (Users, Inventory, Production, etc.) as a JSON backup file. You can restore this file later if your browser cache is cleared.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleBackup} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Export Full Backup
            </button>
            <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Upload size={18} /> Restore from Backup
              <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        {/* Global Settings Section */}
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} className="text-gradient" /> Global ERP Configuration
          </h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Update core application settings such as taxation rates, currency symbols, and master company details.
          </p>
          <form onSubmit={handleSaveConfig} className="grid-2" style={{ gap: '1rem' }}>
            <div className="input-group-col">
              <label>Company Name</label>
              <input 
                type="text" 
                value={configForm.companyName}
                onChange={(e) => setConfigForm({...configForm, companyName: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="input-group-col">
              <label>Default Currency Symbol</label>
              <input 
                type="text" 
                value={configForm.currency}
                onChange={(e) => setConfigForm({...configForm, currency: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="input-group-col">
              <label>GST / Tax Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={configForm.taxRate}
                onChange={(e) => setConfigForm({...configForm, taxRate: Number(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="input-group-col" style={{ gridColumn: 'span 2' }}>
              <label>Company Address</label>
              <input 
                type="text" 
                value={configForm.companyAddress}
                onChange={(e) => setConfigForm({...configForm, companyAddress: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary">
                Save Global Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
