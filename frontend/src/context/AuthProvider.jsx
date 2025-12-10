

import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../apiLogin';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session from storage on app load
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Handle user login and navigation
  const login = async (email, password) => {
    const response = await loginUser(email, password);

    if (response.success) {
      const userData = response.user || { email, role: response.role, token: response.token };
      setUser(userData);
      // Save to sessionStorage (each tab is independent)
      sessionStorage.setItem('user', JSON.stringify(userData));

      // redirect based on role
      if (response.role === "client") navigate("/client-dashboard");
      if (response.role === "manager") navigate("/manager-dashboard");

      return { success: true };
    } else {
      return { success: false, message: response.message };
    }
  };

  // Handle new user registration
  const register = async (userData) => {
    const response = await registerUser(userData);

    if (response.success) {
      // Registration successful, redirect to login
      navigate('/login');
      return { success: true, message: 'Registration successful! Please login.' };
    } else {
      return { success: false, message: response.message };
    }
  };

  // Clear session and redirect to login
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    navigate("/login");
  };

  const isLoggedIn = !!user;

  // Wait for session restore before rendering
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
