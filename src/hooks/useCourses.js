// src/hooks/useCourses.js
import { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData) => {
    try {
      const newCourse = await courseService.createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCourse = async (id, courseData) => {
    try {
      const updatedCourse = await courseService.updateCourse(id, courseData);
      setCourses(prev => prev.map(course => 
        course._id === id ? updatedCourse : course
      ));
      return updatedCourse;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCourse = async (id) => {
    try {
      await courseService.deleteCourse(id);
      setCourses(prev => prev.filter(course => course._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse
  };
};
