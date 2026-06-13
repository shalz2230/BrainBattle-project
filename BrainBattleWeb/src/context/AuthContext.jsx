import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => localStorage.getItem('bb_email') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('bb_username') || '');

  const login = (emailVal, usernameVal) => {
    setEmail(emailVal);
    setUsername(usernameVal);
    localStorage.setItem('bb_email', emailVal);
    localStorage.setItem('bb_username', usernameVal);
  };

  const logout = () => {
    setEmail('');
    setUsername('');
    localStorage.removeItem('bb_email');
    localStorage.removeItem('bb_username');
  };

  return (
    <AuthContext.Provider value={{ email, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
