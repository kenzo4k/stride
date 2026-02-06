// src/routes/StudentRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const StudentRoute = ({ children }) => {
  // Temporary bypass for testing - remove this in production
  return children;

  const { user } = useContext(AuthContext);

  // Check if user is logged in and is a student (not admin or instructor)
  const isStudent = user &&
    user.email !== 'admin@learnify.com' &&
    user.email !== 'emad@gmail.com' &&
    user.role !== 'admin' &&
    user.role !== 'instructor';

  if (!isStudent) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StudentRoute;
