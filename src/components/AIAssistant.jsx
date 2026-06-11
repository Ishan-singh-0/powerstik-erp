import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Settings, Key, FileText } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { parseAICommand } from '../utils/aiParser';
import './AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am the PowerStik AI Assistant. Try asking me to "Add a client named XYZ" or "Record payment of 50000 for INV-2023-001".' }
  ]);
  const [input, setInput] = useState('');
  const { 
    addClient, recordInvoicePayment, submitSalesOrder, addInvoice, 
    updateProductionJob, updateArtworkJob, inventory, updateInventoryItem, addInventoryItem
  } = useGlobalState();
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_key') || '');

  const saveApiKey = () => {
    localStorage.setItem('openai_key', apiKey);
    setShowSettings(false);
    setMessages(prev => [...prev, { sender: 'ai', text: 'API Key saved! However, the full OpenAI backend module is currently pending deployment. I will use the local NLP engine for now.' }]);
  };

  const handleDownloadCommands = () => {
    const text = `POWERSTIK AI ASSISTANT - COMMAND CHEAT SHEET

1. BILLING & INVOICES
- "Create a new invoice for Beta Tech of 50000"
- "Create invoice for INV-2025-001 for 50000"
- "Record payment of 50000 for INV-2023-001"

2. INVENTORY & STOCK
- "Create new item Golden Foil with 100 rolls"
- "Add 500 units to Corrugated Box"
- "Received 100 kgs of Glossy Paper"
- "Used 50 units of Binding Glue"
- "Deduct 10 from Binding Glue"

3. PRODUCTION FLOOR
- "Start WO-2041"
- "Pause WO-2044"
- "Mark WO-1000 as completed"

4. ARTWORK & DESIGN
- "Assign AW-5004 to Sarah"
- "Approve AW-5002"

5. CLIENTS & CRM
- "Add a new client named Omega Corp"

6. ALERTS & BROADCASTS
- "Send alert: System maintenance at 5PM"
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PowerStik_AI_Commands.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    // Process with local NLP
    setTimeout(() => {
      const result = parseAICommand(userText);
      
      if (result.action === 'addClient') {
        addClient({ name: result.data.name, email: 'TBD', phone: 'TBD', address: 'TBD', gstin: 'TBD' });
      } else if (result.action === 'recordPayment') {
        recordInvoicePayment(result.data.invoiceId, result.data.amount);
      } else if (result.action === 'createSalesOrder') {
        submitSalesOrder({
          client: result.data.client,
          product: 'AI Generated Order',
          quantity: 1,
          totalAmount: result.data.amount,
          priority: 'Medium',
          items: [{ productName: 'Custom Request', category: 'Misc', qty: 1 }],
          files: []
        });
      } else if (result.action === 'createInvoice') {
        const generatedId = result.data.customId || `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
        addInvoice({
          id: generatedId,
          client: result.data.client,
          amount: result.data.amount,
          date: new Date().toISOString().split('T')[0]
        });
      } else if (result.action === 'updateProduction') {
        updateProductionJob(result.data.jobId, 'status', result.data.status);
      } else if (result.action === 'assignArtwork') {
        updateArtworkJob(result.data.jobId, 'designer', result.data.designer);
        updateArtworkJob(result.data.jobId, 'status', 'Assigned');
      } else if (result.action === 'approveArtwork') {
        updateArtworkJob(result.data.jobId, 'status', 'Approved');
      } else if (result.action === 'createInventoryItem') {
        const newStatus = result.data.stock <= 10 ? 'Critical' : result.data.stock <= 50 ? 'Low Stock' : 'In Stock';
        addInventoryItem({
          id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
          name: result.data.itemName,
          category: 'General',
          stock: result.data.stock,
          unit: result.data.unit,
          status: newStatus
        });
      } else if (result.action === 'addInventoryQty' || result.action === 'deductInventoryQty') {
        // Find item by name loosely
        const item = inventory.find(i => i.name.toLowerCase().includes(result.data.itemName.toLowerCase()) || i.category.toLowerCase().includes(result.data.itemName.toLowerCase()));
        if (item) {
          const newQty = result.action === 'addInventoryQty' 
            ? item.stock + result.data.qty 
            : Math.max(0, item.stock - result.data.qty);
          let newStatus = 'In Stock';
          if (newQty <= 50) newStatus = 'Low Stock';
          if (newQty <= 10) newStatus = 'Critical';
          updateInventoryItem(item.id, { ...item, stock: newQty, status: newStatus });
        } else {
          result.message = `I couldn't find an inventory item matching "${result.data.itemName}".`;
        }
      }

      setMessages(prev => [...prev, { sender: 'ai', text: result.message }]);
    }, 600);
  };

  return (
    <>
      <button className={`ai-fab ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="ai-chat-window animate-modal-in">
          <div className="ai-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} color="#ffcb05" />
              <h4>PowerStik AI</h4>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="icon-btn" onClick={handleDownloadCommands} title="Download Cheat Sheet"><FileText size={16} color="#fff" /></button>
              <button className="icon-btn" onClick={() => setShowSettings(!showSettings)}><Settings size={16} color="#fff" /></button>
              <button className="icon-btn" onClick={() => setIsOpen(false)}><X size={16} color="#fff" /></button>
            </div>
          </div>

          {showSettings ? (
            <div className="ai-settings">
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffcb05' }}>
                <Key size={14} /> OpenAI API Settings
              </h5>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>Provide your API key to unlock true NLP function calling.</p>
              <input 
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                placeholder="sk-proj-..."
                style={{ width: '100%', marginBottom: '16px', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
              />
              <button className="btn-primary" onClick={saveApiKey} style={{ padding: '8px 12px', fontSize: '14px', width: '100%' }}>Save Key</button>
            </div>
          ) : (
            <>
              <div className="ai-chat-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`ai-message ${msg.sender}`}>
                    {msg.text}
                  </div>
                ))}
              </div>

              <form className="ai-chat-input" onSubmit={handleSend}>
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Type a command..." 
                />
                <button type="submit" disabled={!input.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
