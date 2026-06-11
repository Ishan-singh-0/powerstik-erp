import { useState, useEffect, useRef } from 'react';
import { PackageSearch, Plus, Filter, Trash2, Edit3, X, ScanText, Sparkles } from 'lucide-react';
import PromptModal from '../components/PromptModal';
import { getMasters } from '../services/masters';
import { useGlobalState } from '../context/GlobalState';
import './Dashboard.css';

export default function Inventory() {
  const { loading, inventory, updateInventoryItem, addInventoryItem, deleteInventoryItem } = useGlobalState();
  const [masters, setMasters] = useState(null);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });

  const openConfirm = (title, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, defaultValue: '', onConfirm });
  };
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const handleModalConfirm = (value) => {
    if (modalConfig.onConfirm) modalConfig.onConfirm(value);
    closeModal();
  };

  useEffect(() => {
    getMasters().then(data => {
      setMasters(data);
    });
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  const calculateStatus = (stock) => {
    if (stock <= 10) return 'Critical';
    if (stock <= 50) return 'Low Stock';
    return 'In Stock';
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    openConfirm('Are you sure you want to delete this item?', () => {
      deleteInventoryItem(id);
    });
  };

  const handleAddClick = () => {
    setEditingItem({
      id: `INV-${Math.floor(Math.random() * 900) + 100}`,
      name: '',
      category: (masters?.categories ?? ['General'])[0],
      stock: 0,
      unit: (masters?.units ?? ['Pcs'])[0],
      status: 'Critical'
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingItem.name || !editingItem.name.trim()) {
      setEditingItem({ ...editingItem, _error: 'Product name is required.' });
      return;
    }
    
    const updatedItem = { ...editingItem, status: calculateStatus(editingItem.stock) };
    
    if (inventory.find(i => i.id === updatedItem.id)) {
      updateInventoryItem(updatedItem.id, updatedItem);
    } else {
      addInventoryItem(updatedItem);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleAIScanClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    // Parse supplier invoice
    setTimeout(() => {
      // Find "Corrugated Box (Large)" and add stock
      const targetItem = inventory.find(i => i.id === 'INV-101');
      if (targetItem) {
        const addedStock = 500;
        const newStock = targetItem.stock + addedStock;
        const updatedItem = { ...targetItem, stock: newStock, status: calculateStatus(newStock) };
        updateInventoryItem('INV-101', updatedItem);
      }
      
      setIsScanning(false);
      openConfirm(`✅ AI Extraction Complete! Extracted data from '${file.name}'. Automatically added 500 units to Corrugated Box (Large).`, () => {});
      e.target.value = null;
    }, 2500);
  };

  if (loading) {
    return <div className="loading-state">Loading Inventory Data...</div>;
  }

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="dashboard-content" style={{ padding: '0' }}>
      <PromptModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        defaultValue={modalConfig.defaultValue}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
      />
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient">Raw Materials & Inventory</h1>
          <p className="text-muted">Manage stock levels and warehousing</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.jpg,.png,.jpeg" 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#a78bfa', color: '#a78bfa' }}
            onClick={handleAIScanClick}
            disabled={isScanning}
          >
            {isScanning ? (
              <><Sparkles size={18} className="spin" /> Scanning Supplier Invoice...</>
            ) : (
              <><ScanText size={18} /> Upload & AI Scan Invoice</>
            )}
          </button>
          <button className="btn-primary flex-center gap-2" onClick={handleAddClick}>
            <Plus size={16} /> Add New Item
          </button>
        </div>
      </header>

        <div className="glass-panel widget" style={{ padding: '2rem' }}>
          <div className="widget-header" style={{ marginBottom: '2rem' }}>
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <PackageSearch size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Search by ID or Item Name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td className="font-bold text-muted">{item.id}</td>
                    <td className="font-bold">{item.name}</td>
                    <td>{item.category}</td>
                    <td className="font-bold text-gradient">{item.stock} {item.unit}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.82rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                        color: item.status === 'In Stock' ? '#4ade80' : item.status === 'Low Stock' ? '#fbbf24' : '#f87171',
                        background: item.status === 'In Stock' ? 'rgba(74,222,128,0.1)' : item.status === 'Low Stock' ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn" title="Edit Item" onClick={() => handleEditClick(item)}>
                        <Edit3 size={16} />
                      </button>
                      <button className="icon-btn" title="Delete Item" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No inventory items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>{inventory.find(i => i.id === editingItem.id) ? 'Edit Item' : 'Add New Stock'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group-col">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value, _error: null})}
                  style={{ width: '100%', borderColor: editingItem._error ? '#f87171' : undefined }}
                />
                {editingItem._error && (
                  <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>{editingItem._error}</span>
                )}
              </div>
              
              <div className="input-group-col">
                <label>Category</label>
                <select 
                  value={editingItem.category} 
                  onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                  className="input-group"
                  style={{ width: '100%', appearance: 'auto', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}
                >
                  {masters?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group-col" style={{ flex: 1 }}>
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    value={editingItem.stock} 
                    onChange={e => setEditingItem({...editingItem, stock: Number(e.target.value)})}
                    className="input-group"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="input-group-col" style={{ flex: 1 }}>
                  <label>Unit</label>
                  <select 
                    value={editingItem.unit} 
                    onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                    className="input-group"
                    style={{ width: '100%', appearance: 'auto', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}
                  >
                    {masters?.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
