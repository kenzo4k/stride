import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import toast from 'react-hot-toast';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  BarChart3,
  Mail,
  TrendingDown
} from 'lucide-react';
import AtRiskStudents from '../../components/instructor/AtRiskStudents';
import AnalyticsChart from '../../components/instructor/AnalyticsChart';

// Sample data for tabs - ADD THIS
const sampleInstructorData = {
  // Overview Tab
  overview: {
    stats: {
      totalStudents: 45,
      activeCourses: 3,
      avgGrade: 78,
      completionRate: 72
    },
    recentActivity: [
      { user: "Ahmed Khan", action: "Enrolled", course: "Web Dev", time: "2 hours ago" },
      { user: "Fatima Ali", action: "Completed", course: "Python", time: "Yesterday" },
      { user: "Omar Hassan", action: "Started", course: "React", time: "2 days ago" }
    ]
  },

  // Courses Tab
  courses: [
    {
      id: 1,
      title: "Web Development Bootcamp",
      students: 45,
      avgGrade: 85,
      completion: 90,
      lastUpdated: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      title: "Python Basics",
      students: 32,
      avgGrade: 72,
      completion: 80,
      lastUpdated: "2024-01-12",
      status: "Active"
    },
    {
      id: 3,
      title: "React Advanced",
      students: 28,
      avgGrade: 78,
      completion: 75,
      lastUpdated: "2024-01-10",
      status: "Active"
    }
  ],

  // Students Tab
  students: [
    {
      id: 1,
      name: "Ahmed Khan",
      email: "ahmed@email.com",
      enrolledCourses: 3,
      avgGrade: 85,
      completion: 90,
      status: "Active"
    },
    {
      id: 2,
      name: "Fatima Ali",
      email: "fatima@email.com",
      enrolledCourses: 2,
      avgGrade: 72,
      completion: 80,
      status: "Active"
    },
    {
      id: 3,
      name: "Omar Hassan",
      email: "omar@email.com",
      enrolledCourses: 3,
      avgGrade: 45,
      completion: 30,
      status: "At Risk"
    },
    {
      id: 4,
      name: "Zainab Ahmed",
      email: "zainab@email.com",
      enrolledCourses: 1,
      avgGrade: 55,
      completion: 50,
      status: "At Risk"
    }
  ]
};

