import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Restrict access by gracefully directing them back to the Landing page auth modal
    return <Navigate to="/?auth=login" replace />;
  }

  // Otherwise, render the nested routes (Layout)
  return <Outlet />;
};

export default ProtectedRoute;
