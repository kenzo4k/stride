// src/pages/Admin/Admin.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import toast from 'react-hot-toast';
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

// Sample data for when API fails
const sampleStats = {
  totalUsers: 45,
  totalCourses: 8,
  totalEnrollments: 115,
  totalRevenue: 2100,
  activeUsers: 38,
  pendingApprovals: 3,
  totalInstructors: 5
};

const sampleRecentUsers = [
  { _id: 1, displayName: "Ahmed Khan", email: "ahmed@email.com", role: "Instructor", status: "active", createdAt: "2024-01-05" },
  { _id: 2, displayName: "Fatima Ali", email: "fatima@email.com", role: "Instructor", status: "active", createdAt: "2024-01-03" },
  { _id: 3, displayName: "Zainab Ahmed", email: "zainab@email.com", role: "Student", status: "active", createdAt: "2024-01-10" },
  { _id: 4, displayName: "Omar Hassan", email: "omar@email.com", role: "Student", status: "active", createdAt: "2024-01-12" },
  { _id: 5, displayName: "Sara Mohamed", email: "sara@email.com", role: "Student", status: "pending", createdAt: "2024-01-15" }
];

const sampleRecentCourses = [
  { _id: 1, title: "Web Development Bootcamp", instructor: "Ahmed Khan", enrolledStudents: 45, price: 49.99, status: "published" },
  { _id: 2, title: "Python Basics", instructor: "Fatima Ali", enrolledStudents: 32, price: 29.99, status: "published" },
  { _id: 3, title: "React Fundamentals", instructor: "Omar Hassan", enrolledStudents: 38, price: 39.99, status: "published" },
  { _id: 4, title: "Data Science with Python", instructor: "Ahmed Khan", enrolledStudents: 28, price: 59.99, status: "draft" },
  { _id: 5, title: "Machine Learning Basics", instructor: "Fatima Ali", enrolledStudents: 22, price: 69.99, status: "pending" }
];

const sampleInstructors = [
  { _id: 1, displayName: "Ahmed Khan", email: "ahmed@email.com", totalCourses: 3, totalStudents: 95, totalRevenue: 3200, status: "active" },
  { _id: 2, displayName: "Fatima Ali", email: "fatima@email.com", totalCourses: 2, totalStudents: 54, totalRevenue: 1800, status: "active" },
  { _id: 3, displayName: "Omar Hassan", email: "omar@email.com", totalCourses: 2, totalStudents: 60, totalRevenue: 2100, status: "active" },
  { _id: 4, displayName: "Layla Ibrahim", email: "layla@email.com", totalCourses: 1, totalStudents: 15, totalRevenue: 450, status: "pending" }
];