const Instructor = () => {
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingReviews: 0,
    activeCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample analytics data
  const sampleAnalytics = {
    stats: {
      totalStudents: 45,
      activeCourses: 3,
      avgClassGrade: 78,
      completionRate: 72
    },
    gradeDistribution: [
      { grade: 'A (90-100%)', count: 15, color: 'blue' },
      { grade: 'B (80-89%)', count: 20, color: 'cyan' },
      { grade: 'C (70-79%)', count: 8, color: 'yellow' },
      { grade: 'D+ (60-69%)', count: 2, color: 'red' }
    ],
    students: [
      { name: "Ahmed Khan", enrolled: "2024-01-05", courses: 3, grade: 85, completion: 90, status: "Active" },
      { name: "Fatima Ali", enrolled: "2024-01-03", courses: 2, grade: 72, completion: 80, status: "Active" },
      { name: "Omar Hassan", enrolled: "2024-01-10", courses: 1, grade: 45, completion: 30, status: "Inactive" },
      { name: "Sarah Ahmed", enrolled: "2024-01-15", courses: 3, grade: 92, completion: 95, status: "Active" },
      { name: "Zainab Ahmed", enrolled: "2024-01-08", courses: 2, grade: 55, completion: 45, status: "Active" },
      { name: "Hassan Mohamed", enrolled: "2024-01-12", courses: 2, grade: 88, completion: 85, status: "Active" },
      { name: "Layla Ibrahim", enrolled: "2024-01-20", courses: 1, grade: 78, completion: 75, status: "Active" },
      { name: "Yusuf Abdullah", enrolled: "2024-01-18", courses: 3, grade: 82, completion: 88, status: "Active" }
    ],
    courseStats: [
      { name: "Web Development", students: 25, completion: 85, avgGrade: 82, lastUpdated: "2024-01-20" },
      { name: "Python Programming", students: 15, completion: 65, avgGrade: 75, lastUpdated: "2024-01-18" },
      { name: "Data Science", students: 18, completion: 70, avgGrade: 78, lastUpdated: "2024-01-22" }
    ],
    engagement: {
      participationRate: 68,
      quizCompletion: "320/450",
      submissionRate: 75,
      avgTimeSpent: "4.2 hours"
    },
    atRisk: [
      { name: "Omar Hassan", course: "Web Dev", grade: 45, status: "Failing" },
      { name: "Zainab Ahmed", course: "Python", grade: 55, status: "At Risk" }
    ]
  };

  useEffect(() => {
    fetchInstructorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);

      // Fetch instructor statistics
      const statsResponse = await fetch(`https://course-management-system-server-woad.vercel.app/api/instructor/stats?email=${user.email}`);
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch instructor courses
      const coursesResponse = await fetch(`https://course-management-system-server-woad.vercel.app/api/instructor/courses?email=${user.email}`);
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // Fetch instructor students
      const studentsResponse = await fetch(`https://course-management-system-server-woad.vercel.app/api/instructor/students?email=${user.email}`);
      const studentsData = await studentsResponse.json();
      setStudents(studentsData);

    } catch (error) {
      console.error('Error fetching instructor data:', error);
      toast.error('Failed to load instructor data');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAction = async (courseId, action) => {
    try {
      const response = await fetch(`https://course-management-system-server-woad.vercel.app/api/instructor/courses/${courseId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Course ${action} successfully`);
        fetchInstructorData();
      } else {
        throw new Error('Failed to perform action');
      }
    } catch {
      toast.error(`Failed to ${action} course`);
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
          <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-gray-400">Manage your courses and students</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-700">
          {['overview', 'courses', 'students', 'at-risk', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab === 'at-risk' ? 'At-Risk Students' : tab}
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
                    <p className="text-gray-400 text-sm">Total Students</p>
                    <p className="text-3xl font-bold">{sampleInstructorData.overview.stats.totalStudents}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Courses</p>
                    <p className="text-3xl font-bold">{sampleInstructorData.overview.stats.activeCourses}</p>
                  </div>
                  <Award className="w-8 h-8 text-teal-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Grade</p>
                    <p className="text-3xl font-bold">{sampleInstructorData.overview.stats.avgGrade}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                    <p className="text-3xl font-bold">{sampleInstructorData.overview.stats.completionRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              {/* Keep existing stats but update styling */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Courses</p>
                    <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold">${stats.totalRevenue}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Average Rating</p>
                    <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Reviews</p>
                    <p className="text-3xl font-bold">{stats.pendingReviews}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity - NEW */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {sampleInstructorData.overview.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 border-b border-gray-700 pb-3 last:border-0">
                        <div className="p-2 bg-gray-700 rounded-full">
                          <Activity className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="text-cyan-400">{activity.user}</span> {activity.action} <span className="text-blue-400">{activity.course}</span>
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Courses */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">My Courses</h2>
                  <Link
                    to="/add-course"
                    className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none btn-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Link>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {courses.length > 0 ? courses.slice(0, 5).map((course) => (
                      <div key={course._id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-400">{course.enrolledStudents || 0} students</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/course/${course._id}/view`)}
                            className="p-2 text-cyan-400 hover:bg-gray-700 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/edit-course/${course._id}`)}
                            className="p-2 text-yellow-400 hover:bg-gray-700 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center italic">No courses found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Students */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">Recent Students</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {students.length > 0 ? students.slice(0, 5).map((student) => (
                      <div key={student._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            {student.displayName?.charAt(0) || student.email?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{student.displayName || 'Unknown'}</p>
                            <p className="text-sm text-gray-400 text-ellipsis overflow-hidden w-24 md:w-auto">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {student.enrolledCourses || 0} courses
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center italic">No students found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course Management</h2>
              <Link
                to="/add-course"
                className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </Link>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="table table-compact w-full text-white">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="text-left text-gray-300">Course</th>
                      <th className="text-left text-gray-300">Students</th>
                      <th className="text-left text-gray-300">Avg Grade</th>
                      <th className="text-left text-gray-300">Completion</th>
                      <th className="text-left text-gray-300">Status</th>
                      <th className="text-left text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800">
                    {/* Sample Data Courses */}
                    {sampleInstructorData.courses.map((course) => (
                      <tr key={`sample-${course.id}`} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-3 px-4 font-medium text-cyan-400">{course.title}</td>
                        <td className="py-3 px-4">{course.students}</td>
                        <td className="py-3 px-4">{course.avgGrade}%</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-cyan-500 h-1.5 rounded-full"
                                style={{ width: `${course.completion}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{course.completion}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
                            {course.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => navigate(`/edit-course/${course.id}`)}
                              className="btn btn-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
                            >
                              <Edit className="w-3 h-3 mr-1" /> Edit
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm('Are you sure you want to delete this course?')) {
                                  toast.success('Course deleted (sample)');
                                }
                              }}
                              className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Real Data Courses - NO DELETION */}
                    {courses.map((course) => (
                      <tr key={course._id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-3 px-4">{course.title}</td>
                        <td className="py-3 px-4">{course.enrolledStudents || 0}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>{course.rating || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">${course.revenue || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${course.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                            }`}>
                            {course.status || 'draft'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => navigate(`/course/${course._id}/view`)}
                              className="btn btn-xs bg-gray-700 hover:bg-gray-600 text-white border-none"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => navigate(`/edit-course/${course._id}`)}
                              className="btn btn-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleCourseAction(course._id, 'delete')}
                              className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none"
                            >
                              <Trash2 className="w-3 h-3" />
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

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Student Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="table table-compact w-full text-white">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="text-left text-gray-300">Student</th>
                      <th className="text-left text-gray-300">Email</th>
                      <th className="text-left text-gray-300">Courses</th>
                      <th className="text-left text-gray-300">Avg Grade</th>
                      <th className="text-left text-gray-300">Progress</th>
                      <th className="text-left text-gray-300">Status</th>
                      <th className="text-left text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800">
                    {/* Sample Data Students */}
                    {sampleInstructorData.students.map((student) => (
                      <tr key={`sample-${student.id}`} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{student.email}</td>
                        <td className="py-3 px-4">{student.enrolledCourses}</td>
                        <td className="py-3 px-4 font-semibold text-cyan-400">{student.avgGrade}%</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-cyan-500 h-1.5 rounded-full"
                                style={{ width: `${student.completion}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{student.completion}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            student.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => toast.success(`Viewing ${student.name}`)}
                              className="btn btn-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
                            >
                              <Eye className="w-3 h-3 mr-1" /> View
                            </button>
                            <button 
                              onClick={() => toast.success(`Contacting ${student.name}`)}
                              className="btn btn-xs bg-gray-700 hover:bg-gray-600 text-white border-none"
                            >
                              <Mail className="w-3 h-3 mr-1" /> Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Real Data Students - NO DELETION */}
                    {students.map((student) => (
                      <tr key={student._id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-3 px-4">{student.displayName || 'Unknown'}</td>
                        <td className="py-3 px-4">{student.email}</td>
                        <td className="py-3 px-4">{student.enrolledCourses || 0}</td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${student.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{student.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-400 hover:bg-blue-900 rounded">
                              <Eye className="w-4 h-4" />
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

        {/* At-Risk Students Tab */}
        {activeTab === 'at-risk' && (
          <AtRiskStudents />
        )}

        {/* Analytics Tab - COMPREHENSIVE DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Header Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Students</p>
                    <p className="text-4xl font-bold text-white mt-1">{sampleAnalytics.stats.totalStudents}</p>
                    <p className="text-blue-100 text-xs mt-1">Enrolled across all courses</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Active Courses</p>
                    <p className="text-4xl font-bold text-white mt-1">{sampleAnalytics.stats.activeCourses}</p>
                    <p className="text-cyan-100 text-xs mt-1">Currently running</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-cyan-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Avg Class Grade</p>
                    <p className="text-4xl font-bold text-white mt-1">{sampleAnalytics.stats.avgClassGrade}%</p>
                    <p className="text-green-100 text-xs mt-1">Overall performance</p>
                  </div>
                  <Target className="w-12 h-12 text-green-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
                    <p className="text-4xl font-bold text-white mt-1">{sampleAnalytics.stats.completionRate}%</p>
                    <p className="text-purple-100 text-xs mt-1">Course completion</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-purple-200 opacity-80" />
                </div>
              </div>
            </div>

            {/* Class Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Grade Distribution
                </h2>
                <AnalyticsChart 
                  data={sampleAnalytics.gradeDistribution} 
                  type="bar"
                  maxValue={25}
                />
              </div>

              {/* Completion & Engagement */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Completion & Engagement
                </h2>
                <div className="space-y-6">
                  <AnalyticsChart 
                    data={{ 
                      percentage: sampleAnalytics.stats.completionRate, 
                      label: `${sampleAnalytics.stats.completionRate}% of students completed courses`
                    }} 
                    type="progress"
                    title="Overall Completion Rate"
                  />
                  <AnalyticsChart 
                    data={{ 
                      percentage: sampleAnalytics.engagement.participationRate, 
                      label: `${sampleAnalytics.engagement.participationRate}% students are actively participating`
                    }} 
                    type="progress"
                    title="Student Participation"
                  />
                  <AnalyticsChart 
                    data={{ 
                      percentage: sampleAnalytics.engagement.submissionRate, 
                      label: `${sampleAnalytics.engagement.submissionRate}% on-time assignment submissions`
                    }} 
                    type="progress"
                    title="Assignment Submission Rate"
                  />
                </div>
              </div>
            </div>

            {/* Course-wise Performance Cards */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                Course Performance Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sampleAnalytics.courseStats.map((course, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-5 border border-gray-600 hover:border-cyan-500 transition-colors">
                    <h3 className="font-semibold text-lg mb-3">{course.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Students:</span>
                        <span className="font-medium text-cyan-400">{course.students}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Avg Grade:</span>
                        <span className="font-medium text-green-400">{course.avgGrade}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Completion:</span>
                        <span className="font-medium text-blue-400">{course.completion}%</span>
                      </div>
                      <div className="pt-2 border-t border-gray-600">
                        <p className="text-xs text-gray-400">Last updated: {course.lastUpdated}</p>
                      </div>
                      <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Analytics
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Engagement Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-700 rounded-lg p-5 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 text-cyan-400" />
                    <span className="text-2xl font-bold text-cyan-400">{sampleAnalytics.engagement.participationRate}%</span>
                  </div>
                  <p className="text-gray-300 font-medium">Participation Rate</p>
                  <p className="text-gray-400 text-sm mt-1">Students are active</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-5 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{sampleAnalytics.engagement.quizCompletion}</span>
                  </div>
                  <p className="text-gray-300 font-medium">Quiz Completion</p>
                  <p className="text-gray-400 text-sm mt-1">Quizzes completed</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-5 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bold text-blue-400">{sampleAnalytics.engagement.submissionRate}%</span>
                  </div>
                  <p className="text-gray-300 font-medium">On-Time Submissions</p>
                  <p className="text-gray-400 text-sm mt-1">Assignment submission rate</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-5 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold text-purple-400">{sampleAnalytics.engagement.avgTimeSpent}</span>
                  </div>
                  <p className="text-gray-300 font-medium">Avg Time Spent</p>
                  <p className="text-gray-400 text-sm mt-1">Per course weekly</p>
                </div>
              </div>
            </div>

            {/* Student Performance Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Student Performance Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Student Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Enrolled</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Courses</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Avg Grade</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Completion</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleAnalytics.students.map((student, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{student.enrolled}</td>
                          <td className="py-3 px-4 text-gray-300">{student.courses}</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${
                              student.grade >= 80 ? 'text-green-400' : 
                              student.grade >= 70 ? 'text-blue-400' : 
                              student.grade >= 60 ? 'text-yellow-400' : 
                              'text-red-400'
                            }`}>
                              {student.grade}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    student.completion >= 80 ? 'bg-green-500' : 
                                    student.completion >= 60 ? 'bg-blue-500' : 
                                    student.completion >= 40 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${student.completion}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-400">{student.completion}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              student.status === 'Active' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>           
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructor;
