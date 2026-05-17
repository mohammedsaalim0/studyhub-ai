import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  History as HistoryIcon, CheckCircle2, FileText, 
  Brain, Smartphone, Calendar, Search, Trash2, AlertCircle
} from 'lucide-react';

export default function History({ tasks, notes, plans }) {
  const { authFetch: apiFetch } = useAuth();
  const [smsLogs, setSmsLogs] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch simulated SMS notifications from server to compile into timeline
  const fetchSmsLogs = async () => {
    try {
      const res = await apiFetch('/api/logs/sms');
      if (res.ok) {
        const data = await res.json();
        setSmsLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSmsLogs();
  }, []);

  // Compile all activities into one unified timeline ledger
  const compileTimeline = () => {
    const activities = [];

    // 1. Completed Tasks History
    tasks.filter(t => t.completed).forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        title: `Task Completed: ${task.title}`,
        subtitle: `Subject: ${task.subject || 'General'}`,
        timestamp: task.updatedAt || task.createdAt || new Date().toISOString(),
        details: 'You checked off this task and successfully mastered this exam topic!',
        color: 'var(--neon-emerald)',
        icon: <CheckCircle2 size={16} />
      });
    });

    // 1.5. Overdue / Missed Tasks History
    tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).forEach(task => {
      activities.push({
        id: `task-miss-${task.id}`,
        type: 'task-miss',
        title: `Deadline Missed: ${task.title}`,
        subtitle: `Subject: ${task.subject || 'General'}`,
        timestamp: task.deadline,
        details: 'You missed this study task deadline! Time to focus up and catch up!',
        color: 'var(--neon-pink)',
        icon: <AlertCircle size={16} />
      });
    });

    // 2. Drafted Notes History
    notes.forEach(note => {
      activities.push({
        id: `note-${note.id}`,
        type: 'note',
        title: `Note Created: ${note.noteTitle || 'Untitled Note'}`,
        subtitle: `Subject Folder: ${note.folderName}`,
        timestamp: note.createdAt || new Date().toISOString(),
        details: note.noteContent ? `${note.noteContent.substring(0, 100)}...` : 'Created empty study draft.',
        color: 'var(--neon-violet)',
        icon: <FileText size={16} />
      });
    });

    // 3. AI Planners Generated
    plans.forEach(plan => {
      const focusText = plan.subjectsUnits || plan.syllabus || 'Custom Plan';
      activities.push({
        id: `plan-${plan.id}`,
        type: 'plan',
        title: `AI Schedule Built: Exam Prep Plan`,
        subtitle: `Topic Focus: ${focusText.substring(0, 40)}${focusText.length > 40 ? '...' : ''}`,
        timestamp: plan.createdAt || new Date().toISOString(),
        details: `Configured customized exam countdown schedules using Gemini cognitive AI intelligence.`,
        color: 'var(--neon-pink)',
        icon: <Brain size={16} />
      });
    });

    // 4. SMS Alerts Sent
    smsLogs.forEach(log => {
      activities.push({
        id: `sms-${log.id}`,
        type: 'sms',
        title: `SMS Dispatch Sent`,
        subtitle: `Task Target: "${log.taskTitle}"`,
        timestamp: log.timestamp || new Date().toISOString(),
        details: `Message: "${log.body}" [Status: ${log.status}]`,
        color: 'var(--neon-cyan)',
        icon: <Smartphone size={16} />
      });
    });

    // Sort descending by date
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const allActivities = compileTimeline();

  // Apply filters
  const filteredActivities = allActivities.filter(act => {
    const matchesFilter = filterType === 'all' || act.type === filterType;
    const matchesSearch = 
      (act.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.details || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fade-in" style={{ padding: '10px 0' }}>
      
      {/* Header Panel */}
      <div className="glass-panel glow-cyan" style={{ padding: '30px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(0, 242, 254, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-cyan)'
          }}>
            <HistoryIcon size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              Study Ledger & Activity History
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Audit your academic milestones, created knowledge resources, and automated notification dispatches.
            </p>
          </div>
        </div>
      </div>

      {/* Control Filters and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="input-glass"
            placeholder="Search academic history log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All History' },
            { id: 'task', label: 'Milestones' },
            { id: 'note', label: 'Drafted Notes' },
            { id: 'plan', label: 'AI Planners' },
            { id: 'sms', label: 'SMS Alerts' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              style={{
                background: filterType === btn.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: filterType === btn.id ? '1px solid var(--neon-cyan)' : '1px solid rgba(255,255,255,0.05)',
                color: filterType === btn.id ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Ledger List */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        {filteredActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            
            {/* Center vertical line for timeline */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '10px',
              bottom: '10px',
              width: '2px',
              background: 'linear-gradient(to bottom, rgba(0, 242, 254, 0.15), rgba(155, 81, 224, 0.05))',
              zIndex: 0
            }} />

            {filteredActivities.map((act) => (
              <div key={act.id} className="slide-up" style={{
                display: 'flex',
                gap: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Node icon with colored glow */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--card-bg)',
                  border: `2px solid ${act.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: act.color,
                  boxShadow: `0 0 10px ${act.color}40`,
                  flexShrink: 0
                }}>
                  {act.icon}
                </div>

                {/* Content Panel */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{act.title}</h4>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{act.subtitle}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      alignSelf: 'start'
                    }}>
                      <Calendar size={12} />
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4', marginTop: '4px' }}>
                    {act.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <HistoryIcon size={48} style={{ marginBottom: '14px', opacity: 0.3 }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '4px' }}>No history records found</h3>
            <p style={{ fontSize: '0.85rem' }}>
              {searchQuery ? 'Try clearing your search filters.' : 'Complete tasks, take library notes, or generate plans to build your activity ledger!'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
