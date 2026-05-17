import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, Key, Smartphone, Sparkles, 
  Save, ShieldCheck, HelpCircle, User
} from 'lucide-react';
import { playChime } from '../utils/sound';

export default function Settings() {
  const { authFetch, setUser } = useAuth();
  
  // Settings States
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [toPhone, setToPhone] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch saved settings on load
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await authFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setAccountSid(data.twilioConfig.accountSid || '');
          setAuthToken(data.twilioConfig.authToken || '');
          setFromPhone(data.twilioConfig.fromPhone || '');
          setToPhone(data.twilioConfig.toPhone || '');
          setGeminiApiKey(data.geminiApiKey || '');
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          twilioConfig: {
            accountSid,
            authToken,
            fromPhone,
            toPhone
          },
          geminiApiKey
        })
      });

      if (res.ok) {
        playChime();
        setSuccess('Settings successfully synchronized! 💾');
        
        // Refresh Auth Context user details
        const meRes = await authFetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(prev => ({ ...prev, ...meData }));
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to update settings');
      }
    } catch (err) {
      setError(err.message || 'Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const isTwilioActive = accountSid && authToken && fromPhone && toPhone;
  const isGeminiActive = geminiApiKey;

  return (
    <div className="fade-in" style={{ padding: '10px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
          Integration Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Connect real-time text dispatchers and high-fidelity AI models
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* SETTINGS FORM */}
        <div className="glass-panel glow-cyan" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <SettingsIcon size={18} color="var(--neon-cyan)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
              Credentials Manager
            </h3>
          </div>

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

          {success && (
            <div className="glow-emerald" style={{
              background: 'rgba(5, 243, 162, 0.1)',
              border: '1px solid var(--neon-emerald)',
              borderRadius: '8px',
              padding: '10px',
              color: '#c2ffe0',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* TWILIO SUBSECTION */}
            <div style={{
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: '16px',
              marginBottom: '8px'
            }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#fff', marginBottom: '12px' }}>
                <Smartphone size={14} color="var(--neon-cyan)" />
                Twilio SMS Dispatcher
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="label-neon">Account SID</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="AC..."
                    value={accountSid}
                    onChange={e => setAccountSid(e.target.value)}
                    style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label className="label-neon">Auth Token</label>
                  <input
                    type="password"
                    className="input-glass"
                    placeholder="••••••••••••••••"
                    value={authToken}
                    onChange={e => setAuthToken(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="label-neon">Twilio Phone #</label>
                    <input
                      type="text"
                      className="input-glass"
                      placeholder="+1..."
                      value={fromPhone}
                      onChange={e => setFromPhone(e.target.value)}
                      style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label className="label-neon">Your Phone #</label>
                    <input
                      type="text"
                      className="input-glass"
                      placeholder="+91..."
                      value={toPhone}
                      onChange={e => setToPhone(e.target.value)}
                      style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GEMINI SUBSECTION */}
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#fff', marginBottom: '12px' }}>
                <Sparkles size={14} color="var(--neon-pink)" />
                Google Gemini API Key
              </h4>

              <div>
                <label className="label-neon">API Key</label>
                <input
                  type="password"
                  className="input-glass"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                  style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-neon btn-cyan"
              disabled={loading}
              style={{
                justifyContent: 'center',
                padding: '12px',
                width: '100%',
                marginTop: '10px'
              }}
            >
              {loading ? (
                <span className="loader"></span>
              ) : (
                <>
                  <Save size={16} />
                  Synchronize Credentials
                </>
              )}
            </button>

          </form>
        </div>

        {/* STATUS AND GUIDE PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Badges */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              🔗 System Integration Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Twilio badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Twilio SMS dispatch</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: isTwilioActive ? 'rgba(5,243,162,0.1)' : 'rgba(255,170,0,0.1)',
                  color: isTwilioActive ? 'var(--neon-emerald)' : 'var(--neon-amber)',
                  border: '1px solid',
                  borderColor: isTwilioActive ? 'rgba(5,243,162,0.2)' : 'rgba(255,170,0,0.2)',
                  marginLeft: 'auto'
                }}>
                  {isTwilioActive ? 'ACTIVE DISPATCH' : 'SIMULATION MODE'}
                </span>
              </div>

              {/* Gemini badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Google Gemini LLM</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: isGeminiActive ? 'rgba(5,243,162,0.1)' : 'rgba(255,0,127,0.1)',
                  color: isGeminiActive ? 'var(--neon-emerald)' : 'var(--neon-pink)',
                  border: '1px solid',
                  borderColor: isGeminiActive ? 'rgba(5,243,162,0.2)' : 'rgba(255,0,127,0.2)',
                  marginLeft: 'auto'
                }}>
                  {isGeminiActive ? 'LIVE GEMINI FLASH' : 'LOCAL SCHEDULER'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="glass-panel glow-violet" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              💡 Integration Guide
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              <p>
                <strong>1. SMS Notifications:</strong> To receive real texts on your mobile phone, sign up at <a href="https://www.twilio.com" target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'underline' }}>twilio.com</a>, create a free trials number, and verify your personal mobile phone inside the Twilio sandbox console.
              </p>
              
              <p>
                <strong>2. Google Gemini API:</strong> To activate deep, context-aware artificial intelligence study calendars, head to <a href="https://ai.google.dev" target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'underline' }}>ai.google.dev</a>, acquire a free Gemini developer key, and save it in the credentials manager.
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'start',
                gap: '8px',
                marginTop: '6px'
              }}>
                <ShieldCheck size={16} color="var(--neon-emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>All synchronized credential configurations are stored safely in your server's backend database; they never leave your computer.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
