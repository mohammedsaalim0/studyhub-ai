import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, Circle, Clock, Trash2, Plus, 
  Send, HelpCircle, BellRing, Volume2, Calendar
} from 'lucide-react';
import { playChime, playAlarm } from '../utils/sound';

export default function Tasks({ tasks, refreshData }) {
  const { authFetch } = useAuth();
  
  // Add task states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState('active'); // active, completed, all

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title || !deadline) {
      setError('Title and deadline are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          subject: subject || 'General',
          deadline: new Date(deadline).toISOString()
        })
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setSubject('');
        setDeadline('');
        setShowAddForm(false);
        playChime();
        refreshData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to create task');
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const res = await authFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !task.completed })
      });
      if (res.ok) {
        playChime();
        
        // Dispatch custom victory event to make the 3D rabbit super happy and dance!
        if (!task.completed) {
          window.dispatchEvent(new CustomEvent('study-task-completed'));
        }
        
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await authFetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger instant test SMS from backend
  const handleTestSMS = async (task) => {
    try {
      const res = await authFetch(`/api/tasks/${task.id}/test-sms`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        playChime();
        alert(data.simulated 
          ? '🔔 SMS SIMULATION FIRED! Navigate to the Dashboard to view the SMS transmission in your console logger!'
          : '🚀 Twilio dispatch successful! Check your verified phone number for the study notification!'
        );
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="fade-in" style={{ padding: '10px 0' }}>
      
      {/* Header and Control row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            Exam & Study Tasks
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Maintain deadlines, schedule alerts, and test SMS/Audio integrations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <button 
            onClick={() => { playAlarm(); }}
            className="btn-neon btn-violet"
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            title="Synthesize and test the high-tech alert alarm sound instantly"
          >
            <Volume2 size={16} />
            Test Alarm Sound
          </button>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-neon btn-cyan"
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Add Task Form Glass Panel */}
      {showAddForm && (
        <div className="glass-panel glow-cyan slide-up" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            ✨ Create Study Task & Deadline
          </h3>

          {error && (
            <div className="glow-pink" style={{
              background: 'rgba(255, 0, 127, 0.1)',
              border: '1px solid var(--neon-pink)',
              borderRadius: '8px',
              padding: '10px',
              color: '#ffc2d6',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAddTask} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label className="label-neon">Task Title</label>
              <input
                type="text"
                className="input-glass"
                placeholder="e.g. Solve Math Assignment 4"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="label-neon">Subject / Topic</label>
              <input
                type="text"
                className="input-glass"
                placeholder="e.g. Calculus"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label-neon">Deadline Date & Time</label>
              <input
                type="datetime-local"
                className="input-glass"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                required
                disabled={loading}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label-neon">Description (Optional)</label>
              <input
                type="text"
                className="input-glass"
                placeholder="Brief study description..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              justifyContent: 'end',
              gap: '12px',
              marginTop: '8px'
            }}>
              <button
                type="button"
                className="btn-neon btn-pink"
                onClick={() => setShowAddForm(false)}
                disabled={loading}
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-neon btn-cyan"
                disabled={loading}
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                {loading ? <span className="loader"></span> : 'Schedule Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Selectors */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        paddingBottom: '12px'
      }}>
        {['active', 'completed', 'all'].map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            style={{
              background: filter === option ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              border: '1px solid',
              borderColor: filter === option ? 'var(--neon-cyan)' : 'transparent',
              color: filter === option ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              padding: '6px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              transition: 'var(--transition-smooth)'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Task List Grid */}
      {filteredTasks.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredTasks.map(task => {
            const isOverdue = new Date(task.deadline) < new Date() && !task.completed;
            return (
              <div 
                key={task.id} 
                className={`glass-panel glow-${task.completed ? 'emerald' : (isOverdue ? 'pink' : 'cyan')}`}
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  opacity: task.completed ? 0.75 : 1
                }}
              >
                {/* Subject Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                    color: task.completed ? 'var(--neon-emerald)' : (isOverdue ? 'var(--neon-pink)' : 'var(--neon-cyan)')
                  }}>
                    {task.subject}
                  </span>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-pink)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Title and details */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <button 
                    onClick={() => handleToggleComplete(task)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: task.completed ? 'var(--neon-emerald)' : 'var(--text-secondary)',
                      marginTop: '2px',
                      padding: 0
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={20} color="var(--neon-emerald)" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'var(--text-secondary)' : '#fff'
                    }}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        marginTop: '4px',
                        lineHeight: 1.4
                      }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Deadline Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: isOverdue ? 'var(--neon-pink)' : 'var(--text-secondary)',
                  marginTop: 'auto',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <Calendar size={14} />
                  <span>
                    Deadline:{' '}
                    <strong style={{ fontFamily: 'monospace' }}>
                      {new Date(task.deadline).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </strong>
                  </span>
                  {isOverdue && <span style={{ color: 'var(--neon-pink)', fontWeight: 600 }}>[OVERDUE]</span>}
                </div>

                {/* Task Action Controls Row */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`btn-neon ${task.completed ? 'btn-emerald' : 'btn-cyan'}`}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flex: 1.3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {task.completed ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Completed! 🎉</span>
                      </>
                    ) : (
                      <>
                        <Circle size={13} />
                        <span>Complete Task</span>
                      </>
                    )}
                  </button>

                  {!task.completed && (
                    <button
                      onClick={() => handleTestSMS(task)}
                      className="btn-neon btn-violet"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.72rem',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      title="Trigger the backend SMS Notifier immediately for testing"
                    >
                      <Send size={11} />
                      <span>Test SMS</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{
          padding: '60px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '8px' }}>
            No Tasks Located
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            {filter === 'active' ? 'Excellent work! You have cleared your study task list.' : 'You have no scheduled tasks here.'}
          </p>
        </div>
      )}
    </div>
  );
}
