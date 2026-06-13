import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Memory game: level < 5 → 4x4=16, level < 10 → 4x5=20, else → 4x6=24
function getConfig(level) {
  if (level < 5)  return { total: 16, cols: 4 };
  if (level < 10) return { total: 20, cols: 4 };
  return           { total: 24, cols: 4 };
}


export default function MemoryGame() {
  const { level } = useParams();
  const lvl = parseInt(level, 10);
  const navigate = useNavigate();

  const { total, cols } = getConfig(lvl);
  const pairs = total / 2;

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Generate shuffled pairs
    const pool = Array.from({ length: pairs }, (_, i) => i + 1);
    const deck = [...pool, ...pool]
      .sort(() => Math.random() - 0.5)
      .map((val, i) => ({ id: i, val, flipped: false }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);

    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [lvl, pairs]);

  const handleClick = (idx) => {
    if (locked) return;
    if (flipped.includes(idx)) return;
    if (matched.includes(cards[idx].val)) return;

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].val === cards[b].val) {
        const newMatched = [...matched, cards[a].val];
        setMatched(newMatched);
        setFlipped([]);
        setLocked(false);
        if (newMatched.length === pairs) {
          clearInterval(timerRef.current);
          const extra = moves + 1 - pairs;
          const stars = extra <= 2 ? 3 : extra <= 6 ? 2 : 1;
          setTimeout(() => navigate(`/result/memory/${lvl}/${stars}/${time + 1}`), 500);
        }
      } else {
        setTimeout(() => { setFlipped([]); setLocked(false); }, 700);
      }
    }
  };

  const isFlipped = (idx) => flipped.includes(idx) || matched.includes(cards[idx]?.val);

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
          <button className="back-btn" onClick={() => navigate(`/levels/memory`)}>‹</button>
          <span className="game-level-label">🧠 Level {lvl}</span>
          <span className="game-timer">⏱ {time}s</span>
        </div>
        <p className="game-sub">Find all matching pairs</p>

        <div
          className="memory-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {cards.map((card, idx) => (
            <button
              key={card.id}
              className={`mem-card ${isFlipped(idx) ? 'flipped' : ''} ${matched.includes(card.val) ? 'matched' : ''}`}
              onClick={() => handleClick(idx)}
            >
              <span className="mem-card-front">{card.val}</span>
              <span className="mem-card-back">?</span>
            </button>
          ))}
        </div>

        <div className="game-stats">
          <span>Moves: <strong style={{ color: '#fff' }}>{moves}</strong></span>
          <span>Matched: <strong style={{ color: '#fff' }}>{matched.length}/{pairs}</strong></span>
        </div>
      </div>
    </div>
  );
}
