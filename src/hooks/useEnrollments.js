// src/hooks/useEnrollments.js
import { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

export const useEnrollments = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await courseService.getEnrolledCourses();
      setEnrolledCourses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      const enrollment = await courseService.enrollInCourse(courseId);
      setEnrolledCourses(prev => [...prev, enrollment]);
      return enrollment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return {
    enrolledCourses,
    loading,
    error,
    fetchEnrollments,
    enrollInCourse
  };
};
