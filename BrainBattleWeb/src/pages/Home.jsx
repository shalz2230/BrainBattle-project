import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { email } = useAuth();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    if (!email) { navigate('/login', { replace: true }); return; }
    getDashboard(email).then(res => setDashboard(res.data)).catch(() => {});
  }, [email, navigate]);

  return (
    <div className="page login-gamified-page">
      <div className="floating-shapes">
        <div className="shape shape-1">🧠</div>
        <div className="shape shape-2">⚡</div>
        <div className="shape shape-3">🎯</div>
        <div className="shape shape-4">🔢</div>
        <div className="shape shape-5">🎮</div>
      </div>
      
      <div className="home-container fade-in gamified-wrapper">
        <div className="home-topbar glass-panel">
          <span className="home-title">Brain Battle</span>
          <button id="profile-btn" className="profile-icon-btn" onClick={() => navigate('/profile')}>
            👤
          </button>
        </div>

        <p className="greeting glitch-text" style={{ fontSize: '20px', textShadow: 'none', textAlign: 'left', marginBottom: '16px' }}>
          Hello, {dashboard?.username || 'Brainiac'}! 👋
        </p>

        {/* Parent Survey Banner */}
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px dashed rgba(255, 0, 127, 0.4)' }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#ff007f', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📋 Parent Questionnaire
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#a0aec0', lineHeight: '1.4' }}>
            Help us understand your child's everyday cognitive play skills before starting the games.
          </p>
          <button 
            className="game-btn-primary" 
            style={{ width: 'fit-content', padding: '8px 16px', fontSize: '12px', marginTop: '6px', height: 'auto', minHeight: 'auto' }}
            onClick={() => navigate('/pre-game-survey')}
          >
            <span className="btn-content">Start Pre-Game Survey</span>
            <div className="btn-glare"></div>
          </button>
        </div>

        <div className="progress-card glass-panel">
          <p className="label">Total Stars</p>
          <p id="total-stars" className="level">⭐ {dashboard?.total_stars || 0}</p>
          <p className="score">Rank #{dashboard?.rank || '-'}</p>
        </div>

        <h3 className="section-title">Games</h3>
        
        <button id="game-memory-btn" className="game-card glass-panel glass-panel-hover" onClick={() => navigate('/game/memory')}>
          <div className="game-card-icon pink">🧠</div>
          <div className="game-card-info">
            <h4 className="game-card-name">Memory Boost</h4>
            <p className="game-card-desc">Remember the sequence</p>
          </div>
          <span className="game-card-arrow">›</span>
        </button>

        <button className="game-card glass-panel glass-panel-hover" onClick={() => navigate('/game/logic')}>
          <div className="game-card-icon orange">🔢</div>
          <div className="game-card-info">
            <h4 className="game-card-name">Logic Training</h4>
            <p className="game-card-desc">Find the missing number</p>
          </div>
          <span className="game-card-arrow">›</span>
        </button>

        <button className="game-card glass-panel glass-panel-hover" onClick={() => navigate('/game/focus')}>
          <div className="game-card-icon pink" style={{ boxShadow: 'inset 0 2px 4px rgba(56,189,248,0.5), 0 0 15px rgba(56,189,248,0.3)' }}>🎯</div>
          <div className="game-card-info">
            <h4 className="game-card-name">Focus Training</h4>
            <p className="game-card-desc">Tap the target fast</p>
          </div>
          <span className="game-card-arrow">›</span>
        </button>

        <button className="game-card glass-panel glass-panel-hover" onClick={() => navigate('/game/speed')}>
          <div className="game-card-icon orange" style={{ boxShadow: 'inset 0 2px 4px rgba(34,197,94,0.5), 0 0 15px rgba(34,197,94,0.3)' }}>⚡</div>
          <div className="game-card-info">
            <h4 className="game-card-name">Speed Challenge</h4>
            <p className="game-card-desc">Quick math solver</p>
          </div>
          <span className="game-card-arrow">›</span>
        </button>

      </div>
    </div>
  );
}
