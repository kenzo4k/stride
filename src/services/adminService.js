// src/services/adminService.js
import api from './api';

export const adminService = {
    // Get at-risk students (students who haven't logged in for 7+ days)
    getAtRiskStudents: async () => {
        const response = await api.get('/admin/at-risk-students');
        return response.data;
    },

    // Send reminder to individual student
    sendReminder: async (studentId) => {
        const response = await api.post(`/admin/send-reminder/${studentId}`);
        return response.data;
    },

    // Send bulk reminders to multiple students
    sendBulkReminder: async (studentIds) => {
        const response = await api.post('/admin/send-bulk-reminder', { studentIds });
        return response.data;
    },

    // Get student activity analytics
    getStudentActivity: async () => {
        const response = await api.get('/admin/student-activity');
        return response.data;
    },

    // Get retention metrics
    getRetentionMetrics: async () => {
        const response = await api.get('/admin/retention-metrics');
        return response.data;
    }
};
