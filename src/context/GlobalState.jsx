import React, { createContext, useContext, useState, useEffect } from 'react';
import { encryptData, decryptData } from '../utils/encryption';

const GlobalContext = createContext();

export function useGlobalState() {
  return useContext(GlobalContext);
}

// Secure Local Storage Helpers
const STORAGE_PREFIX = 'PowerStik_Secure_';

const getSecureData = (key, fallback) => {
  const encrypted = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (encrypted) {
    const decrypted = decryptData(encrypted);
    if (decrypted) return decrypted;
  }
  return fallback;
};

export function GlobalProvider({ children }) {
  const [loading, setLoading] = useState(true);
  
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState(() => getSecureData('currentUser', null));
  const [users, setUsers] = useState(() => getSecureData('users', [
    { id: 'admin', password: 'admin', name: 'System Admin', role: 'admin' },
    { id: 'employee', password: 'password', name: 'Demo Staff', role: 'employee' },
    { id: 'emp01', password: 'pass', name: 'Demo Staff', role: 'employee' }
  ]));

  // --- Initial Data Stores ---
  const [inventory, setInventory] = useState(() => getSecureData('inventory', [
    { id: 'INV-101', name: 'Corrugated Box (Large)', category: 'Corrugated Box', stock: 1250, unit: 'Pcs', status: 'In Stock' },
    { id: 'INV-102', name: 'Premium Glossy Paper', category: 'Paper Bags', stock: 45, unit: 'Kgs', status: 'Low Stock' },
    { id: 'INV-103', name: 'Standard Binding Glue', category: 'Labels', stock: 8, unit: 'Kgs', status: 'Critical' },
    { id: 'INV-104', name: 'A4 Matte Leaflets', category: 'Leaflet', stock: 5000, unit: 'Pcs', status: 'In Stock' }
  ]));

  const [productionJobs, setProductionJobs] = useState(() => getSecureData('productionJobs', [
    { id: 'WO-2041', name: 'Alpha Corp Annual Report', department: 'Printing', machine: 'Heidelberg SM74', status: 'Running', targetQty: 5000, producedQty: 3250 },
    { id: 'WO-2042', name: 'Beta Tech Flyers', department: 'Lamination', machine: 'Lamination 01', status: 'Queued', targetQty: 10000, producedQty: 0 },
    { id: 'WO-2043', name: 'Gamma Retail Boxes', department: 'Die Cutting', machine: 'Automatic Die Cutting', status: 'Completed', targetQty: 2500, producedQty: 2500 },
    { id: 'WO-2044', name: 'Delta Stickers', department: 'Flexo Printing', machine: 'Markany Flexo E5', status: 'Paused', targetQty: 50000, producedQty: 15000 }
  ]));

  const [artworkJobs, setArtworkJobs] = useState(() => getSecureData('artworkJobs', [
    { id: 'AW-5001', soId: 'SO-1024', client: 'Alpha Corp', designName: 'Battery Label V1', status: 'In Progress', priority: 'High', designer: 'Sarah M.', comments: 3, files: 2 },
    { id: 'AW-5002', soId: 'SO-1025', client: 'Beta Tech', designName: 'Warranty Card Print', status: 'Pending Approval', priority: 'Medium', designer: 'John D.', comments: 1, files: 1 },
    { id: 'AW-5003', soId: 'SO-1021', client: 'Gamma Retail', designName: 'Oil Bottle Stickers', status: 'Approved', priority: 'High', designer: 'Sarah M.', comments: 5, files: 4 },
    { id: 'AW-5004', soId: 'SO-1028', client: 'Delta LLC', designName: 'Metalized Promo Labels', status: 'Assigned', priority: 'Low', designer: 'Alex K.', comments: 0, files: 0 },
    { id: 'AW-5005', soId: 'SO-1029', client: 'Echo Inc', designName: 'Barcode Roll Form', status: 'Assigned', priority: 'Medium', designer: 'Unassigned', comments: 0, files: 0 }
  ]));

  const [clients, setClients] = useState(() => getSecureData('clients', [
    { id: 'CUST-001', name: 'Alpha Corp', email: 'billing@alphacorp.com', phone: '+91 98765 43210', address: '1st Floor, Tech Park, Bangalore, KA, India', gstin: '29AAAAA1234A1Z5', dateAdded: '2023-01-15' },
    { id: 'CUST-002', name: 'Beta Tech', email: 'accounts@betatech.in', phone: '+91 99887 76655', address: 'Plot 42, MIDC, Pune, MH, India', gstin: '27BBBBB5678B1Z6', dateAdded: '2023-03-22' },
    { id: 'CUST-003', name: 'Gamma Retail', email: 'finance@gammaretail.com', phone: '+91 91234 56789', address: 'Sector 5, Noida, UP, India', gstin: '09CCCCC9012C1Z7', dateAdded: '2023-05-10' },
    { id: 'CUST-004', name: 'Delta LLC', email: 'contact@deltallc.com', phone: '+91 90123 45678', address: 'Jubilee Hills, Hyderabad, TS, India', gstin: '36DDDDD3456D1Z8', dateAdded: '2023-08-05' }
  ]));

  const [invoices, setInvoices] = useState(() => getSecureData('invoices', [
    { id: 'INV-2023-001', client: 'Alpha Corp', date: '2023-10-12', amount: 450000, amountPaid: 450000, status: 'Paid' },
    { id: 'INV-2023-002', client: 'Beta Tech', date: '2023-10-15', amount: 125000, amountPaid: 0, status: 'Pending' },
    { id: 'INV-2023-003', client: 'Gamma Retail', date: '2023-10-18', amount: 85000, amountPaid: 0, status: 'Overdue' },
    { id: 'INV-2023-004', client: 'Alpha Corp', date: '2023-10-20', amount: 200000, amountPaid: 50000, status: 'Partial' }
  ]));

  const [alerts, setAlerts] = useState(() => getSecureData('alerts', [
    { id: 1, message: '3 Inventory items are critically low.', type: 'critical' },
    { id: 2, message: 'Invoice #INV-2023-003 is overdue by 5 days.', type: 'warning' }
  ]));

  const [activityLogs, setActivityLogs] = useState(() => getSecureData('activityLogs', [
    { id: 1, user: 'System', action: 'System Initialization', time: new Date().toISOString() }
  ]));

  // Initial load delay
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // --- End-to-End Encryption Sync ---
  const saveSecureData = (key, data) => {
    const encrypted = encryptData(data);
    if (encrypted) {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, encrypted);
    }
  };

  useEffect(() => { saveSecureData('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveSecureData('inventory', inventory); }, [inventory]);
  useEffect(() => { saveSecureData('productionJobs', productionJobs); }, [productionJobs]);
  useEffect(() => { saveSecureData('artworkJobs', artworkJobs); }, [artworkJobs]);
  useEffect(() => { saveSecureData('invoices', invoices); }, [invoices]);
  useEffect(() => { saveSecureData('alerts', alerts); }, [alerts]);
  useEffect(() => { saveSecureData('clients', clients); }, [clients]);
  useEffect(() => { saveSecureData('users', users); }, [users]);
  useEffect(() => { saveSecureData('activityLogs', activityLogs); }, [activityLogs]);

  // --- Actions ---

  const logActivity = (action, details = '') => {
    setActivityLogs(prev => [{
      id: Date.now(),
      user: currentUser ? currentUser.name : 'Unknown User',
      action,
      details,
      time: new Date().toISOString()
    }, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const login = (userId, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Always allow 'admin' to login as a backdoor, even if deleted from local storage
        if (userId.toLowerCase() === 'admin') {
          setCurrentUser({ id: 'admin', name: 'System Admin', role: 'admin' });
          setActivityLogs(prev => [{ id: Date.now(), user: 'System Admin', action: 'Logged In via Admin Override', time: new Date().toISOString() }, ...prev]);
          resolve({ role: 'admin' });
          return;
        }

        const user = users.find(u => u.id.toLowerCase() === userId.toLowerCase());
        if (user) {
          setCurrentUser({ id: user.id, name: user.name, role: user.role });
          setActivityLogs(prev => [{ id: Date.now(), user: user.name, action: 'Logged In', time: new Date().toISOString() }, ...prev]);
          resolve({ role: user.role });
        } else {
          reject(new Error('User not found. Use "admin" or "EMP001"'));
        }
      }, 800);
    });
  };

  const addUser = (userData) => {
    setUsers(prev => [...prev, userData]);
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const submitSalesOrder = (orderData) => {
    const soId = `SO-${Math.floor(Math.random() * 900) + 1000}`;
    const date = new Date().toISOString().split('T')[0];

    // 1. Create Invoice in Billing
    const newInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
      soId: soId,
      client: orderData.client,
      date: date,
      amount: orderData.totalAmount,
      amountPaid: 0,
      status: 'Pending'
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // 2. Queue jobs in Production for each item
    const newProductionJobs = orderData.items.map(item => ({
      id: `WO-${Math.floor(Math.random() * 9000) + 1000}`,
      soId: soId,
      name: `${orderData.client} - ${item.productName}`,
      department: item.category,
      machine: 'Unassigned',
      status: 'Queued',
      targetQty: item.qty,
      producedQty: 0
    }));
    setProductionJobs(prev => [...newProductionJobs, ...prev]);

    // 3. Request Design in Artwork Board
    const newArtworkJob = {
      id: `AW-${Math.floor(Math.random() * 9000) + 1000}`,
      soId: soId,
      client: orderData.client,
      designName: `${orderData.client} Master Design`,
      status: 'Assigned',
      priority: 'High',
      designer: 'Unassigned',
      comments: 0,
      files: 0
    };
    setArtworkJobs(prev => [newArtworkJob, ...prev]);

    // 4. Fire an alert
    const newAlert = {
      id: Date.now(),
      message: `New Sales Order ${soId} submitted for ${orderData.client}.`,
      type: 'success'
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const recordInvoicePayment = (id, amount) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPaid = (inv.amountPaid || 0) + Number(amount);
        let newStatus = 'Pending';
        if (newPaid >= inv.amount) newStatus = 'Paid';
        else if (newPaid > 0) newStatus = 'Partial';
        return { ...inv, amountPaid: newPaid, status: newStatus };
      }
      return inv;
    }));
  };

  const addInvoice = (invoiceData) => {
    setInvoices(prev => [{...invoiceData, amountPaid: 0, status: 'Pending'}, ...prev]);
  };

  const deleteInvoice = (invId) => {
    const invoiceToDelete = invoices.find(inv => inv.id === invId);
    if (!invoiceToDelete) return;

    setInvoices(prev => prev.filter(inv => inv.id !== invId));

    if (invoiceToDelete.soId) {
      setProductionJobs(prev => prev.filter(job => job.soId !== invoiceToDelete.soId));
      setArtworkJobs(prev => prev.filter(job => job.soId !== invoiceToDelete.soId));
      logActivity('Deleted Invoice', `Invoice ${invId} and its associated jobs were deleted.`);
    } else {
      logActivity('Deleted Invoice', `Invoice ${invId} was deleted.`);
    }
  };

  const addArtworkJob = (job) => {
    setArtworkJobs(prev => [...prev, job]);
  };

  const updateArtworkJob = (id, field, value) => {
    setArtworkJobs(prev => prev.map(job => job.id === id ? { ...job, [field]: value } : job));
  };

  const deleteArtworkJob = (id) => {
    setArtworkJobs(prev => prev.filter(job => job.id !== id));
  };

  const updateProductionJob = (id, field, value) => {
    // Check if job will complete
    const currentJob = productionJobs.find(j => j.id === id);
    let willComplete = false;
    if (currentJob && currentJob.status !== 'Completed') {
      if (field === 'status' && value === 'Completed') willComplete = true;
      if (field === 'producedQty' && value >= currentJob.targetQty) willComplete = true;
    }

    setProductionJobs(prev => prev.map(job => {
      if (job.id === id) {
        let updated = { ...job, [field]: value };
        if (field === 'status' && value === 'Completed') {
          updated.producedQty = updated.targetQty;
        }
        if (field === 'producedQty') {
          if (updated.producedQty >= updated.targetQty) {
            updated.status = 'Completed';
            updated.producedQty = updated.targetQty;
          } else if (updated.producedQty > 0 && updated.status === 'Queued') {
             updated.status = 'Running';
          } else if (updated.producedQty < updated.targetQty && updated.status === 'Completed') {
            updated.status = 'Running';
          }
        }
        return updated;
      }
      return job;
    }));

    // Auto-deduct inventory
    if (willComplete) {
      setInventory(prevInv => prevInv.map(item => {
        if (item.category === 'Corrugated Box' || item.category === 'Paper Bags' || item.category === 'Labels') {
           const deduct = Math.floor(Math.random() * 25) + 5; // Simulating material usage
           const newStock = Math.max(0, item.stock - deduct);
           let newStatus = 'In Stock';
           if (newStock <= 50) newStatus = 'Low Stock';
           if (newStock <= 10) newStatus = 'Critical';
           return { ...item, stock: newStock, status: newStatus };
        }
        return item;
      }));
      setAlerts(prev => [{ 
        id: Date.now(), 
        message: `Job ${id} completed. Raw materials automatically deducted from Inventory.`, 
        type: 'success' 
      }, ...prev]);
    }
  };

  const updateInventoryItem = (id, newData) => {
    setInventory(prev => prev.map(item => item.id === id ? newData : item));
  };

  const addInventoryItem = (newData) => {
    setInventory(prev => [...prev, newData]);
  };

  const deleteInventoryItem = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const addClient = (clientData) => {
    const newClient = { ...clientData, id: `CUST-${Math.floor(Math.random() * 900) + 100}`, dateAdded: new Date().toISOString().split('T')[0] };
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (id, updatedData) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const exportDatabase = () => {
    return JSON.stringify({
      users,
      inventory,
      productionJobs,
      artworkJobs,
      clients,
      invoices,
      alerts,
      activityLogs
    });
  };

  const importDatabase = (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.users) setUsers(parsed.users);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.productionJobs) setProductionJobs(parsed.productionJobs);
      if (parsed.artworkJobs) setArtworkJobs(parsed.artworkJobs);
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.alerts) setAlerts(parsed.alerts);
      if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
      
      logActivity('System Admin', 'Restored Database from Backup');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const contextValue = {
    currentUser,
    login,
    logout,
    loading,
    inventory,
    productionJobs,
    artworkJobs,
    invoices,
    alerts,
    clients,
    submitSalesOrder,
    recordInvoicePayment,
    addInvoice,
    deleteInvoice,
    addArtworkJob,
    updateArtworkJob,
    deleteArtworkJob,
    updateProductionJob,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addClient,
    updateClient,
    users,
    addUser,
    deleteUser,
    activityLogs,
    logActivity,
    exportDatabase,
    importDatabase
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}
