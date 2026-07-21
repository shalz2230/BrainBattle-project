import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

const PRE_GAME_QUESTIONS = [
  {
    id: 1,
    topic: 'Problem-solving',
    question: "How does your child react when a toy does not work?",
    options: [
      { text: "Wants help immediately", percentage: 20 },
      { text: "Tries a few times first", percentage: 45 },
      { text: "Keeps trying patiently", percentage: 25 },
      { text: "Finds another toy", percentage: 10 }
    ]
  },
  {
    id: 2,
    topic: 'Thinking ability',
    question: "Does your child group similar toys together during play?",
    options: [
      { text: "Not yet", percentage: 15 },
      { text: "Sometimes, with guidance", percentage: 40 },
      { text: "Often does it independently", percentage: 35 },
      { text: "Always groups them", percentage: 10 }
    ]
  },
  {
    id: 3,
    topic: 'Curiosity',
    question: "How often does your child ask questions about new things?",
    options: [
      { text: "Rarely asks questions", percentage: 10 },
      { text: "Asks questions occasionally", percentage: 30 },
      { text: "Asks many questions daily", percentage: 45 },
      { text: "Constantly explores everything", percentage: 15 }
    ]
  },
  {
    id: 4,
    topic: 'Understanding simple instructions',
    question: "Can your child follow a simple two-step instruction?",
    options: [
      { text: "Needs help each time", percentage: 15 },
      { text: "Follows it sometimes", percentage: 35 },
      { text: "Follows it most times", percentage: 40 },
      { text: "Easily follows every time", percentage: 10 }
    ]
  },
  {
    id: 5,
    topic: 'Simple puzzle-solving or matching speed',
    question: "How does your child complete simple matching games or puzzles?",
    options: [
      { text: "Needs a lot of time", percentage: 20 },
      { text: "Takes time to figure it out", percentage: 40 },
      { text: "Completes them fairly quickly", percentage: 30 },
      { text: "Solves them very fast", percentage: 10 }
    ]
  }
];

export default function PreGameSurvey() {
  const navigate = useNavigate();
  const { showToast, ToastEl } = useToast();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = PRE_GAME_QUESTIONS[currentIdx];

  const handleSelect = (idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
  };

  const handleNext = () => {
    if (selectedOpt === null) {
      showToast('Please select an option', 'error');
      return;
    }
    if (currentIdx < PRE_GAME_QUESTIONS.length - 1) {
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
                <span className="auth-muted" style={{ fontSize: '12px' }}>Parent Survey</span>
                <span className="auth-muted" style={{ fontSize: '12px' }}>Question {currentIdx + 1} of 5</span>
              </div>

              <h2 className="auth-title" style={{ fontSize: '20px', lineHeight: '1.4', marginBottom: '24px', textAlign: 'left', textTransform: 'none' }}>
                {currentQuestion.question}
              </h2>

              <div className="auth-form gamified-form" style={{ gap: '12px' }}>
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  const showPercentage = selectedOpt !== null;
                  
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
                        cursor: showPercentage ? 'default' : 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleSelect(idx)}
                      disabled={showPercentage}
                    >
                      {showPercentage && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${opt.percentage}%`,
                            background: isSelected ? 'rgba(255, 0, 127, 0.15)' : 'rgba(255,255,255,0.05)',
                            zIndex: 0,
                            transition: 'width 0.8s ease-in-out'
                          }}
                        />
                      )}

                      <span style={{ zIndex: 1, color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                        {opt.text}
                      </span>
                      {showPercentage && (
                        <span style={{ zIndex: 1, color: isSelected ? '#ff007f' : '#a0aec0', fontSize: '14px', fontWeight: 'bold' }}>
                          {opt.percentage}%
                        </span>
                      )}
                    </button>
                  );
                })}

                {selectedOpt !== null && (
                  <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px', fontStyle: 'italic', zIndex: 1 }}>
                    * Showing how other parents responded.
                  </p>
                )}

                <button
                  className="game-btn-primary"
                  onClick={handleNext}
                  style={{ marginTop: '20px' }}
                  disabled={selectedOpt === null}
                >
                  <span className="btn-content">
                    {currentIdx === PRE_GAME_QUESTIONS.length - 1 ? 'SUBMIT' : 'NEXT'}
                  </span>
                  <div className="btn-glare"></div>
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 className="auth-title" style={{ fontSize: '24px', marginBottom: '12px' }}>Thank You!</h2>
              <p className="auth-subtitle" style={{ fontSize: '14px', marginBottom: '24px', opacity: 0.8 }}>
                Your insights help us design a better experience for your child's cognitive play.
              </p>
              <button
                className="game-btn-primary"
                onClick={() => navigate('/home')}
              >
                <span className="btn-content">GO TO HOME</span>
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
