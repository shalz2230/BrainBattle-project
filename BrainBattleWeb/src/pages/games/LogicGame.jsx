import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function generateQuestion(level) {
  const a = level + 1;
  const b = a + 2;
  const c = b + 2;
  const d = c + 2;
  const correct = d + 2;
  const options = [correct, correct + 2, correct - 2, correct + 4].sort(() => Math.random() - 0.5);
  return { sequence: [a, b, c, d], correct, options };
}

export default function LogicGame() {
  const { level } = useParams();
  const lvl = parseInt(level, 10);
  const navigate = useNavigate();

  const [q, setQ] = useState(() => generateQuestion(lvl));
  const [time, setTime] = useState(0);
  const [chosen, setChosen] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleAnswer = (val) => {
    if (chosen !== null) return;
    setChosen(val);
    clearInterval(timerRef.current);
    const stars = val === q.correct ? 3 : 1;
    setTimeout(() => navigate(`/result/logic/${lvl}/${stars}/${time}`), 900);
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
          <button className="back-btn" onClick={() => navigate('/levels/logic')}>‹</button>
          <span className="game-level-label">🔢 Level {lvl}</span>
          <span className="game-timer">⏱ {time}s</span>
        </div>
        <p className="game-sub">Find the next number in the sequence</p>

        <div className="logic-sequence">
          {q.sequence.map((n, i) => (
            <div key={i} className="seq-box">{n}</div>
          ))}
          <div className="seq-box seq-question">?</div>
        </div>

        <div className="logic-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn
                ${chosen === opt ? (opt === q.correct ? 'correct' : 'wrong') : ''}
                ${chosen !== null && opt === q.correct ? 'correct' : ''}
              `}
              onClick={() => handleAnswer(opt)}
              disabled={chosen !== null}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
