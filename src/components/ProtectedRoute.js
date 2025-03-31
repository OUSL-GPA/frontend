// ProtectedRoute.js
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('studentToken');
  return token ? children : <Navigate to="/sign" replace />;
};

export default ProtectedRoute;