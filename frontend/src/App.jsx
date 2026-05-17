import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Library from './components/Library';
import AiPlanner from './components/AiPlanner';
import Settings from './components/Settings';
import History from './components/History';
import SpaceBackground from './components/SpaceBackground';
import { 
  BookOpen, Clock, Brain, Settings as SettingsIcon, 
  LogOut, Shield, User, History as HistoryIcon
} from 'lucide-react';
import { playChime } from './utils/sound';

function MainAppContent() {
  const { user, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Sync / refresh all application states
  const refreshData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // Parallel fetches for speed!
      const [tasksRes, notesRes, plansRes] = await Promise.all([
        authFetch('/api/tasks'),
        authFetch('/api/library/notes'),
        authFetch('/api/ai/plans')
      ]);

      if (tasksRes.ok && notesRes.ok && plansRes.ok) {
        const [tasksData, notesData, plansData] = await Promise.all([
          tasksRes.json(),
          notesRes.json(),
          plansRes.json()
        ]);
        setTasks(tasksData);
        setNotes(notesData);
        setPlans(plansData);
      }
    } catch (e) {
      console.error('Failed fetching workspace data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  if (!user) {
    return (
      <>
        <SpaceBackground />
        <Login />
      </>
    );
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            tasks={tasks} 
            notes={notes} 
            plans={plans} 
            refreshData={refreshData} 
          />
        );
      case 'tasks':
        return <Tasks tasks={tasks} refreshData={refreshData} />;
      case 'library':
        return <Library notes={notes} refreshData={refreshData} />;
      case 'ai-planner':
        return <AiPlanner plans={plans} refreshData={refreshData} />;
      case 'history':
        return <History tasks={tasks} notes={notes} plans={plans} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            tasks={tasks} 
            notes={notes} 
            plans={plans} 
            refreshData={refreshData} 
          />
        );
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    playChime();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Animated 3D Three.js Deep Space Starry background */}
      <SpaceBackground />
      
      {/* Background Neon Orbs */}
      <div className="bg-orb orb-violet"></div>
      <div className="bg-orb orb-cyan"></div>

      {/* TOP HEADER NAVIGATION */}
      <header className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Logo and Brand Title */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
          onClick={() => handleTabChange('dashboard')}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0, 242, 254, 0.25)'
          }}>
            <BookOpen size={18} color="#060913" strokeWidth={2.5} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(to right, #fff, var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            StudyHub AI
          </h2>
        </div>

        {/* Tab Buttons Desktop Nav */}
        <nav style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'library', label: 'My Library' },
            { id: 'ai-planner', label: 'AI Study Plan' },
            { id: 'history', label: 'Ledger' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: activeTab === tab.id ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                color: activeTab === tab.id ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Profile and Settings controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
          <button 
            onClick={() => handleTabChange('settings')}
            style={{
              background: activeTab === 'settings' ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              border: activeTab === 'settings' ? '1px solid var(--neon-cyan)' : '1px solid transparent',
              color: activeTab === 'settings' ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: '8px',
              borderRadius: '50%',
              transition: 'var(--transition-smooth)'
            }}
            title="Configuration credentials settings"
          >
            <SettingsIcon size={18} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-glass)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem'
          }}>
            <User size={14} color="var(--neon-cyan)" />
            <span style={{ fontWeight: 600, textTransform: 'capitalize', color: '#fff' }}>{user.username}</span>
          </div>

          <button 
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '6px',
              borderRadius: '8px',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-pink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Log Out of StudyHub"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '30px 40px',
        position: 'relative',
        zIndex: 10
      }}>
        {renderActiveComponent()}
      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        zIndex: 10,
        position: 'relative'
      }}>
        🚀 StudyHub AI &copy; 2026. Made with Google DeepMind Antigravity intelligence. Secured in DB database format.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
