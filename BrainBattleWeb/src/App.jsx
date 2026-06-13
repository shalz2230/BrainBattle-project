import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Splash        from './pages/Splash';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Home          from './pages/Home';
import Profile       from './pages/Profile';
import GameLevels    from './pages/GameLevels';
import Result        from './pages/Result';
import MemoryGame    from './pages/games/MemoryGame';
import LogicGame     from './pages/games/LogicGame';
import SpeedGame     from './pages/games/SpeedGame';
import FocusGame     from './pages/games/FocusGame';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Auth */}
          <Route path="/"                  element={<Splash />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/signup"            element={<Signup />} />
          <Route path="/forgot-password"   element={<ForgotPassword />} />
          <Route path="/change-password"   element={<ChangePassword />} />

          {/* Main */}
          <Route path="/home"              element={<Home />} />
          <Route path="/profile"           element={<Profile />} />

          {/* Level selectors */}
          <Route path="/game/:gameType"    element={<GameLevels />} />

          {/* Individual games */}
          <Route path="/play/memory/:level" element={<MemoryGame />} />
          <Route path="/play/logic/:level"  element={<LogicGame />} />
          <Route path="/play/speed/:level"  element={<SpeedGame />} />
          <Route path="/play/focus/:level"  element={<FocusGame />} />

          {/* Result screen: /result/:gameType/:level/:stars/:time */}
          <Route path="/result/:gameType/:level/:stars/:time" element={<Result />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
