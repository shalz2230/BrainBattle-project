import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function getSpeed(level) {
  if (level < 5) return 800;
  if (level < 10) return 600;
  if (level < 20) return 450;
  if (level < 40) return 300;
  if (level < 70) return 200;
  return 120;
}

export default function FocusGame() {
  const { level } = useParams();
  const lvl = parseInt(level, 10);
  const navigate = useNavigate();

  const [time, setTime] = useState(0);
  const [position, setPosition] = useState({ top: '40%', left: '40%' });
  const [isPlaying, setIsPlaying] = useState(true);
  
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const moveRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    
    const speed = getSpeed(lvl);
    
    const moveTarget = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      
      const maxX = container.clientWidth - 90;
      const maxY = container.clientHeight - 90;
      
      if (maxX <= 0 || maxY <= 0) return;
      
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);
      
      setPosition({ left: `${x}px`, top: `${y}px` });
    };

    moveRef.current = setInterval(moveTarget, speed);
    
    return () => clearInterval(moveRef.current);
  }, [lvl, isPlaying]);

  const handleTap = () => {
    if (!isPlaying) return;
    setIsPlaying(false);
    clearInterval(timerRef.current);
    clearInterval(moveRef.current);
    
    setTimeout(() => navigate(`/result/focus/${lvl}/3/${time}`), 300);
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
      
      <div className="game-page fade-in gamified-wrapper" style={{ minHeight: 'auto', flex: 1 }}>
        <div className="game-header">
          <button className="back-btn" onClick={() => navigate('/levels/focus')}>‹</button>
          <span className="game-level-label">🎯 Level {lvl}</span>
          <span className="game-timer">⏱ {time}s</span>
        </div>
        <p className="game-sub">Tap the moving target as fast as you can!</p>

        <div 
          ref={containerRef}
          className="focus-play-area" 
        >
          {isPlaying && (
            <button 
              className="focus-target-btn"
              style={{ left: position.left, top: position.top }}
              onClick={handleTap}
            >
              🎯
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
