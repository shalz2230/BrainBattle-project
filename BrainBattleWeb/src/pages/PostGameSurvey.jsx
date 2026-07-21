import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

const POST_GAME_QUESTIONS = [
  {
    id: 1,
    topic: 'Problem-solving confidence',
    question: "How is your child's confidence when solving everyday problems now?"
  },
  {
    id: 2,
    topic: 'Thinking during activities',
    question: "How is your child's thinking and reasoning during play activities?"
  },
  {
    id: 3,
    topic: 'Puzzle-solving confidence',
    question: "How is your child's confidence when completing shape puzzles now?"
  },
  {
    id: 4,
    topic: 'Attention and focus',
    question: "How is your child's focus during simple learning games?"
  },
  {
    id: 5,
    topic: 'Enjoyment of learning challenges',
    question: "How is your child's enjoyment of new learning challenges?"
  }
];

const OPTIONS = [
  "Much less",
  "About the same",
  "Slightly better",
  "Much better"
];

export default function PostGameSurvey() {
  const navigate = useNavigate();
  const { showToast, ToastEl } = useToast();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = POST_GAME_QUESTIONS[currentIdx];

  const handleSelect = (idx) => {
    setSelectedOpt(idx);
  };

  const handleNext = () => {
    if (selectedOpt === null) {
      showToast('Please select an option', 'error');
      return;
    }
    if (currentIdx < POST_GAME_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
    } else {
      setIsSubmitted(true);
    }
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

      <div className="auth-scroll fade-in gamified-wrapper">
        <div className="gamified-login-card" style={{ maxWidth: '480px' }}>
          <div className="gamified-card-border"></div>

          {!isSubmitted ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="auth-muted" style={{ fontSize: '12px' }}>Parent Feedback</span>
                <span className="auth-muted" style={{ fontSize: '12px' }}>Question {currentIdx + 1} of 5</span>
              </div>

              <h2 className="auth-title" style={{ fontSize: '20px', lineHeight: '1.4', marginBottom: '24px', textAlign: 'left', textTransform: 'none' }}>
                {currentQuestion.question}
              </h2>

              <div className="auth-form gamified-form" style={{ gap: '12px' }}>
                {OPTIONS.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  
                  return (
                    <button
                      key={idx}
                      className="glass-panel glass-panel-hover"
                      style={{
                        width: '100%',
                        padding: '16px',
                        textAlign: 'left',
                        border: isSelected ? '1px solid #ff007f' : '1px solid rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(255, 0, 127, 0.1)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleSelect(idx)}
                    >
                      <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                        {opt}
                      </span>
                    </button>
                  );
                })}

                <button
                  className="game-btn-primary"
                  onClick={handleNext}
                  style={{ marginTop: '20px' }}
                  disabled={selectedOpt === null}
                >
                  <span className="btn-content">
                    {currentIdx === POST_GAME_QUESTIONS.length - 1 ? 'SUBMIT FEEDBACK' : 'NEXT'}
                  </span>
                  <div className="btn-glare"></div>
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💖</div>
              <h2 className="auth-title" style={{ fontSize: '24px', marginBottom: '12px' }}>Feedback Saved!</h2>
              <p className="auth-subtitle" style={{ fontSize: '14px', marginBottom: '24px', opacity: 0.8 }}>
                Thank you for sharing your observations. This helps us ensure the app remains supportive and fun.
              </p>
              <button
                className="game-btn-primary"
                onClick={() => navigate('/home')}
              >
                <span className="btn-content">RETURN TO GAMES</span>
                <div className="btn-glare"></div>
              </button>
            </div>
          )}
        </div>
      </div>
      {ToastEl}
    </div>
  );
}
