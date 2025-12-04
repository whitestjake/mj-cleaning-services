

import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../apiLogin.js";

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

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
