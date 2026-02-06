// src/services/instructorService.js
import api from './api';

export const instructorService = {
    // Get at-risk students (students who haven't logged in for 7+ days)
    getAtRiskStudents: async () => {
        const response = await api.get('/instructor/at-risk-students');
        return response.data;
    },

    // Send reminder to individual student
    sendReminder: async (studentId) => {
        const response = await api.post(`/instructor/send-reminder/${studentId}`);
        return response.data;
    },

    // Send bulk reminders to multiple students
    sendBulkReminder: async (studentIds) => {
        const response = await api.post('/instructor/send-bulk-reminder', { studentIds });
        return response.data;
    },

    // Get instructor's course statistics
    getCourseStats: async () => {
        const response = await api.get('/instructor/course-stats');
        return response.data;
    },

    // Get instructor's student analytics
    getStudentAnalytics: async () => {
        const response = await api.get('/instructor/student-analytics');
        return response.data;
    }
};
