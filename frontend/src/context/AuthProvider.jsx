

import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../apiLogin.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, role, token }
  const navigate = useNavigate();

  const login = async (email, password) => {
    const response = await loginUser(email, password);

    if (response.success) {
      setUser({ email, role: response.role, token: response.token });

      // redirect based on role
      if (response.role === "client") navigate("/client-dashboard");
      if (response.role === "manager") navigate("/manager-dashboard");

      return { success: true };
    } else {
      return { success: false, message: response.message };
    }
  };

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

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
