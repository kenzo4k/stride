import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InstructorRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/Auth/login" replace />;
  if (user.role !== 'instructor') return <Navigate to="/" replace />;

  return children;
};

export default InstructorRoute;
