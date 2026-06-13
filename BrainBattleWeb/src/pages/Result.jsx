import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveProgress } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Result() {
  const { gameType, level, stars, time } = useParams();
  const lvl   = parseInt(level, 10);
  const strs  = parseInt(stars, 10);
  const timeTaken = parseInt(time, 10);
  const navigate  = useNavigate();
  const { email } = useAuth();
  const saved = useRef(false);

  useEffect(() => {
    if (!saved.current && email) {
      saved.current = true;
      saveProgress(email, gameType, lvl, strs, timeTaken).catch(() => {});
    }
  }, [email, gameType, lvl, strs, timeTaken]);

  const starRow = '⭐'.repeat(strs) + '☆'.repeat(Math.max(0, 3 - strs));

  return (
    <div className="page login-gamified-page result-page fade-in">
      <div className="floating-shapes">
        <div className="shape shape-1">🧠</div>
        <div className="shape shape-2">⚡</div>
        <div className="shape shape-3">🎯</div>
        <div className="shape shape-4">🔢</div>
        <div className="shape shape-5">🎮</div>
      </div>

      <div className="gamified-login-card result-card" style={{ zIndex: 10 }}>
        <div className="gamified-card-border"></div>
        {/* Trophy */}
        <div className="result-trophy">
          {strs === 3 ? '🏆' : strs === 2 ? '🥈' : '🥉'}
        </div>

        <h1 className="result-title">Level {lvl} Completed! 🎉</h1>

        <div className="result-stars">{starRow}</div>

        <div className="result-stats">
          <div className="result-stat">
            <span className="rstat-value">{timeTaken}s</span>
            <span className="rstat-label">Time</span>
          </div>
          <div className="result-stat">
            <span className="rstat-value">{strs}/3</span>
            <span className="rstat-label">Stars</span>
          </div>
          <div className="result-stat">
            <span className="rstat-value">Lvl {lvl}</span>
            <span className="rstat-label">Level</span>
          </div>
        </div>

        <p className="result-msg">
          {strs === 3 ? 'Perfect! Outstanding performance! 🧠' :
           strs === 2 ? 'Great job! Keep it up!' :
           'Good effort! Try again to get more stars!'}
        </p>

        <div className="result-btns">
          <button
            id="result-continue-btn"
            className="game-btn-primary"
            style={{ marginBottom: '0' }}
            onClick={() => navigate(`/game/${gameType}`)}
          >
            Continue
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate(`/play/${gameType}/${lvl}`)}
          >
            Play Again
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/home')}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
