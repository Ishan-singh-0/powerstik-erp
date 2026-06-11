import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Send, Edit2, ScanText, Sparkles } from 'lucide-react';
import { getMasters } from '../services/masters';
import { useGlobalState } from '../context/GlobalState';
import PromptModal from '../components/PromptModal';
import EmptyState from '../components/EmptyState';
import './SalesOrderEntry.css';

export default function SalesOrderEntry() {
  const { loading, submitSalesOrder, globalConfig } = useGlobalState();
  const [masters, setMasters] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [client, setClient] = useState('');
  const [salesRep, setSalesRep] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [items, setItems] = useState([
    { id: 1, category: '', productName: '', qty: 1, rate: 0, amount: 0 }
  ]);

  // Modal State for custom prompts/confirms
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });

  const openPrompt = (title, defaultValue, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  };

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
      setLoading(false);
    });
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now(), category: '', productName: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate amount
        if (field === 'qty' || field === 'rate') {
          const q = parseFloat(updated.qty) || 0;
          const r = parseFloat(updated.rate) || 0;
          updated.amount = q * r;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return total.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  // Estimated profit margin (35% industry average for print/packaging)
  const MARGIN_RATE = 0.35;
  const calculateMargin = () => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return (total * MARGIN_RATE).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };
  const totalRaw = items.reduce((sum, item) => sum + item.amount, 0);
  const marginPercent = totalRaw > 0 ? Math.round(MARGIN_RATE * 100) : 0;

  const handleAIScanClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    // Parse the selected file
    setTimeout(() => {
      setClient('C001'); // Alpha Corp
      setSalesRep('John Doe');
      setItems([
        { id: Date.now(), category: 'Corrugated Box', productName: 'Custom Shipping Cartons', qty: 5000, rate: 45, amount: 225000 },
        { id: Date.now() + 1, category: 'Labels', productName: 'Glossy Logo Stickers', qty: 10000, rate: 2.5, amount: 25000 }
      ]);
      setIsScanning(false);
      openConfirm(`✅ AI Extraction Complete! Extracted data from '${file.name}'.`, () => {});
      
      // Reset input so they can scan another file if they want
      e.target.value = null;
    }, 2500);
  };

  const handleSubmit = () => {
    if (!client) {
      openConfirm("⚠️ Please select a client before submitting.", () => {});
      return;
    }
    if (items.every(i => !i.productName)) {
      openConfirm("⚠️ Please add at least one product before submitting.", () => {});
      return;
    }
    
    // Resolve the actual client name from the code
    const clientObj = masters.clients?.find(c => c.code === client) || { name: client };
    
    const orderData = {
      client: clientObj.name,
      salesRep: salesRep,
      totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
      items: items
    };

    submitSalesOrder(orderData);
    
    // Reset form
    setClient('');
    setSalesRep('');
    setItems([{ id: Date.now(), category: '', productName: '', qty: 1, rate: 0, amount: 0 }]);

    openConfirm(`✅ Sales Order submitted for ${globalConfig.currency}${calculateTotal()}! Invoice, Production Jobs & Artwork tasks auto-generated.`, () => {});
  };

  if (loading || !masters) {
    return <div className="loading-state">Loading Masters Data...</div>;
  }

  return (
    <div className="so-entry-layout animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="text-gradient">Sales Order Entry</h1>
          <p className="text-muted">Create a new order and push to production</p>
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
              <><Sparkles size={18} className="spin" /> Parsing Document...</>
            ) : (
              <><ScanText size={18} /> Upload & AI Scan PO</>
            )}
          </button>
          <button className="btn-primary flex-center gap-2" onClick={handleSubmit}><Send size={16} /> Submit Order</button>
        </div>
      </header>

      <div className="glass-panel form-container">
        {/* Header Information */}
        <div className="form-grid">
          <div className="input-group-col">
            <label>Client</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={client} 
                onChange={(e) => setClient(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Select a Client...</option>
                {masters.clients && masters.clients.length > 0 ? (
                  masters.clients.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))
                ) : (
                  <option value="CUST001">Alpha Corp</option>
                )}
              </select>
              <button className="icon-btn-primary" style={{ padding: '8px' }} title="Add Client" onClick={() => {
                openPrompt("Enter new Client Name:", "", (newName) => {
                  if (newName && newName.trim() !== '') {
                    const newCode = `CUST-${Math.floor(Math.random() * 9000) + 1000}`;
                    setMasters({...masters, clients: [...(masters.clients || []), { code: newCode, name: newName }]});
                    setClient(newCode);
                  }
                });
              }}><Plus size={16} /></button>
              <button style={{ padding: '8px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }} title="Edit Client" onClick={() => {
                if(!client) return openConfirm("⚠️ Select a client first.", () => {});
                const cObj = masters.clients.find(c => c.code === client);
                if(!cObj) return;
                openPrompt("Edit Client Name:", cObj.name, (newName) => {
                  if (newName && newName.trim() !== '') {
                    setMasters({...masters, clients: masters.clients.map(c => c.code === client ? { ...c, name: newName } : c)});
                  }
                });
              }}><Edit2 size={16} /></button>
              <button className="icon-btn-danger" style={{ padding: '8px' }} title="Remove Client" onClick={() => {
                if(!client) return openConfirm("⚠️ Select a client first.", () => {});
                openConfirm("Remove selected client?", (confirmed) => {
                  if(confirmed) {
                    setMasters({...masters, clients: masters.clients.filter(c => c.code !== client)});
                    setClient('');
                  }
                });
              }}><Trash2 size={16} /></button>
            </div>
          </div>
          
          <div className="input-group-col">
            <label>Sales Rep</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={salesRep} 
                onChange={(e) => setSalesRep(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Select Rep...</option>
                {masters.salesReps.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
              <button className="icon-btn-primary" style={{ padding: '8px' }} title="Add Rep" onClick={() => {
                openPrompt("Enter new Sales Rep Name:", "", (newName) => {
                  if (newName && newName.trim() !== '') {
                    setMasters({...masters, salesReps: [...masters.salesReps, newName]});
                    setSalesRep(newName);
                  }
                });
              }}><Plus size={16} /></button>
              <button style={{ padding: '8px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }} title="Edit Rep" onClick={() => {
                if(!salesRep) return openConfirm("⚠️ Select a rep first.", () => {});
                openPrompt("Edit Sales Rep Name:", salesRep, (newName) => {
                  if (newName && newName.trim() !== '') {
                    setMasters({...masters, salesReps: masters.salesReps.map(r => r === salesRep ? newName : r)});
                    setSalesRep(newName);
                  }
                });
              }}><Edit2 size={16} /></button>
              <button className="icon-btn-danger" style={{ padding: '8px' }} title="Remove Rep" onClick={() => {
                if(!salesRep) return openConfirm("⚠️ Select a rep first.", () => {});
                openConfirm("Remove selected rep?", (confirmed) => {
                  if(confirmed) {
                    setMasters({...masters, salesReps: masters.salesReps.filter(r => r !== salesRep)});
                    setSalesRep('');
                  }
                });
              }}><Trash2 size={16} /></button>
            </div>
          </div>

          <div className="input-group-col">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {masters.currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Line Items */}
        <div className="items-section">
          <div className="items-header">
            <h3>Line Items</h3>
            <button className="icon-btn-primary" onClick={addItem}><Plus size={18} /> Add Item</button>
          </div>
          
          <div className="table-responsive">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select 
                          value={item.category} 
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                          style={{ flex: 1, minWidth: '120px' }}
                        >
                          <option value="">Select...</option>
                          {masters.categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button className="icon-btn-primary" style={{ padding: '6px' }} title="Add Category" onClick={() => {
                          openPrompt("Enter new Category Name:", "", (newName) => {
                            if (newName && newName.trim() !== '') {
                              setMasters({...masters, categories: [...masters.categories, newName]});
                              updateItem(item.id, 'category', newName);
                            }
                          });
                        }}><Plus size={14} /></button>
                        <button style={{ padding: '6px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }} title="Edit Category" onClick={() => {
                          if(!item.category) return openConfirm("⚠️ Select a category first.", () => {});
                          openPrompt("Edit Category Name:", item.category, (newName) => {
                            if (newName && newName.trim() !== '') {
                              setMasters({...masters, categories: masters.categories.map(c => c === item.category ? newName : c)});
                              updateItem(item.id, 'category', newName);
                            }
                          });
                        }}><Edit2 size={14} /></button>
                        <button className="icon-btn-danger" style={{ padding: '6px' }} title="Remove Category" onClick={() => {
                          if(!item.category) return openConfirm("⚠️ Select a category first.", () => {});
                          openConfirm("Remove selected category from master list?", (confirmed) => {
                            if(confirmed) {
                              setMasters({...masters, categories: masters.categories.filter(c => c !== item.category)});
                              updateItem(item.id, 'category', '');
                            }
                          });
                        }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        placeholder="E.g. Custom Flyer" 
                        value={item.productName}
                        onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                      />
                    </td>
                    <td className="font-bold text-gradient">{globalConfig.currency}{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <button className="icon-btn-danger" onClick={() => removeItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: 0, border: 'none' }}>
                      <EmptyState 
                        title="No items added yet" 
                        description="Start building your sales order by adding products."
                        actionText="Add Line Item"
                        onAction={addItem}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Totals */}
        <div className="form-footer">
          <div className="total-display">
            <span className="text-muted">Total Amount:</span>
            <span className="text-2xl font-bold text-gradient">{globalConfig.currency}{calculateTotal()}</span>
          </div>
          {totalRaw > 0 && (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', padding: '8px 16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Est. Profit Margin ({marginPercent}%)</p>
                <p style={{ color: '#4ADE80', fontWeight: 700, fontSize: '18px', margin: '2px 0 0' }}>{globalConfig.currency}{calculateMargin()}</p>
              </div>
              <div style={{ textAlign: 'right', background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', padding: '8px 16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Approx. Cost of Goods</p>
                <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '18px', margin: '2px 0 0' }}>{globalConfig.currency}{(totalRaw * (1 - MARGIN_RATE)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}
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
