// Protected route wrapper - requires authentication and role verification
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

const ProtectedRoute = ({ requiredRole, children }) => {
  const { isLoggedIn, user } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoggedIn) return <Navigate to="/login" />;
  // Redirect to home if role doesn't match
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;

