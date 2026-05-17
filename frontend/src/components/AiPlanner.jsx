import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Brain, Sparkles, Calendar, BookOpen, Clock, 
  Send, FileText, CheckCircle2, ChevronRight
} from 'lucide-react';
import { playChime } from '../utils/sound';

export default function AiPlanner({ plans, refreshData }) {
  const { authFetch, user } = useAuth();
  
  // Inputs
  const [subjectsUnits, setSubjectsUnits] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Selected historical plan
  const [activePlan, setActivePlan] = useState(null);

  // Loading quotes simulation
  const [loadingQuote, setLoadingQuote] = useState('');
  const quotes = [
    '🤖 Accessing Neural Exam Coach...',
    '🧠 Analyzing cognitive weight loads...',
    '📚 Segmenting subject modules...',
    '📅 Constructing day-by-day scheduler grids...',
    '⏱️ Estimating active recall study blocks...',
    '🔄 Allocating buffer review checkpoints...',
    '🚀 Compiling final peak-mind Pep Talk...'
  ];

  useEffect(() => {
    if (!loading) return;

    let index = 0;
    setLoadingQuote(quotes[0]);
    const interval = setInterval(() => {
      index = (index + 1) % quotes.length;
      setLoadingQuote(quotes[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!subjectsUnits || !deadline) {
      setError('Please provide subjects units and deadline date.');
      return;
    }

    setLoading(true);
    setError('');
    setActivePlan(null);

    try {
      const res = await authFetch('/api/ai/generate-plan', {
        method: 'POST',
        body: JSON.stringify({
          subjectsUnits,
          deadline: new Date(deadline).toISOString()
        })
      });

      if (res.ok) {
        const data = await res.json();
        playChime();
        setSubjectsUnits('');
        setDeadline('');
        refreshData();
        setActivePlan(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to generate study plan');
      }
    } catch (err) {
      setError(err.message || 'Error occurred during generation');
    } finally {
      setLoading(false);
    }
  };

  // Convert simple markdown strings into HTML paragraphs for standard rendering
  const renderMarkdown = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      // H1 Header
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx}>{trimmed.substring(2)}</h1>;
      }
      // H2 Header
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx}>{trimmed.substring(3)}</h2>;
      }
      // H3 Header
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx}>{trimmed.substring(4)}</h3>;
      }
      // Blockquote
      if (trimmed.startsWith('> ')) {
        return <blockquote key={idx}>{trimmed.substring(2)}</blockquote>;
      }
      // Bullet list items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={idx} style={{ marginLeft: '20px', marginBottom: '4px' }}>{parseInlineMarkdown(trimmed.substring(2))}</li>;
      }
      // Empty line
      if (trimmed === '') {
        return <div key={idx} style={{ height: '10px' }} />;
      }
      
      return <p key={idx}>{parseInlineMarkdown(line)}</p>;
    });
  };

  // Bold (**text**) and code (`code`) parser
  const parseInlineMarkdown = (text) => {
    // Basic inline code parse
    let parts = [text];
    
    // Bold parsing (**...**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    const elements = [];
    let lastIndex = 0;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add plain text before match
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      elements.push(<strong key={match.index} style={{ color: 'var(--neon-cyan)' }}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    
    return elements.length > 0 ? elements : text;
  };

  return (
    <div className="fade-in library-layout-grid" style={{
      minHeight: 'calc(100vh - 160px)',
      padding: '10px 0'
    }}>
      
      {/* LEFT SIDEBAR: History of Study Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Brain size={18} color="var(--neon-pink)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Study Roadmaps
            </h3>
          </div>

          <button
            onClick={() => setActivePlan(null)}
            className={`btn-neon ${!activePlan && !loading ? 'btn-cyan' : 'btn-violet'}`}
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              width: '100%',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Sparkles size={14} />
            Generate New Plan
          </button>

          {/* List of past roadmaps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
            {plans.length > 0 ? (
              plans.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).map(plan => (
                <div
                  key={plan.id}
                  onClick={() => { setActivePlan(plan); setError(''); }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: activePlan?.id === plan.id ? 'rgba(255, 0, 127, 0.1)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid',
                    borderColor: activePlan?.id === plan.id ? 'rgba(255, 0, 127, 0.2)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start', gap: '6px' }}>
                    <FileText size={14} color={activePlan?.id === plan.id ? 'var(--neon-pink)' : 'var(--text-secondary)'} style={{ marginTop: '2px' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: activePlan?.id === plan.id ? 'var(--neon-pink)' : '#fff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {plan.subjectsUnits}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Created: {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '30px 0' }}>
                No generated roadmaps.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Generator Wizard / Active View */}
      <div className="glass-panel glow-pink" style={{
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {loading ? (
          // Rotating interactive animated loading screen
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ position: 'relative' }}>
              <div className="loader loader-lg"></div>
              <Brain size={24} color="var(--neon-cyan)" style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'pulse 1.5s infinite ease-in-out'
              }} />
            </div>
            
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: 'var(--neon-cyan)',
              textShadow: '0 0 10px rgba(0, 242, 254, 0.2)'
            }}>
              Cognitive Scheduler Engaged
            </h3>
            
            <p style={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              animation: 'fadeIn 0.5s ease'
            }}>
              {loadingQuote}
            </p>
          </div>
        ) : activePlan ? (
          // Plan Renderer Screen
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--neon-pink)', fontWeight: 700 }}>
                  Active Syllabus Roadmap
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  {activePlan.subjectsUnits}
                </h3>
              </div>
              
              <div style={{
                background: 'rgba(5, 243, 162, 0.1)',
                border: '1px solid var(--neon-emerald)',
                borderRadius: '20px',
                color: 'var(--neon-emerald)',
                padding: '4px 12px',
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: 'auto'
              }}>
                <CheckCircle2 size={12} />
                AI Generated Successful
              </div>
            </div>

            <div className="plan-markdown fade-in" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '10px' }}>
              {renderMarkdown(activePlan.planContent)}
            </div>
          </div>
        ) : (
          // Input Form Screen
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--neon-cyan)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  Cognitive AI Planner
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                Input your exam units and deadline date, and let the AI map out your perfect study plan!
              </p>
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

            <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
              <div>
                <label className="label-neon">Subject Syllabus & Units to Cover</label>
                <textarea
                  className="input-glass"
                  placeholder="e.g. Unit 1: Chemistry Periodic Trends, Unit 2: Chemical Bonding & Lewis Structures, Unit 3: Stoichiometric Equations..."
                  value={subjectsUnits}
                  onChange={e => setSubjectsUnits(e.target.value)}
                  style={{
                    minHeight: '140px',
                    resize: 'vertical',
                    lineHeight: 1.5
                  }}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Separate different units or sub-topics with commas, semicolons, or lines.
                </span>
              </div>

              <div>
                <label className="label-neon">Target Exam/Completion Deadline</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} color="var(--text-muted)" style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }} />
                  <input
                    type="datetime-local"
                    className="input-glass"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    style={{ paddingLeft: '44px', fontFamily: 'monospace' }}
                    required
                  />
                </div>
              </div>

              {/* Status Alert Key */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginTop: 'auto'
              }}>
                <Brain size={24} color={user?.hasGeminiKey ? 'var(--neon-emerald)' : 'var(--neon-cyan)'} />
                <div>
                  {user?.hasGeminiKey ? (
                    <p>⚡ <strong>Gemini Flash Engaged:</strong> API connection active! Your plan will be synthesized using live, high-fidelity Google LLM models.</p>
                  ) : (
                    <p>ℹ️ <strong>Offline Core Active:</strong> Generating customized schedules via local rule engine. To activate live Google Gemini, paste your API Key inside the **Settings** page.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn-neon btn-pink"
                style={{
                  justifyContent: 'center',
                  padding: '14px',
                  width: '100%'
                }}
              >
                <Sparkles size={16} />
                Synthesize Study Plan
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
