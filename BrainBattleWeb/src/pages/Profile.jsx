import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, getDashboard } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export default function Profile() {
  const navigate = useNavigate();
  const { email, logout } = useAuth();
  const { showToast, ToastEl } = useToast();

  const [username, setUsername] = useState('User');
  const [rank, setRank] = useState(0);
  const [stars, setStars] = useState(0);
  const [levels, setLevels] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) { navigate('/login', { replace: true }); return; }

    Promise.all([getUser(email), getDashboard(email)])
      .then(([userRes, dashRes]) => {
        setUsername(userRes.data.username || 'User');
        const d = dashRes.data;
        setRank(d.rank || 0);
        setStars(d.total_stars || 0);
        setLevels(d.levels_completed || 0);
      })
      .catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, [email, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page login-gamified-page">
      <div className="floating-shapes">
        <div className="shape shape-1">🧠</div>
        <div className="shape shape-2">⚡</div>
        <div className="shape shape-3">🎯</div>
        <div className="shape shape-4">🔢</div>
        <div className="shape shape-5">🎮</div>
      </div>

      <div className="profile-container fade-in gamified-wrapper">
        <div className="profile-topbar glass-panel">
          <button id="back-btn" className="back-btn" onClick={() => navigate(-1)}>‹</button>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>Profile</span>
        </div>

        <div className="profile-card glass-panel">
          <div className="profile-avatar">👤</div>
          <p className="profile-name">{loading ? '...' : username}</p>
          <p className="profile-email">{email}</p>
        </div>

        <div className="rank-card glass-panel">
          <p className="rank-label">Your Rank</p>
          <p className="rank-value">#{loading ? '—' : rank}</p>
        </div>

        <div className="stats-row">
          <div className="stat-card glass-panel">
            <span className="stat-value">{loading ? '—' : stars}</span>
            <span className="stat-label">Stars ⭐</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-value">{loading ? '—' : levels}</span>
            <span className="stat-label">Levels</span>
          </div>
        </div>

        <button
          id="change-password-btn"
          className="game-btn-primary"
          style={{ marginBottom: '16px' }}
          onClick={() => navigate('/change-password', { state: { email } })}
        >
          Change Password
        </button>

        <button
          id="logout-btn"
          className="game-btn-primary"
          style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.6))', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 8px 24px rgba(239, 68, 68, 0.4)' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      {ToastEl}
    </div>
  );
}
