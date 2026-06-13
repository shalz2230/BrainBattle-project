import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProgress } from '../api/api';
import { useAuth } from '../context/AuthContext';

const TOTAL_LEVELS = 100;

const GAME_META = {
  memory: { name: 'Memory Boost',    icon: '🧠', accentColor: 'var(--primary)' },
  logic:  { name: 'Logic Training',  icon: '🔢', accentColor: 'var(--secondary)' },
  focus:  { name: 'Focus Training',  icon: '🎯', accentColor: 'var(--primary)' },
  speed:  { name: 'Speed Challenge', icon: '⚡', accentColor: 'var(--secondary)' },
};

export default function GameLevels() {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const { email } = useAuth();

  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = GAME_META[gameType] || GAME_META.memory;

  const loadProgress = useCallback(() => {
    if (!email) { navigate('/login', { replace: true }); return; }
    setLoading(true);
    getProgress(email, gameType)
      .then(res => setProgressList(res.data || []))
      .catch(() => setProgressList([]))
      .finally(() => setLoading(false));
  }, [email, gameType, navigate]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const lastCompleted = progressList.reduce((max, p) => p.level > max ? p.level : max, 0);

  const getProgressItem = (lvl) => progressList.find(p => p.level === lvl);

  const getTileState = (lvl) => {
    const item = getProgressItem(lvl);
    if (item) return 'completed';
    if (lvl === lastCompleted + 1 || (lastCompleted === 0 && lvl === 1)) return 'next';
    return 'locked';
  };

  const handleLevelClick = (lvl) => {
    const state = getTileState(lvl);
    if (state === 'locked') return;
    navigate(`/play/${gameType}/${lvl}`);
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

      <div className="levels-container fade-in gamified-wrapper">
        {/* Top Bar */}
        <div className="levels-topbar glass-panel">
          <button className="back-btn" onClick={() => navigate('/home')}>‹</button>
          <span className="levels-title">{meta.icon} {meta.name}</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-strip glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
          <div className="progress-strip-bar">
            <div
              className="progress-strip-fill"
              style={{ width: `${(lastCompleted / TOTAL_LEVELS) * 100}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="progress-strip-text">Progress</span>
            <span className="progress-strip-text" style={{ color: '#fff', fontWeight: 800 }}>{lastCompleted} / {TOTAL_LEVELS}</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="levels-loading">
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'rgba(233,78,154,0.2)', width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : (
          <div className="levels-grid">
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map(lvl => {
              const state = getTileState(lvl);
              const item = getProgressItem(lvl);
              const stars = item?.stars || 0;
              return (
                <button
                  key={lvl}
                  id={`level-tile-${lvl}`}
                  className={`level-tile ${state}`}
                  onClick={() => handleLevelClick(lvl)}
                  title={state === 'locked' ? 'Complete previous levels first' : `Level ${lvl}`}
                >
                  {state === 'locked' ? (
                    <span className="tile-lock">🔒</span>
                  ) : (
                    <>
                      <span className="tile-num">{lvl}</span>
                      <span className="tile-stars">
                        {state === 'completed'
                          ? '⭐'.repeat(Math.min(stars, 3)) || '⭐'
                          : '▶'}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
