import { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle, Clock, AlertCircle, Upload, MessageSquare, Paperclip, ChevronDown, MoreVertical, Edit2, UserPlus, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import PromptModal from '../components/PromptModal';
import './Dashboard.css';

export default function Artwork() {
  const { loading, artworkJobs: jobs, addArtworkJob, updateArtworkJob, deleteArtworkJob: globalDeleteJob } = useGlobalState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [draggingJobId, setDraggingJobId] = useState(null);
  
  // Track which card's dropdown is currently open
  const [activeDropdown, setActiveDropdown] = useState(null);
  // Track which cards are expanded
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  const boardRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadTargetId, setUploadTargetId] = useState(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'prompt', title: '', defaultValue: '', onConfirm: null });

  const openPrompt = (title, defaultValue, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'prompt', title, defaultValue, onConfirm });
  };

  const openConfirm = (title, onConfirm) => {
    setModalConfig({ isOpen: true, type: 'confirm', title, defaultValue: '', onConfirm });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleModalConfirm = (value) => {
    const callback = modalConfig.onConfirm;
    closeModal();
    if (callback) {
      setTimeout(() => callback(value), 10);
    }
  };

  useEffect(() => {
    // Close dropdowns if clicking outside
    const handleClickOutside = (e) => {
      if (boardRef.current && !boardRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data provided by GlobalState

  const handleUpload = (id, e) => {
    e.stopPropagation();
    setUploadTargetId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && uploadTargetId) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const job = jobs.find(j => j.id === uploadTargetId);
        updateArtworkJob(uploadTargetId, 'proofUrl', ev.target.result);
        updateArtworkJob(uploadTargetId, 'files', job.files + 1);
        updateArtworkJob(uploadTargetId, 'comments', job.comments + 1);
        setUploadTargetId(null);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (e.target) e.target.value = null;
  };

  const deleteJob = (id, e) => {
    e.stopPropagation();
    openConfirm(`Are you sure you want to delete job ${id}?`, (confirmed) => {
      if (confirmed) {
        globalDeleteJob(id);
      }
    });
    setActiveDropdown(null);
  };

  const editJob = (id, e) => {
    e.stopPropagation();
    const job = jobs.find(j => j.id === id);
    openPrompt("Edit Design Name:", job.designName, (newName) => {
      if (newName && newName.trim() !== "") {
        updateArtworkJob(id, 'designName', newName);
      }
    });
    setActiveDropdown(null);
  };

  const assignDesigner = (id, e) => {
    e.stopPropagation();
    const job = jobs.find(j => j.id === id);
    openPrompt("Assign to Designer (Name):", job.designer, (newDesigner) => {
      if (newDesigner && newDesigner.trim() !== "") {
        updateArtworkJob(id, 'designer', newDesigner);
      }
    });
    setActiveDropdown(null);
  };

  const toggleExpand = (id) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddJob = (type) => {
    setMenuOpen(false);
    openPrompt(`[${type}] Enter Client Name:`, "New Client", (client) => {
      if (!client) return;
      
      openPrompt("Enter Design Task Name:", "New Artwork Task", (designName) => {
        if (!designName) return;

        const newJob = {
          id: `AW-500${Math.floor(Math.random() * 90) + 10}`,
          soId: `SO-${Math.floor(Math.random() * 900) + 1000}`,
          client: client,
          designName: designName,
          status: 'Assigned',
          priority: 'Medium',
          designer: 'Unassigned',
          comments: 0,
          files: 0,
          version: 1
        };
        
        addArtworkJob(newJob);
      });
    });
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData('jobId', jobId);
    setDraggingJobId(jobId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingJobId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) {
      updateArtworkJob(jobId, 'status', newStatus);
    }
    setDraggingJobId(null);
  };

  if (loading) {
    return <div className="loading-state">Loading Design Board...</div>;
  }

  const columns = [
    { title: 'Assigned (To Do)', key: 'Assigned', icon: <Clock size={16} color="var(--text-muted)" /> },
    { title: 'In Progress', key: 'In Progress', icon: <PenTool size={16} color="#60A5FA" /> },
    { title: 'Pending Approval', key: 'Pending Approval', icon: <AlertCircle size={16} color="#FACC15" /> },
    { title: 'Approved', key: 'Approved', icon: <CheckCircle size={16} color="#4ADE80" /> }
  ];

  return (
    <div className="dashboard-layout animate-fade-in" ref={boardRef}>
      <div className="dashboard-content" style={{ padding: '0', marginLeft: '0', maxWidth: '100%' }}>
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Artwork Kanban Board</h2>
            <p className="text-muted">Manage the design pipeline visually. Drag and drop cards across stages.</p>
          </div>
          
          <div className="so-actions" style={{ position: 'relative' }}>
            <button 
              className="btn-primary flex-center gap-2" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Upload size={16} /> New Design Request <ChevronDown size={16} />
            </button>
            
            {menuOpen && (
              <div className="glass-panel" style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '8px', 
                width: '220px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <button className="menu-item" style={{ background: 'transparent', border: 'none', textAlign: 'left', padding: '10px', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' }} onClick={() => handleAddJob("Client Request")}>
                  Request from Client
                </button>
                <button className="menu-item" style={{ background: 'transparent', border: 'none', textAlign: 'left', padding: '10px', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' }} onClick={() => handleAddJob("Internal Task")}>
                  Internal Design Task
                </button>
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                <button className="menu-item" style={{ background: 'transparent', border: 'none', textAlign: 'left', padding: '10px', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px' }} onClick={() => handleAddJob("Existing Artwork Upload")}>
                  Upload Existing Artwork
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Kanban Board Container */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, minmax(300px, 1fr))', 
          gap: '1.5rem', 
          overflowX: 'auto',
          paddingBottom: '2rem'
        }}>
          {columns.map(col => {
            const colJobs = jobs.filter(j => j.status === col.key);
            
            return (
              <div 
                key={col.key} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
                style={{ 
                  background: 'rgba(20, 20, 20, 0.4)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  minHeight: '600px',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    {col.icon} {col.title}
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                    {colJobs.length}
                  </div>
                </div>

                {colJobs.map(job => {
                  const isExpanded = expandedCards.has(job.id);
                  return (
                    <div 
                      key={job.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => toggleExpand(job.id)}
                      className="glass-panel" 
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        cursor: 'grab',
                        position: 'relative',
                        opacity: draggingJobId === job.id ? 0.5 : 1,
                        borderLeft: job.priority === 'High' ? '4px solid #F87171' : 
                                    job.priority === 'Medium' ? '4px solid #FACC15' : '4px solid transparent',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {/* Compact Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span className="text-gradient font-bold text-sm">{job.id}</span>
                            <span style={{ fontSize: '10px', background: 'rgba(96,165,250,0.15)', color: '#60A5FA', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>V{job.version || 1}</span>
                            {!isExpanded && <span className="text-muted" style={{ fontSize: '10px' }}>{job.client}</span>}
                          </div>
                          <h4 style={{ margin: '0', fontSize: '15px' }}>{job.designName}</h4>
                        </div>
                        
                        {/* Job Card Dropdown Trigger */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button 
                            className="icon-btn" 
                            style={{ padding: '2px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === job.id ? null : job.id); }}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        {/* Job Card Dropdown Menu */}
                        {activeDropdown === job.id && (
                          <div className="glass-panel" style={{
                            position: 'absolute',
                            top: '32px',
                            right: '8px',
                            width: '160px',
                            zIndex: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '4px',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                          }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }} onClick={(e) => editJob(job.id, e)}>
                              <Edit2 size={14} /> Edit Details
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }} onClick={(e) => assignDesigner(job.id, e)}>
                              <UserPlus size={14} /> Assign Designer
                            </button>
                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', textAlign: 'left', padding: '8px 12px', color: '#F87171', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }} onClick={(e) => deleteJob(job.id, e)}>
                              <Trash2 size={14} /> Delete Job
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Expanded Content */}
                      {isExpanded && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span className="text-muted text-sm">Client: <strong>{job.client}</strong></span>
                            <span className="text-muted text-sm">SO: {job.soId}</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px' }}>
                              {job.designer}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><Paperclip size={12} /> {job.files}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><MessageSquare size={12} /> {job.comments}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button 
                              onClick={(e) => handleUpload(job.id, e)}
                              style={{ background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Upload size={12} /> Upload Proof
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateArtworkJob(job.id, 'version', (job.version || 1) + 1); }}
                              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60A5FA', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              🔼 Bump to V{(job.version || 1) + 1}
                            </button>
                          </div>
                          
                          {job.proofUrl && (
                            <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                              <img src={job.proofUrl} alt="Proof" style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '200px', background: 'var(--bg-tertiary)' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
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

      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
    </div>
  );
}