const Admin = () => {
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
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch statistics
      const statsResponse = await fetch('https://course-management-system-server-woad.vercel.app/api/admin/stats');
      
      // Fetch recent users
      const usersResponse = await fetch('https://course-management-system-server-woad.vercel.app/api/admin/recent-users');
      
      // Fetch recent courses
      const coursesResponse = await fetch('https://course-management-system-server-woad.vercel.app/api/admin/recent-courses');
      
      // Fetch instructors
      const instructorsResponse = await fetch('https://course-management-system-server-woad.vercel.app/api/admin/instructors');

      // Check if all API responses are OK
      if (statsResponse.ok && usersResponse.ok && coursesResponse.ok && instructorsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);

        const usersData = await usersResponse.json();
        setRecentUsers(usersData);

        const coursesData = await coursesResponse.json();
        setRecentCourses(coursesData);

        const instructorsData = await instructorsResponse.json();
        setInstructors(instructorsData);
      } else {
        // API failed, use sample data
        console.log('API failed, using sample data');
        setStats(sampleStats);
        setRecentUsers(sampleRecentUsers);
        setRecentCourses(sampleRecentCourses);
        setInstructors(sampleInstructors);
      }

    } catch (error) {
      // Any error, fallback to sample data
      console.error('Error fetching data, using sample data:', error);
      setStats(sampleStats);
      setRecentUsers(sampleRecentUsers);
      setRecentCourses(sampleRecentCourses);
      setInstructors(sampleInstructors);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const response = await fetch(`https://course-management-system-server-woad.vercel.app/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`User ${action} successfully`);
        fetchAdminData(); // Refresh data
      } else {
        throw new Error('Failed to perform action');
      }
    } catch {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleCourseAction = async (courseId, action) => {
    try {
      const response = await fetch(`https://course-management-system-server-woad.vercel.app/api/admin/courses/${courseId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Course ${action} successfully`);
        fetchAdminData(); // Refresh data
      } else {
        throw new Error('Failed to perform action');
      }
    } catch {
      toast.error(`Failed to ${action} course`);
    }
  };

  const handleInstructorAction = async (instructorId, action) => {
    try {
      const response = await fetch(`https://course-management-system-server-woad.vercel.app/api/admin/instructors/${instructorId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Instructor ${action} successfully`);
        fetchAdminData(); // Refresh data
      } else {
        throw new Error('Failed to perform action');
      }
    } catch {
      toast.error(`Failed to ${action} instructor`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage platform and control courses</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-700">
          {['overview', 'users', 'instructors', 'courses', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab}
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
                    <p className="text-gray-400 text-sm">Pending Approvals</p>
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
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.displayName || 'Unknown'}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUserAction(user._id, 'approve')}
                            className="p-2 text-green-400 hover:bg-green-900 rounded"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user._id, 'suspend')}
                            className="p-2 text-red-400 hover:bg-red-900 rounded"
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
                  <h2 className="text-xl font-semibold">Recent Courses</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentCourses.slice(0, 5).map((course) => (
                      <div key={course._id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-400">by {course.instructor}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCourseAction(course._id, 'approve')}
                            className="p-2 text-green-400 hover:bg-green-900 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCourseAction(course._id, 'reject')}
                            className="p-2 text-red-400 hover:bg-red-900 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-700">
                        <td className="py-3 px-4">{user.displayName || 'Unknown'}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.role || 'User'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-400 hover:bg-blue-900 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-400 hover:bg-red-900 rounded">
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
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Instructor Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
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
                      <tr key={instructor._id} className="border-b border-gray-700">
                        <td className="py-3 px-4">{instructor.displayName || 'Unknown'}</td>
                        <td className="py-3 px-4">{instructor.email}</td>
                        <td className="py-3 px-4">{instructor.totalCourses || 0}</td>
                        <td className="py-3 px-4">{instructor.totalStudents || 0}</td>
                        <td className="py-3 px-4">${instructor.totalRevenue || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${instructor.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                            {instructor.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-400 hover:bg-blue-900 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInstructorAction(instructor._id, 'suspend')}
                              className="p-1 text-yellow-400 hover:bg-yellow-900 rounded"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInstructorAction(instructor._id, 'approve')}
                              className="p-1 text-green-400 hover:bg-green-900 rounded"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-400 hover:bg-red-900 rounded">
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

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Course Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Course</th>
                      <th className="text-left py-3 px-4">Instructor</th>
                      <th className="text-left py-3 px-4">Students</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map((course) => (
                      <tr key={course._id} className="border-b border-gray-700">
                        <td className="py-3 px-4">{course.title}</td>
                        <td className="py-3 px-4">{course.instructor}</td>
                        <td className="py-3 px-4">{course.enrolledStudents || 0}</td>
                        <td className="py-3 px-4">${course.price}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${course.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                            }`}>
                            {course.status || 'draft'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-400 hover:bg-blue-900 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-yellow-400 hover:bg-yellow-900 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-400 hover:bg-red-900 rounded">
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6">Platform Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="text-lg font-medium mb-4">User Growth</h3>
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Analytics chart would go here
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="text-lg font-medium mb-4">Course Enrollment Trends</h3>
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Analytics chart would go here
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
