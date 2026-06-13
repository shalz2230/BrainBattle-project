import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { changePassword as changeApi } from '../api/api';
import { useToast } from '../hooks/useToast';

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, ToastEl } = useToast();

  const prefillEmail = location.state?.email || '';
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('All fields required', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await changeApi(email.trim(), password.trim());
      const data = res.data;
      if (data.status === 'success') {
        showToast(data.message, 'success');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        showToast(data.message, 'error');
      }
    } catch {
      showToast('Network error. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-gamified-page">
      {/* Floating Background Icons */}
      <div className="floating-shapes">
        <div className="shape shape-1">🧠</div>
        <div className="shape shape-2">⚡</div>
        <div className="shape shape-3">🎯</div>
        <div className="shape shape-4">🔢</div>
        <div className="shape shape-5">🎮</div>
      </div>
      
      <div className="auth-scroll fade-in gamified-wrapper">
        <div className="gamified-login-card">
          <div className="gamified-card-border"></div>
          
          <div className="logo-container">
            <img src="/logo-removebg-preview.png" alt="Brain Battle" className="auth-logo animated-logo" />
            <div className="logo-glow"></div>
          </div>
          
          <h1 className="auth-title glitch-text" data-text="Change Password">Change Password</h1>
          <p className="auth-subtitle typing-effect">Enter your new secret password</p>

          <div className="auth-form gamified-form">
            <div className="game-input-container">
              <input
                id="change-email"
                className="game-input"
                type="email"
                placeholder="Player Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div className="input-border-glow"></div>
            </div>

            <div className="game-input-container">
              <input
                id="change-password"
                className="game-input"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChange()}
              />
              <div className="input-border-glow"></div>
            </div>

            <button
              id="change-btn"
              className="game-btn-primary"
              onClick={handleChange}
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              <span className="btn-content">
                {loading ? <span className="spinner" /> : 'CHANGE PASSWORD'}
              </span>
              <div className="btn-glare"></div>
            </button>
            
            <div className="auth-link-row gamified-link-row" style={{ marginTop: '8px' }}>
              <button className="auth-link neon-link" onClick={() => navigate(-1)}>
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
      {ToastEl}
    </div>
  );
}
