import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast, ToastEl } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Enter email & password', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(email.trim(), password.trim());
      const user = res.data;
      login(user.email, user.username);
      showToast(`Welcome ${user.username}`, 'success');
      setTimeout(() => navigate('/home', { replace: true }), 600);
    } catch {
      showToast('Login Failed. Check credentials.', 'error');
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
          
          <h1 className="auth-title glitch-text" data-text="Welcome Back">Welcome Back</h1>
          <p className="auth-subtitle typing-effect">Ready for another challenge?</p>

          <div className="auth-form gamified-form">
            <div className="game-input-container">
              <input
                id="login-email"
                className="game-input"
                type="email"
                placeholder="Player Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <div className="input-border-glow"></div>
            </div>

            <div className="game-input-container">
              <input
                id="login-password"
                className="game-input"
                type="password"
                placeholder="Secret Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <div className="input-border-glow"></div>
            </div>

            <button
              className="forgot-link neon-text"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>

            <button
              id="login-btn"
              className="game-btn-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              <span className="btn-content">
                {loading ? <span className="spinner" /> : 'START GAME'}
              </span>
              <div className="btn-glare"></div>
            </button>

            <div className="auth-link-row gamified-link-row">
              <span className="auth-muted">New player?</span>
              <button className="auth-link neon-link" onClick={() => navigate('/signup')}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
      {ToastEl}
    </div>
  );
}
