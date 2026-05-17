import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, Clock, BookOpen, Brain, Bell, 
  ArrowRight, FileText, Smartphone, AlertCircle
} from 'lucide-react';
import { playAlarm } from '../utils/sound';

export default function Dashboard({ setActiveTab, tasks, notes, plans, refreshData }) {
  const { authFetch } = useAuth();
  const [smsLogs, setSmsLogs] = useState([]);
  const [nextTask, setNextTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Fetch simulated SMS notifications from server
  const fetchSmsLogs = async () => {
    try {
      const res = await authFetch('/api/logs/sms');
      if (res.ok) {
        const data = await res.json();
        // Sort descending by timestamp
        setSmsLogs(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSmsLogs();
    const interval = setInterval(fetchSmsLogs, 4000); // refresh SMS logs every 4 seconds
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const totalNotes = notes.length;
  const totalPlans = plans.length;

  // Find next upcoming task deadline
  useEffect(() => {
    const upcoming = tasks
      .filter(t => !t.completed && new Date(t.deadline) > new Date())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
    
    setNextTask(upcoming || null);
  }, [tasks]);

  // Update countdown clock & handle deadline alerts
  useEffect(() => {
    if (!nextTask) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(nextTask.deadline) - new Date();
      
      if (diff <= 0) {
        // Deadline reached!
        setTimeLeft('DEADLINE REACHED! 🚨');
        
        // Trigger Sound Alarm!
        playAlarm();
        
        // Dispatch custom event to notify the 3D rabbit background instantly!
        window.dispatchEvent(new CustomEvent('study-deadline-expired'));
        
        // Push visual notification
        if (!activeAlerts.includes(nextTask.id)) {
          setActiveAlerts(prev => [...prev, nextTask.id]);
          refreshData(); // Refresh tasks status to register the SMS sent state
        }
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        let timeStr = '';
        if (days > 0) timeStr += `${days}d `;
        if (hours > 0 || days > 0) timeStr += `${hours}h `;
        timeStr += `${mins}m ${secs}s`;

        setTimeLeft(timeStr);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextTask, activeAlerts]);

  // Handle client-side warning popup dismissals
  const dismissAlert = (id) => {
    setActiveAlerts(prev => prev.filter(aid => aid !== id));
  };

  return (
    <div className="fade-in" style={{ padding: '10px 0' }}>
      
      {/* Visual deadline alerts inside browser */}
      {activeAlerts.map(alertId => {
        const matchingTask = tasks.find(t => t.id === alertId);
        if (!matchingTask) return null;
        return (
          <div key={alertId} className="glow-pink slide-up" style={{
            background: 'rgba(255, 0, 127, 0.2)',
            border: '1px solid var(--neon-pink)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            gap: '16px',
            position: 'relative',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={28} color="var(--neon-pink)" className="pulse" />
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff' }}>
                  ⏳ DEADLINE REACHED: {matchingTask.title}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Your scheduled deadline for <strong>{matchingTask.subject}</strong> is here! High-priority notification sent.
                </p>
              </div>
            </div>
            <button 
              onClick={() => dismissAlert(alertId)}
              className="btn-neon btn-pink" 
              style={{ padding: '6px 14px', fontSize: '0.75rem', marginLeft: 'auto' }}
            >
              Acknowledge
            </button>
          </div>
        );
      })}

      {/* Grid of Key Metrics */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card glow-cyan">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Tasks</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>
              {activeTasks}
            </h3>
          </div>
          <div className="metric-card-icon" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--neon-cyan)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="glass-panel metric-card glow-emerald">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Completed Tasks</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>
              {completedTasks}
            </h3>
          </div>
          <div className="metric-card-icon" style={{ background: 'rgba(5, 243, 162, 0.1)', color: 'var(--neon-emerald)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="glass-panel metric-card glow-violet">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Library Notes</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>
              {totalNotes}
            </h3>
          </div>
          <div className="metric-card-icon" style={{ background: 'rgba(155, 81, 224, 0.1)', color: 'var(--neon-violet)' }}>
            <BookOpen size={22} />
          </div>
        </div>

        <div className="glass-panel metric-card glow-pink">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Study Plans</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>
              {totalPlans}
            </h3>
          </div>
          <div className="metric-card-icon" style={{ background: 'rgba(255, 0, 127, 0.1)', color: 'var(--neon-pink)' }}>
            <Brain size={22} />
          </div>
        </div>
      </div>

      {/* Main Layout Rows */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        
        {/* Countdown & Reminders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel glow-cyan" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05, transform: 'rotate(20deg)' }}>
              <Clock size={160} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>
              🎯 Next Scheduled Deadline
            </h3>
            
            {nextTask ? (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600,
                  color: 'var(--neon-cyan)',
                  marginBottom: '6px'
                }}>
                  {nextTask.subject}
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>
                  {nextTask.title}
                </h4>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Time Remaining
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: timeLeft.includes('🚨') ? 'var(--neon-pink)' : 'var(--neon-cyan)',
                    letterSpacing: '1px',
                    textShadow: timeLeft.includes('🚨') ? '0 0 10px rgba(255,0,127,0.3)' : '0 0 10px rgba(0,242,254,0.3)'
                  }}>
                    {timeLeft}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                <Clock size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>No upcoming active deadlines.</p>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="btn-neon btn-cyan" 
                  style={{ marginTop: '14px', fontSize: '0.75rem', padding: '6px 14px' }}
                >
                  Create Task
                </button>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>
              ⚡ Study Dashboard Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div 
                onClick={() => setActiveTab('tasks')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.2)';
                  e.currentTarget.style.background = 'rgba(0, 242, 254, 0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={18} color="var(--neon-cyan)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Manage Exam Deadlines</span>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
              </div>

              <div 
                onClick={() => setActiveTab('library')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(155, 81, 224, 0.2)';
                  e.currentTarget.style.background = 'rgba(155, 81, 224, 0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={18} color="var(--neon-violet)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Open Notes Library</span>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
              </div>

              <div 
                onClick={() => setActiveTab('ai-planner')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 0, 127, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 0, 127, 0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Brain size={18} color="var(--neon-pink)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>AI Study Schedule Builder</span>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Simulated SMS Logs */}
        <div className="glass-panel glow-violet" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '340px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <Smartphone size={20} color="var(--neon-violet)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
              📡 SMS Notification Service Logs
            </h3>
            <span style={{
              marginLeft: 'auto',
              background: 'rgba(155, 81, 224, 0.1)',
              color: 'var(--neon-violet)',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '10px',
              border: '1px solid rgba(155, 81, 224, 0.2)'
            }}>
              Active
            </span>
          </div>

          <div style={{
            background: '#04060b',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '10px',
            padding: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            maxHeight: '260px',
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}>
            {smsLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {smsLogs.map(log => (
                  <div key={log.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    paddingBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>📝 Task: {log.taskTitle} ({log.subject})</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ color: 'var(--neon-cyan)' }}>
                      &gt; {log.body}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.65rem',
                      marginTop: '4px',
                      color: log.status.includes('SIMULATED') ? 'var(--neon-amber)' : 'var(--neon-emerald)'
                    }}>
                      [{log.status}]
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                margin: 'auto',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                <Smartphone size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
                <p>&gt; SMS logger listening...</p>
                <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  Deadlines reached or tested will dump notification transcripts here.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
