


import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider.jsx"; // adjust path

const ProtectedRoute = ({ requiredRole, children }) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;

