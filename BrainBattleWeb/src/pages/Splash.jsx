import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { email } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(email ? '/home' : '/login', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [email, navigate]);

  return (
    <div className="page login-gamified-page">
      {/* Floating Background Icons */}
      <div className="floating-shapes">
        <div className="shape shape-1">🧠</div>
        <div className="shape shape-2">⚡</div>
        <div className="shape shape-3">🎯</div>
        <div className="shape shape-4">🔢</div>
        <div className="shape shape-5">🎮</div>
      </div>
      
      <div className="splash fade-in gamified-wrapper" style={{ zIndex: 10 }}>
        <div className="logo-container" style={{ transform: 'scale(1.5)', marginBottom: '40px' }}>
          <img src="./logo-removebg-preview.png" alt="Brain Battle" className="auth-logo animated-logo" />
          <div className="logo-glow"></div>
        </div>
        <h1 className="glitch-text" data-text="Brain Battle" style={{ fontSize: '48px', marginBottom: '10px' }}>Brain Battle</h1>
        <p className="typing-effect" style={{ fontSize: '18px' }}>Train Your Brain. Win Every Battle.</p>
      </div>
    </div>
  );
}
