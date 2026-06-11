import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Settings, FileText, Key, ChevronDown, Zap, Bot, Mic } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { parseAICommand } from '../utils/aiParser';
import './AIAssistant.css';

const QUICK_COMMANDS = [
  'Add a client named [Client Name]',
  'Record payment of [Amount] for [Invoice ID]',
  'Mark [Work Order] as completed',
  'Send alert: [Message]',
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hey! I\'m your PowerStik AI. I can manage clients, invoices, production jobs, inventory, and more — just tell me what to do or click the microphone to speak!',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_key') || '');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    addClient, recordInvoicePayment, submitSalesOrder, addInvoice,
    updateProductionJob, updateArtworkJob, inventory, updateInventoryItem, addInventoryItem
  } = useGlobalState();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveApiKey = () => {
    localStorage.setItem('openai_key', apiKey);
    setShowSettings(false);
    pushAI('API key saved! I\'ll use it for future requests. For now, local NLP is active.');
  };

  const pushAI = (text) => {
    setMessages(prev => [...prev, { sender: 'ai', text, time: new Date() }]);
  };

  const handleDownloadCommands = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}commands list.txt`);
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'PowerStik_AI_Commands.txt'; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download commands", err);
    }
  };

  const handleQuickCommand = (cmd) => {
    setInput(cmd);
    setShowQuick(false);
    
    // Give react a tick to update the input value, then focus and select placeholder
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const start = cmd.indexOf('[');
        const end = cmd.indexOf(']');
        if (start !== -1 && end !== -1) {
          inputRef.current.setSelectionRange(start, end + 1);
        }
      }
    }, 0);
  };

  const toggleListen = () => {
    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      pushAI("Sorry, your browser doesn't support voice recognition. Try typing instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Optional: Automatically focus the input so the user can hit enter or edit
      inputRef.current?.focus();
    };

    recognition.start();
  };

  const handleSend = (e, override) => {
    if (e) e.preventDefault();
    const userText = (override || input).trim();
    if (!userText) return;

    setMessages(prev => [...prev, { sender: 'user', text: userText, time: new Date() }]);
    setInput('');
    setIsTyping(true);
    setShowQuick(false);

    setTimeout(() => {
      const result = parseAICommand(userText);

      if (result.action === 'addClient') {
        addClient({ name: result.data.name, email: 'TBD', phone: 'TBD', address: 'TBD', gstin: 'TBD' });
      } else if (result.action === 'recordPayment') {
        recordInvoicePayment(result.data.invoiceId, result.data.amount);
      } else if (result.action === 'createSalesOrder') {
        submitSalesOrder({ client: result.data.client, totalAmount: result.data.amount, items: [{ productName: 'Custom Request', category: 'Misc', qty: 1 }], files: [] });
      } else if (result.action === 'createInvoice') {
        addInvoice({ id: result.data.customId || `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`, client: result.data.client, amount: result.data.amount, date: new Date().toISOString().split('T')[0] });
      } else if (result.action === 'updateProduction') {
        updateProductionJob(result.data.jobId, 'status', result.data.status);
      } else if (result.action === 'assignArtwork') {
        updateArtworkJob(result.data.jobId, 'designer', result.data.designer);
        updateArtworkJob(result.data.jobId, 'status', 'Assigned');
      } else if (result.action === 'approveArtwork') {
        updateArtworkJob(result.data.jobId, 'status', 'Approved');
      } else if (result.action === 'createInventoryItem') {
        const newStatus = result.data.stock <= 10 ? 'Critical' : result.data.stock <= 50 ? 'Low Stock' : 'In Stock';
        addInventoryItem({ id: `INV-${Math.floor(Math.random() * 9000) + 1000}`, name: result.data.itemName, category: 'General', stock: result.data.stock, unit: result.data.unit, status: newStatus });
      } else if (result.action === 'addInventoryQty' || result.action === 'deductInventoryQty') {
        const item = inventory.find(i => i.name.toLowerCase().includes(result.data.itemName.toLowerCase()) || i.category.toLowerCase().includes(result.data.itemName.toLowerCase()));
        if (item) {
          const newQty = result.action === 'addInventoryQty' ? item.stock + result.data.qty : Math.max(0, item.stock - result.data.qty);
          const newStatus = newQty <= 10 ? 'Critical' : newQty <= 50 ? 'Low Stock' : 'In Stock';
          updateInventoryItem(item.id, { ...item, stock: newQty, status: newStatus });
        } else {
          result.message = `I couldn't find an inventory item matching "${result.data.itemName}".`;
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: result.message, time: new Date() }]);
    }, 700 + Math.random() * 400);
  };

  const fmt = (date) => date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* FAB */}
      <button
        className={`ai-fab ${isOpen ? 'ai-fab--hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="PowerStik AI"
      >
        <div className="ai-fab-ring" />
        <Sparkles size={22} />
        <span className="ai-fab-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-window">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="ai-header-title">PowerStik AI</div>
                <div className="ai-header-status">
                  <span className="ai-status-dot" />
                  Local NLP · Active
                </div>
              </div>
            </div>
            <div className="ai-header-actions">
              <button className="ai-icon-btn" onClick={handleDownloadCommands} title="Download command guide">
                <FileText size={15} />
              </button>
              <button className="ai-icon-btn" onClick={() => setShowSettings(s => !s)} title="Settings">
                <Settings size={15} />
              </button>
              <button className="ai-icon-btn ai-icon-btn--close" onClick={() => setIsOpen(false)}>
                <X size={15} />
              </button>
            </div>
          </div>

          {showSettings ? (
            <div className="ai-settings-panel">
              <div className="ai-settings-icon"><Key size={20} /></div>
              <h4>OpenAI API Key</h4>
              <p>Connect your OpenAI key to unlock full natural language AI capabilities.</p>
              <input
                type="password"
                className="ai-settings-input"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
              />
              <button className="btn-primary" onClick={saveApiKey} style={{ width: '100%', marginTop: '8px' }}>
                Save Key
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="ai-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`ai-bubble-row ${msg.sender}`}>
                    {msg.sender === 'ai' && (
                      <div className="ai-bubble-avatar">
                        <Bot size={12} />
                      </div>
                    )}
                    <div className={`ai-bubble ${msg.sender}`}>
                      <span>{msg.text}</span>
                      <time>{fmt(msg.time)}</time>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="ai-bubble-row ai">
                    <div className="ai-bubble-avatar"><Bot size={12} /></div>
                    <div className="ai-bubble ai ai-typing">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Commands */}
              {showQuick && (
                <div className="ai-quick-panel">
                  <div className="ai-quick-label"><Zap size={11} /> Quick command templates</div>
                  {QUICK_COMMANDS.map((cmd, i) => (
                    <button key={i} className="ai-quick-item" onClick={() => handleQuickCommand(cmd)}>
                      {cmd}
                    </button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <form className="ai-input-bar" onSubmit={handleSend}>
                <button
                  type="button"
                  className={`ai-quick-toggle ${showQuick ? 'active' : ''}`}
                  onClick={() => setShowQuick(s => !s)}
                  title="Quick commands"
                >
                  <Zap size={15} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  autoFocus
                />
                <button 
                  type="button" 
                  className={`ai-voice-btn ${isListening ? 'listening' : ''}`}
                  onClick={toggleListen}
                  title="Voice command"
                >
                  <Mic size={15} />
                </button>
                <button type="submit" className="ai-send-btn" disabled={!input.trim()}>
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
