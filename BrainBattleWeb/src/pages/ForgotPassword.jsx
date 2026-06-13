import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword as forgotApi } from '../api/api';
import { useToast } from '../hooks/useToast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast, ToastEl } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email.trim()) {
      showToast('Enter email', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotApi(email.trim());
      const data = res.data;
      if (data.status === 'success') {
        showToast(data.message, 'success');
        setTimeout(() =>
          navigate('/change-password', { state: { email: email.trim() } }),
          600
        );
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
            <img src="./logo-removebg-preview.png" alt="Brain Battle" className="auth-logo animated-logo" />
            <div className="logo-glow"></div>
          </div>
          
          <h1 className="auth-title glitch-text" data-text="Forgot Password">Forgot Password</h1>
          <p className="auth-subtitle typing-effect">Enter your email to reset password</p>

          <div className="auth-form gamified-form">
            <div className="game-input-container">
              <input
                id="forgot-email"
                className="game-input"
                type="email"
                placeholder="Player Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
              <div className="input-border-glow"></div>
            </div>

            <button
              id="verify-btn"
              className="game-btn-primary"
              onClick={handleVerify}
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              <span className="btn-content">
                {loading ? <span className="spinner" /> : 'VERIFY EMAIL'}
              </span>
              <div className="btn-glare"></div>
            </button>

            <div className="auth-link-row gamified-link-row" style={{ marginTop: '8px' }}>
              <button className="auth-link neon-link" onClick={() => navigate('/login')}>
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
      {ToastEl}
    </div>
  );
}
