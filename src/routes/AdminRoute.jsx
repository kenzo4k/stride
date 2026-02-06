import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Check if user is admin - temporarily disabled for testing
  // const isAdmin = user?.email === 'admin@learnify.com' || user?.email === 'emad@gmail.com';
  const isAdmin = true; // Temporary bypass

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
