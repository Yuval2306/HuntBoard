import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { setLoading(false); return; }

    api.getMe()
      .then(data => setUser(data.user))
      .catch(() => { api.logout(); })
      .finally(() => setLoading(false));
  }, []);

  const register = async (username, email, password) => {
    const data = await api.register(username, email, password);
    setUser(data.user);
    return { success: true };
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    return { success: true };
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = async (updates) => {
    const data = await api.updateSettings(updates);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
