import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Speed game: tap numbers 1→N in order. N = min(4+level, 40). Countdown timer.
function getTimeForLevel(level) {
  if (level < 5)  return 10;
  if (level < 10) return 9;
  if (level < 20) return 8;
  if (level < 40) return 7;
  if (level < 70) return 6;
  if (level < 90) return 5;
  return 4;
}
function getCountForLevel(level) { return Math.min(4 + level, 40); }
function getColsForLevel(level) {
  if (level < 5)  return 3;
  if (level < 10) return 4;
  if (level < 20) return 5;
  if (level < 40) return 6;
  if (level < 70) return 7;
  return 8;
}

export default function SpeedGame() {
  const { level } = useParams();
  const lvl = parseInt(level, 10);
  const navigate = useNavigate();

  const maxNum = getCountForLevel(lvl);
  const totalTime = getTimeForLevel(lvl);
  const cols = getColsForLevel(lvl);

  const [numbers] = useState(() =>
    Array.from({ length: maxNum }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
  );
  const [current, setCurrent] = useState(1);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [tapped, setTapped] = useState({});
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!done) navigate(`/result/speed/${lvl}/1/${totalTime}`);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleTap = (num) => {
    if (done || tapped[num]) return;
    if (num === current) {
      const newTapped = { ...tapped, [num]: 'correct' };
      setTapped(newTapped);
      const next = current + 1;
      setCurrent(next);
      if (next > maxNum) {
        clearInterval(timerRef.current);
        setDone(true);
        const timeTaken = totalTime - timeLeft;
        navigate(`/result/speed/${lvl}/3/${timeTaken}`);
      }
    } else {
      setTapped(prev => ({ ...prev, [num]: 'wrong' }));
      clearInterval(timerRef.current);
      setDone(true);
      navigate(`/result/speed/${lvl}/1/${totalTime - timeLeft}`);
    }
  };

  const urgentColor = timeLeft <= 3 ? '#ef4444' : timeLeft <= 5 ? '#f97316' : '#38bdf8';
  const urgentShadow = timeLeft <= 3 ? 'rgba(239, 68, 68, 0.5)' : timeLeft <= 5 ? 'rgba(249, 115, 22, 0.5)' : 'rgba(56, 189, 248, 0.5)';

  return (
    <div className="page login-gamified-page">
      <div className="floating-shapes">
        <div className="shape shape-1">🧠</div>
        <div className="shape shape-2">⚡</div>
        <div className="shape shape-3">🎯</div>
        <div className="shape shape-4">🔢</div>
        <div className="shape shape-5">🎮</div>
      </div>
      
      <div className="game-page fade-in gamified-wrapper" style={{ minHeight: 'auto', flex: 1 }}>
        <div className="game-header">
          <button className="back-btn" onClick={() => navigate('/levels/speed')}>‹</button>
          <span className="game-level-label">⚡ Level {lvl}</span>
          <span className="game-timer" style={{ color: urgentColor, textShadow: `0 0 10px ${urgentShadow}` }}>
            ⏱ {timeLeft}s
          </span>
        </div>
        <p className="game-sub">Tap numbers in order: 1 → {maxNum}</p>
        <p className="speed-next">Next: <strong>{current}</strong></p>

        <div className="speed-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {numbers.map(num => (
            <button
              key={num}
              className={`speed-btn
                ${tapped[num] === 'correct' ? 'correct' : ''}
                ${tapped[num] === 'wrong'   ? 'wrong'   : ''}
              `}
              onClick={() => handleTap(num)}
              disabled={!!tapped[num]}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
