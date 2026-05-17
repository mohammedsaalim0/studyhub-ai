import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FolderPlus, Folder, FileText, Plus, Save, Trash2, 
  Upload, Download, Database, ShieldAlert, Sparkles
} from 'lucide-react';
import { playChime } from '../utils/sound';

export default function Library({ notes, refreshData }) {
  const { authFetch } = useAuth();
  
  // Folders and selection
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);
  
  // Note editing states
  const [activeNote, setActiveNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [attachment, setAttachment] = useState(null); // { name, type, data }
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Extract unique folder names
  useEffect(() => {
    const list = [...new Set(notes.map(n => n.folderName))];
    setFolders(list);
    
    // Auto-select first folder if nothing selected
    if (list.length > 0 && !selectedFolder) {
      setSelectedFolder(list[0]);
    }
  }, [notes]);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    
    const folder = newFolderName.trim();
    if (!folders.includes(folder)) {
      setFolders([...folders, folder]);
    }
    setSelectedFolder(folder);
    setNewFolderName('');
    setShowAddFolder(false);
    playChime();
  };

  const handleSelectNote = (note) => {
    setActiveNote(note);
    setNoteTitle(note.noteTitle);
    setNoteContent(note.noteContent);
    if (note.fileData) {
      setAttachment({
        name: note.fileName,
        type: note.fileType,
        data: note.fileData
      });
    } else {
      setAttachment(null);
    }
    setError('');
    setSuccess('');
  };

  const handleCreateNewNote = () => {
    if (!selectedFolder) {
      setError('Please create or select a subject folder first.');
      return;
    }
    setActiveNote({ id: null, folderName: selectedFolder });
    setNoteTitle('');
    setNoteContent('');
    setAttachment(null);
    setError('');
    setSuccess('');
  };

  // Convert uploaded file to base64 to store in database
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Cap file size at 5MB for JSON storage safety
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum supported size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        data: reader.result // Base64 Data URL
      });
      playChime();
      setSuccess(`File "${file.name}" loaded for database upload!`);
    };
    reader.onerror = () => {
      setError('Failed reading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNote = async () => {
    if (!noteTitle) {
      setError('Please input a note title.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        folderName: selectedFolder,
        noteTitle,
        noteContent
      };

      if (activeNote.id) {
        payload.id = activeNote.id;
      }

      if (attachment) {
        payload.fileData = attachment.data;
        payload.fileName = attachment.name;
        payload.fileType = attachment.type;
      } else {
        payload.fileData = null;
        payload.fileName = null;
        payload.fileType = null;
      }

      const res = await authFetch('/api/library/notes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        playChime();
        setSuccess('Note successfully secured inside database! 💾');
        refreshData();
        setActiveNote(saved);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save note.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note from the database?')) return;
    try {
      const res = await authFetch(`/api/library/notes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setActiveNote(null);
        setNoteTitle('');
        setNoteContent('');
        setAttachment(null);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger file download from base64 DB string
  const handleDownloadAttachment = () => {
    if (!attachment) return;
    
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter notes inside selected folder
  const folderNotes = notes.filter(n => n.folderName === selectedFolder);

  return (
    <div className="fade-in library-layout-grid" style={{
      minHeight: 'calc(100vh - 160px)',
      padding: '10px 0'
    }}>
      
      {/* SIDEBAR: Folder Subjects and Note list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Folders Management Panel */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
              📚 Subject Folders
            </h3>
            <button 
              onClick={() => setShowAddFolder(!showAddFolder)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--neon-cyan)',
                cursor: 'pointer'
              }}
            >
              <FolderPlus size={18} />
            </button>
          </div>

          {showAddFolder && (
            <form onSubmit={handleCreateFolder} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="input-glass"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                required
              />
              <button 
                type="submit"
                className="btn-neon btn-cyan" 
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                Add
              </button>
            </form>
          )}

          {/* Folder List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {folders.length > 0 ? (
              folders.map(fold => (
                <div
                  key={fold}
                  onClick={() => { setSelectedFolder(fold); setActiveNote(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    background: selectedFolder === fold ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedFolder === fold ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                    color: selectedFolder === fold ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Folder size={16} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fold}
                  </span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block', padding: '10px 0' }}>
                No subject folders.
              </span>
            )}
          </div>
        </div>

        {/* Selected Folder Notes List */}
        {selectedFolder && (
          <div className="glass-panel" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                📝 Subject Notes
              </h3>
              
              <button 
                onClick={handleCreateNewNote}
                className="btn-neon btn-cyan" 
                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
              >
                <Plus size={12} />
                New Note
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
              {folderNotes.length > 0 ? (
                folderNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      background: activeNote?.id === note.id ? 'rgba(155, 81, 224, 0.1)' : 'rgba(255,255,255,0.01)',
                      border: '1px solid',
                      borderColor: activeNote?.id === note.id ? 'rgba(155, 81, 224, 0.2)' : 'transparent',
                      color: activeNote?.id === note.id ? 'var(--neon-violet)' : 'var(--text-secondary)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <FileText size={14} />
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      fontWeight: activeNote?.id === note.id ? 600 : 400
                    }}>
                      {note.noteTitle}
                    </span>
                    {note.fileData && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)' }}>[Attachment]</span>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>
                  Folder is empty.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* EDITOR PANE */}
      <div className="glass-panel glow-violet" style={{
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {activeNote ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            
            {/* Editor Action Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: '16px'
            }}>
              <div>
                <span style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'var(--neon-violet)',
                  fontWeight: 700
                }}>
                  Folder: {selectedFolder}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                  {activeNote.id ? 'Edit Study Note' : 'Drafting Study Note'}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                {activeNote.id && (
                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="btn-neon btn-pink"
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSaveNote}
                  className="btn-neon btn-cyan"
                  disabled={loading}
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  {loading ? (
                    <span className="loader"></span>
                  ) : (
                    <>
                      <Save size={14} />
                      Secure Note
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="glow-pink" style={{
                background: 'rgba(255, 0, 127, 0.1)',
                border: '1px solid var(--neon-pink)',
                borderRadius: '8px',
                padding: '10px',
                color: '#ffc2d6',
                fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div className="glow-emerald" style={{
                background: 'rgba(5, 243, 162, 0.1)',
                border: '1px solid var(--neon-emerald)',
                borderRadius: '8px',
                padding: '10px',
                color: '#c2ffe0',
                fontSize: '0.85rem'
              }}>
                {success}
              </div>
            )}

            {/* Note Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label-neon">Note Title</label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="e.g. Chapter 2 Formulas"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="label-neon">Note Content (Markdown Supported)</label>
                <textarea
                  className="input-glass"
                  placeholder="Draft your summaries, formulas, and mock questions here..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  style={{
                    minHeight: '260px',
                    resize: 'vertical',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* Attachment File Section */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} color="var(--neon-cyan)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Secure File inside DB</span>
                  </div>
                  
                  {/* File picker */}
                  <input
                    type="file"
                    id="db-file-picker"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="db-file-picker" 
                    className="btn-neon btn-cyan" 
                    style={{ padding: '6px 14px', fontSize: '0.75rem', cursor: 'pointer', margin: 0 }}
                  >
                    Select File
                  </label>

                  {attachment && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.75rem',
                      marginLeft: 'auto'
                    }}>
                      <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📎 {attachment.name}
                      </span>
                      <button 
                        onClick={handleDownloadAttachment}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--neon-cyan)',
                          cursor: 'pointer',
                          display: 'inline-flex'
                        }}
                        title="Download loaded file out of DB"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => { setAttachment(null); setSuccess(''); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--neon-pink)',
                          cursor: 'pointer',
                          display: 'inline-flex'
                        }}
                        title="Clear attachment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  marginTop: '10px'
                }}>
                  <Database size={12} color="var(--neon-emerald)" />
                  <span>Files are stored directly in your server database file (no phone external storage involved)</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <Database size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '8px' }}>
              Secure Database Library
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.4 }}>
              Select a Subject Folder on the left and choose a note, or click <strong>New Note</strong> to draft summaries and upload study files directly to your database.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
