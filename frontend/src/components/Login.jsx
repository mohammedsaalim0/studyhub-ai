import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Key, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { playChime } from '../utils/sound';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      playChime();
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Background Neon Orbs */}
      <div className="bg-orb orb-violet"></div>
      <div className="bg-orb orb-cyan"></div>

      <div className="glass-panel glow-cyan fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 30px',
        position: 'relative',
        zIndex: 2,
        borderRadius: '24px'
      }}>
        {/* Logo/Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
            boxShadow: '0 8px 24px rgba(0, 242, 254, 0.3)',
            marginBottom: '16px'
          }}>
            <BookOpen size={32} color="#060913" strokeWidth={2.5} />
          </div>
          
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            StudyHub AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            {isRegister ? 'Create your premium account' : 'Elevate your study intelligence'}
          </p>
        </div>

        {error && (
          <div className="glow-pink" style={{
            background: 'rgba(255, 0, 127, 0.15)',
            border: '1px solid var(--neon-pink)',
            borderRadius: '10px',
            padding: '12px',
            color: '#ffc2d6',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="label-neon">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                className="input-glass"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label className="label-neon">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="password"
                className="input-glass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {isRegister && (
            <div className="slide-up">
              <label className="label-neon">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} color="var(--text-muted)" style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  type="password"
                  className="input-glass"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={isRegister}
                  disabled={loading}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-neon btn-cyan"
            disabled={loading}
            style={{
              justifyContent: 'center',
              width: '100%',
              padding: '14px',
              marginTop: '10px'
            }}
          >
            {loading ? (
              <span className="loader"></span>
            ) : (
              <>
                {isRegister ? 'Initialize Access' : 'Authenticate'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '20px'
        }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isRegister ? 'Already have an account?' : 'New to StudyHub?'}
          </span>{' '}
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--neon-cyan)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Sign In' : 'Create Free Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
