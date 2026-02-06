// src/components/instructor/AtRiskStudents.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { instructorService } from '../../services/instructorService';

const AtRiskStudents = () => {
    const [atRiskStudents, _setAtRiskStudents] = useState([
        // Sample data - replace with actual API call
        {
            id: 1,
            name: 'John Doe',
            course: 'Mathematics 101',
            grade: 45,
            status: 'Failing',
            lastLogin: '2023-01-01',
            email: 'john@example.com'
        },
        {
            id: 2,
            name: 'Jane Smith',
            course: 'Physics 201',
            grade: 58,
            status: 'At Risk',
            lastLogin: '2023-01-05',
            email: 'jane@example.com'
        }
    ]);
    const [loading, _setLoading] = useState(false);
    const [selectedStudents, _setSelectedStudents] = useState([]);

    const handleSendReminder = async (studentId) => {
        try {
            await instructorService.sendReminder(studentId);
            toast.success('Reminder sent successfully');
        } catch {
            toast.error('Failed to send reminder');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-red-700 shadow-lg shadow-red-900/20">
            <div className="p-6 border-b border-red-700 bg-red-900/20">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    At-Risk Students (Need Attention)
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Students with grades below 60% or completion below 50%
                </p>
            </div>

            {atRiskStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p className="text-lg">No at-risk students found</p>
                    <p className="text-sm mt-1">All students are performing well!</p>
                </div>
            ) : (
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Student Name</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Course</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Grade</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {atRiskStudents.map((student, index) => (
                                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-medium">
                                                    {student.name?.charAt(0) || 'N/A'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{student.name || 'Unknown Student'}</p>
                                                    <p className="text-xs text-gray-400">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{student.course || 'N/A'}</td>
                                        <td className="py-3 px-4">
                                            <span className="font-semibold text-red-400">{student.grade || '0'}%</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${student.status === 'Failing'
                                                    ? 'bg-red-900 text-red-300'
                                                    : 'bg-yellow-900 text-yellow-300'
                                                }`}>
                                                <AlertTriangle className="w-3 h-3" />
                                                {student.status || 'At Risk'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleSendReminder(student.id)}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Mail className="w-4 h-4" />
                                                Contact
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtRiskStudents;
