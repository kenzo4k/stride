// src/pages/Admin/Admin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Eye,
  Award,
  Calendar,
  AlertTriangle,
  Plus
} from 'lucide-react';

import api from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const userGrowthData = [
  { month: 'Jan', users: 15 },
  { month: 'Feb', users: 28 },
  { month: 'Mar', users: 34 },
  { month: 'Apr', users: 45 },
  { month: 'May', users: 45 }
];

const enrollmentData = [
  { course: 'Web Dev', enrollments: 45 },
  { course: 'Python', enrollments: 32 },
  { course: 'React', enrollments: 38 },
  { course: 'Data Sci', enrollments: 28 }
];

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalInstructors: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [enrollmentsChart, setEnrollmentsChart] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, usersRes, coursesRes, instructorsRes, refundsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-users'),
        api.get('/admin/recent-courses'),
        api.get('/admin/instructors'),
        api.get('/admin/refund-requests').catch(err => {
          console.warn("Failed to fetch refund requests:", err.message);
          return { data: [] };
        })
      ]);

      setStats(statsRes.data);
      setRecentUsers(usersRes.data || []);
      setRecentCourses(coursesRes.data || []);
      setInstructors(instructorsRes.data || []);
      setRefundRequests(refundsRes.data || []);
      setUserGrowth(statsRes.data.userGrowthData && statsRes.data.userGrowthData.length > 0 ? statsRes.data.userGrowthData : userGrowthData);
      setEnrollmentsChart(statsRes.data.enrollmentData && statsRes.data.enrollmentData.length > 0 ? statsRes.data.enrollmentData : enrollmentData);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      toast.success(`User ${action}ed successfully`);
      fetchAdminData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleCourseAction = async (courseId, action) => {
    try {
      await api.post(`/admin/courses/${courseId}/${action}`);
      toast.success(`Course status updated to ${action}ed`);
      fetchAdminData();
    } catch (error) {
      console.error(`Failed to ${action} course:`, error);
      toast.error(`Failed to update course status`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action is irreversible.")) {
      try {
        await api.delete(`/courses/${courseId}`);
        toast.success("Course deleted successfully");
        fetchAdminData();
      } catch (err) {
        console.error("Failed to delete course:", err);
        toast.error("Failed to delete course");
      }
    }
  };

  const handleInstructorAction = async (instructorId, action) => {
    try {
      await api.post(`/admin/instructors/${instructorId}/${action}`);
      toast.success(`Instructor ${action}ed successfully`);
      fetchAdminData();
    } catch (error) {
      console.error(`Failed to ${action} instructor:`, error);
      toast.error(`Failed to update instructor status`);
    }
  };

  const handleRefundAction = async (enrollmentId, action) => {
    try {
      if (action === 'deny') {
        const { value: inputReason } = await Swal.fire({
          title: 'Deny Refund Request',
          input: 'text',
          inputLabel: 'Reason for denial',
          inputPlaceholder: 'Enter reason here...',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return 'You need to write a reason!';
            }
          },
          background: '#1f2937',
          color: '#f3f4f6'
        });

        if (inputReason === undefined) {
          return;
        }

        await api.post(`/admin/enrollments/${enrollmentId}/refund`, { action: 'deny', reason: inputReason });
      } else {
        await api.post(`/admin/enrollments/${enrollmentId}/refund`, { action });
      }
      toast.success(`Refund request ${action}ed successfully`);
      fetchAdminData();
    } catch (error) {
      console.error(`Failed to process refund:`, error);
      toast.error(`Failed to process refund`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-gray-400">Manage platform users, courses, and pending requests</p>
          </div>
          <button 
            onClick={() => navigate('/add-course')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Course</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-700 overflow-x-auto">
          {['overview', 'users', 'instructors', 'courses', 'refunds', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold capitalize transition-colors whitespace-nowrap ${activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab === 'refunds' ? `Refund Requests (${refundRequests.length})` : tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Courses</p>
                    <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Enrollments</p>
                    <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Revenue</p>
                    <p className="text-3xl font-bold">${stats.totalRevenue}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Users</p>
                    <p className="text-3xl font-bold">{stats.activeUsers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-teal-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Course Approvals</p>
                    <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Instructors</p>
                    <p className="text-3xl font-bold">{stats.totalInstructors}</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">Recent Users</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-white">
                            {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUserAction(user._id, 'activate')}
                            className="p-2 text-green-400 hover:bg-green-950 rounded transition"
                            title="Activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user._id, 'suspend')}
                            className="p-2 text-yellow-400 hover:bg-yellow-950 rounded transition"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Courses */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">Pending Course Approvals</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentCourses.filter(c => c.status === 'pending').slice(0, 5).map((course) => (
                      <div key={course._id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-400">by {course.instructor?.name || 'Unknown'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCourseAction(course._id, 'approve')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition"
                            title="Approve Course"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCourseAction(course._id, 'reject')}
                            className="px-3 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-xs font-bold transition"
                            title="Reject Course"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {recentCourses.filter(c => c.status === 'pending').length === 0 && (
                      <p className="text-gray-400">No courses pending approval.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-750/30">
                        <td className="py-3 px-4">{user.name || 'Unknown'}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4 capitalize">{user.role || 'User'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'active' ? 'bg-green-900/40 text-green-300 border border-green-800' : 'bg-red-900/40 text-red-300 border border-red-800'
                            }`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={async () => {
                                const newRole = user.role === 'instructor' ? 'student' : 'instructor';
                                if (window.confirm(`Are you sure you want to change role of ${user.name} to ${newRole}?`)) {
                                  try {
                                    await api.patch(`/users/${user._id}/role`, { role: newRole });
                                    toast.success(`Role updated to ${newRole} successfully`);
                                    fetchAdminData();
                                  } catch (error) {
                                    console.error("Failed to update user role:", error);
                                    toast.error(error.response?.data?.message || "Failed to update user role");
                                  }
                                }
                              }}
                              className="p-1.5 text-cyan-400 hover:bg-cyan-950 rounded transition"
                              title="Change Role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete user ${user.name}? This will also delete their course enrollments.`)) {
                                  handleUserAction(user._id, 'delete');
                                }
                              }}
                              className="p-1.5 text-red-400 hover:bg-red-950 rounded transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Instructors Tab */}
        {activeTab === 'instructors' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Instructor Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="text-left py-3 px-4">Instructor</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Courses</th>
                      <th className="text-left py-3 px-4">Students</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((instructor) => (
                      <tr key={instructor._id} className="border-b border-gray-700 hover:bg-gray-750/30">
                        <td className="py-3 px-4 font-medium">{instructor.name || 'Unknown'}</td>
                        <td className="py-3 px-4">{instructor.email}</td>
                        <td className="py-3 px-4">{instructor.totalCourses || 0}</td>
                        <td className="py-3 px-4">{instructor.totalStudents || 0}</td>
                        <td className="py-3 px-4">${instructor.totalRevenue || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${instructor.status === 'active' ? 'bg-green-900/40 text-green-300 border border-green-800' : 'bg-red-900/40 text-red-300 border border-red-800'
                            }`}>
                            {instructor.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleInstructorAction(instructor._id, 'suspend')}
                              className="p-1 text-yellow-400 hover:bg-yellow-950 rounded transition"
                              title="Suspend Instructor"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInstructorAction(instructor._id, 'approve')}
                              className="p-1 text-green-400 hover:bg-green-950 rounded transition"
                              title="Approve/Activate Instructor"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="text-left py-3 px-4">Course</th>
                      <th className="text-left py-3 px-4">Instructor</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map((course) => (
                      <tr key={course._id} className="border-b border-gray-700 hover:bg-gray-750/30">
                        <td className="py-3 px-4 font-medium">{course.title}</td>
                        <td className="py-3 px-4">{course.instructor?.name || 'Unknown'}</td>
                        <td className="py-3 px-4">${course.price}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                            course.status === 'active' 
                              ? 'bg-green-900/40 text-green-300 border border-green-800' 
                              : (course.status === 'published' ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-800' : 'bg-yellow-900/40 text-yellow-300 border border-yellow-800')
                          }`}>
                            {course.status || 'draft'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Link 
                              to={`/course/${course._id}`}
                              className="p-1 text-cyan-400 hover:bg-cyan-950 rounded transition"
                              title="View course detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => navigate(`/edit-course/${course._id}`)}
                              className="p-1 text-yellow-400 hover:bg-yellow-950 rounded transition"
                              title="Edit Course"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {course.status === 'pending' && (
                              <button 
                                onClick={() => handleCourseAction(course._id, 'approve')}
                                className="px-2 py-0.5 bg-green-650 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteCourse(course._id)}
                              className="p-1 text-red-400 hover:bg-red-950 rounded transition"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Refund & Unenrollment Requests</h2>
            </div>
            <div className="p-6">
              {refundRequests.length === 0 ? (
                <p className="text-gray-400">No pending refund requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400 text-sm">
                        <th className="text-left py-3 px-4">Student</th>
                        <th className="text-left py-3 px-4">Course</th>
                        <th className="text-left py-3 px-4">Price</th>
                        <th className="text-left py-3 px-4">Reason</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refundRequests.map((req) => (
                        <tr key={req._id} className="border-b border-gray-700 hover:bg-gray-750/30">
                          <td className="py-3 px-4">
                            <p className="font-medium">{req.userId?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{req.userId?.email}</p>
                          </td>
                          <td className="py-3 px-4">{req.courseId?.title || 'Unknown Course'}</td>
                          <td className="py-3 px-4">${req.courseId?.price || 0}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">{req.refundReason || 'No reason provided'}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRefundAction(req._id, 'approve')}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRefundAction(req._id, 'deny')}
                                className="px-3 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-xs font-bold transition"
                              >
                                Deny
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6">Platform Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-750 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-medium mb-4 text-cyan-400">User Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }} />
                      <Line type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gray-750 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-medium mb-4 text-purple-400">Course Enrollment Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentsChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis dataKey="course" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }} cursor={{fill: '#374151'}} />
                      <Bar dataKey="enrollments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
