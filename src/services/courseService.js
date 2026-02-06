// src/services/courseService.js
import api from './api';

export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Create new course
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // Get courses by category
  getCoursesByCategory: async (category) => {
    const response = await api.get(`/courses/category/${category}`);
    return response.data;
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data;
  },

  // Get enrolled courses
  getEnrolledCourses: async () => {
    const response = await api.get('/my-enrollments');
    return response.data;
  }
};
