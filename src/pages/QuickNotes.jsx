import { useState } from 'react';
import { StickyNote, Plus, Trash2, Edit3, Check } from 'lucide-react';
import './Dashboard.css';

const STORAGE_KEY = 'PowerStik_QuickNotes';
const NOTE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6'];

const loadNotes = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

export default function QuickNotes() {
  const [notes, setNotes] = useState(loadNotes);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [newText, setNewText] = useState('');
  const [newColor, setNewColor] = useState(NOTE_COLORS[0]);

  const save = (updated) => {
    setNotes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addNote = () => {
    if (!newText.trim()) return;
    const note = {
      id: Date.now(),
      text: newText.trim(),
      color: newColor,
      created: new Date().toISOString(),
      pinned: false
    };
    save([note, ...notes]);
    setNewText('');
  };

  const deleteNote = (id) => save(notes.filter(n => n.id !== id));

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = (id) => {
    save(notes.map(n => n.id === id ? { ...n, text: editText } : n));
    setEditingId(null);
  };

  const togglePin = (id) => save(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StickyNote size={28} className="icon-accent" />
            Quick Notes
          </h1>
          <p className="page-subtitle">Sticky notes board — jot down reminders, tasks, and ideas</p>
        </div>
      </div>

      {/* Add Note */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <textarea
            className="form-input"
            placeholder="Write a quick note..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') addNote(); }}
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {NOTE_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', background: c, border: newColor === c ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer', padding: 0
                }}
              />
            ))}
          </div>
          <button className="btn-primary" onClick={addNote} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={15} /> Add Note
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>
          <StickyNote size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>No notes yet — add your first note above!</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {sorted.map(note => (
          <div
            key={note.id}
            style={{
              background: `linear-gradient(145deg, ${note.color}22, ${note.color}12)`,
              border: `1px solid ${note.color}40`,
              borderRadius: '12px',
              padding: '1rem',
              position: 'relative',
              boxShadow: `0 4px 20px ${note.color}20`,
              transition: 'transform 0.2s ease'
            }}
          >
            {note.pinned && (
              <div style={{ position: 'absolute', top: '-6px', right: '12px', width: '12px', height: '24px', background: note.color, borderRadius: '0 0 4px 4px', opacity: 0.8 }} />
            )}

            {editingId === note.id ? (
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', fontSize: '0.88rem', resize: 'vertical', outline: 'none', marginBottom: '0.5rem', fontFamily: 'inherit' }}
                rows={4}
                autoFocus
              />
            ) : (
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{note.text}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', opacity: 0.5 }}>{new Date(note.created).toLocaleDateString('en-IN')}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {editingId === note.id ? (
                  <button onClick={() => saveEdit(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '3px' }}>
                    <Check size={14} />
                  </button>
                ) : (
                  <button onClick={() => startEdit(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, padding: '3px' }}>
                    <Edit3 size={13} />
                  </button>
                )}
                <button
                  onClick={() => togglePin(note.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? note.color : 'inherit', opacity: note.pinned ? 1 : 0.6, padding: '3px', fontSize: '12px' }}
                  title={note.pinned ? 'Unpin' : 'Pin'}
                >
                  📌
                </button>
                <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.7, padding: '3px' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', opacity: 0.4, textAlign: 'center' }}>
        Tip: Press Ctrl + Enter to quickly add a note
      </p>
    </div>
  );
}
