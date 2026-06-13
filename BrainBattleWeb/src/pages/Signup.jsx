import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup as signupApi } from '../api/api';
import { useToast } from '../hooks/useToast';

export default function Signup() {
  const navigate = useNavigate();
  const { showToast, ToastEl } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      showToast('Fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await signupApi(username.trim(), email.trim(), password.trim());
      showToast('Signup successful! Please login.', 'success');
      setTimeout(() => navigate('/login', { replace: true }), 800);
    } catch {
      showToast('Signup Failed. Try again.', 'error');
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
          
          <h1 className="auth-title glitch-text" data-text="Join Brain Battle">Join Brain Battle</h1>
          <p className="auth-subtitle typing-effect">Start your cognitive journey today</p>

          <div className="auth-form gamified-form">
            <div className="game-input-container">
              <input
                id="signup-username"
                className="game-input"
                type="text"
                placeholder="Player Name"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
              <div className="input-border-glow"></div>
            </div>

            <div className="game-input-container">
              <input
                id="signup-email"
                className="game-input"
                type="email"
                placeholder="Player Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
              <div className="input-border-glow"></div>
            </div>

            <div className="game-input-container">
              <input
                id="signup-password"
                className="game-input"
                type="password"
                placeholder="Secret Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
              <div className="input-border-glow"></div>
            </div>

            <button
              id="signup-btn"
              className="game-btn-primary"
              onClick={handleSignup}
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              <span className="btn-content">
                {loading ? <span className="spinner" /> : 'JOIN BATTLE'}
              </span>
              <div className="btn-glare"></div>
            </button>

            <div className="auth-link-row gamified-link-row">
              <span className="auth-muted">Already have an account?</span>
              <button className="auth-link neon-link" onClick={() => navigate('/login')}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
      {ToastEl}
    </div>
  );
}
