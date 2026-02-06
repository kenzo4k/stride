import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const InstructorRoute = ({ children }) => {
  // Temporary bypass for testing - remove this in production
  return children;

  const { user } = useContext(AuthContext);

  // Check if user is logged in (not admin)
  const isInstructor = user && user.email !== 'admin@learnify.com' && user.email !== 'emad@gmail.com';

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default InstructorRoute;
