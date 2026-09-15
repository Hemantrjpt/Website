import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('th_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => {
        setUsername(data.username);
        setRole(data.role);
      })
      .catch(() => localStorage.removeItem('th_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(user, pass) {
    const data = await api.login(user, pass);
    localStorage.setItem('th_admin_token', data.token);
    setUsername(data.username);
    setRole(data.role);
  }

  function logout() {
    localStorage.removeItem('th_admin_token');
    setUsername(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ username, role, isOwner: role === 'owner', loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
