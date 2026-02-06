import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  UserCheck,
  UserPlus,
  Settings,
  Menu,
  X,
  Mail,
  Eye
} from 'lucide-react';

const USE_ADMIN_SAMPLE_DATA = true;

const adminSampleData = {
  stats: {
    totalCourses: 8,
    totalUsers: 45,
    totalRevenue: 2100,
    avgRating: 4.2,
  },
  courses: [
    { id: '1', title: 'Web Development Bootcamp', instructor: 'Ahmed Khan', students: 45, revenue: 1200, status: 'Active' },
    { id: '2', title: 'Python Basics', instructor: 'Fatima Ali', students: 32, revenue: 650, status: 'Active' },
    { id: '3', title: 'React Fundamentals', instructor: 'Omar Hassan', students: 38, revenue: 800, status: 'Active' },
  ],
  users: [
    { id: '1', name: 'Ahmed Khan', email: 'ahmed@email.com', role: 'Instructor', joinDate: '2024-01-05', status: 'Active' },
    { id: '2', name: 'Fatima Ali', email: 'fatima@email.com', role: 'Instructor', joinDate: '2024-01-03', status: 'Active' },
    { id: '3', name: 'Zainab Ahmed', email: 'zainab@email.com', role: 'Student', joinDate: '2024-01-10', status: 'Active' },
  ],
  recentEnrollments: [
    { id: '1', user: 'Zainab Ahmed', course: 'Web Development', date: '2 hours ago' },
    { id: '2', user: 'Omar Hassan', course: 'Python Basics', date: 'Yesterday' },
  ],
  popularCourses: [
    { id: '1', title: 'Web Development Bootcamp', students: 45 },
    { id: '3', title: 'React Fundamentals', students: 38 },
  ],
};

// Sample data - ONLY for display
const sampleStats = {
  totalCourses: 8,
  totalUsers: 45,
  totalRevenue: 2100,
  avgRating: 4.2
};

const sampleCourses = [
  { _id: 1, title: "Web Development Bootcamp", instructor: "Ahmed Khan", students: 45, revenue: 1200, status: "Active" },
  { _id: 2, title: "Python Basics", instructor: "Fatima Ali", students: 32, revenue: 650, status: "Active" },
  { _id: 3, title: "React Fundamentals", instructor: "Omar Hassan", students: 38, revenue: 800, status: "Active" }
];

const sampleUsers = [
  { _id: 1, name: "Ahmed Khan", email: "ahmed@email.com", role: "Instructor", createdAt: "2024-01-05", status: "Active" },
  { _id: 2, name: "Fatima Ali", email: "fatima@email.com", role: "Instructor", createdAt: "2024-01-03", status: "Active" },
  { _id: 3, name: "Zainab Ahmed", email: "zainab@email.com", role: "Student", createdAt: "2024-01-10", status: "Active" }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Check if user is admin or instructor
  const isAdmin = user?.email === 'admin@learnify.com' || user?.email === 'emad@gmail.com';
  const isInstructor = Boolean(!isAdmin && user);

  useEffect(() => {
    if (USE_ADMIN_SAMPLE_DATA && isAdmin) {
      setLoading(false);
    }

    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        axios.get('https://course-management-system-server-woad.vercel.app/api/courses'),
        axios.get('https://course-management-system-server-woad.vercel.app/api/users')
      ]);
      
      setCourses(coursesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`https://course-management-system-server-woad.vercel.app/api/courses/${courseId}`);
        setCourses(courses.filter(course => course._id !== courseId));
        toast.success('Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const coursesToDisplay = courses && courses.length > 0 ? courses : sampleCourses;
  const usersToDisplay = users && users.length > 0 ? users : sampleUsers;

  const filteredCourses = coursesToDisplay.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-cyan-600 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {React.createElement(Icon, { className: 'w-6 h-6 text-white' })}
        </div>
      </div>
    </div>
  );

  const sidebarItems = [
    ...(isAdmin ? [
      { id: 'overview', label: 'Overview', icon: TrendingUp },
      { id: 'courses', label: 'All Courses', icon: BookOpen },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'instructors', label: 'Instructors', icon: UserCheck },
    ] : [
      { id: 'overview', label: 'My Dashboard', icon: TrendingUp },
      { id: 'courses', label: 'My Courses', icon: BookOpen },
    ]),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-cyan-400">Stride Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">
                  {isAdmin ? 'Admin' : isInstructor ? 'Instructor' : 'User'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-gray-700 text-cyan-400 border-r-2 border-cyan-400'
                      : 'text-gray-400 hover:bg-gray-750 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-gray-800 border-b border-gray-700 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <div className="w-6"></div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isAdmin ? 'Platform Overview' : 'My Dashboard'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {isAdmin ? 'Manage the entire platform' : 'Manage your courses and students'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Courses"
                  value={
                    USE_ADMIN_SAMPLE_DATA && isAdmin
                      ? adminSampleData.stats.totalCourses
                      : courses.length > 0 ? courses.length : sampleStats.totalCourses
                  }
                  icon={BookOpen}
                  color="bg-cyan-600"
                />
                <StatCard
                  title="Total Users"
                  value={
                    USE_ADMIN_SAMPLE_DATA && isAdmin
                      ? adminSampleData.stats.totalUsers
                      : users.length > 0 ? users.length : sampleStats.totalUsers
                  }
                  icon={Users}
                  color="bg-blue-600"
                />
                <StatCard
                  title="Total Revenue"
                  value={
                    USE_ADMIN_SAMPLE_DATA && isAdmin
                      ? formatCurrency(adminSampleData.stats.totalRevenue)
                      : formatCurrency(sampleStats.totalRevenue)
                  }
                  icon={DollarSign}
                  color="bg-indigo-600"
                />
                <StatCard
                  title="Avg Rating"
                  value={
                    USE_ADMIN_SAMPLE_DATA && isAdmin
                      ? adminSampleData.stats.avgRating
                      : sampleStats.avgRating
                  }
                  icon={Star}
                  color="bg-sky-600"
                />
              </div>

              <div className="space-y-6">
                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Courses Table */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                        {isAdmin && USE_ADMIN_SAMPLE_DATA ? 'Sample Courses' : 'Recent Courses'}
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table table-compact w-full text-white">
                        <thead className="bg-gray-700 border-b border-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Instructor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Students</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Revenue</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-800">
                          {(isAdmin && USE_ADMIN_SAMPLE_DATA ? adminSampleData.courses : (courses.length > 0 ? courses.slice(0, 5) : sampleCourses)).map((course) => (
                            <tr key={course.id || course._id} className="border-b border-gray-700 hover:bg-gray-750">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{course.title}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{course.instructor}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{course.students || 0}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                {course.revenue ? formatCurrency(course.revenue) : formatCurrency(course.price || 0)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-full bg-green-900/40 px-2.5 py-1 text-xs font-semibold text-green-300 border border-green-800">
                                  {course.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        {isAdmin && USE_ADMIN_SAMPLE_DATA ? 'Sample Users' : 'Recent Users'}
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="table table-compact w-full text-white">
                        <thead className="bg-gray-700 border-b border-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-800">
                          {(isAdmin && USE_ADMIN_SAMPLE_DATA ? adminSampleData.users : (users.length > 0 ? users.slice(0, 5) : sampleUsers)).map((u) => (
                            <tr key={u.id || u._id} className="border-b border-gray-700 hover:bg-gray-750">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{u.name}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-full bg-cyan-900/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-800">
                                  {u.role || 'Student'}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-full bg-green-900/40 px-2.5 py-1 text-xs font-semibold text-green-300 border border-green-800">
                                  {u.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition p-6">
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-cyan-400" />
                        Recent Enrollments
                      </h2>
                      <div className="space-y-3">
                        {adminSampleData.recentEnrollments.map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/40 px-4 py-3"
                          >
                            <div>
                              <p className="text-white font-medium">{enrollment.user}</p>
                              <p className="text-sm text-gray-400">{enrollment.course}</p>
                            </div>
                            <span className="text-xs text-gray-500">{enrollment.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition p-6">
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Popular Courses
                      </h2>
                      <div className="space-y-3">
                        {adminSampleData.popularCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/40 px-4 py-3"
                          >
                            <div>
                              <p className="text-white font-medium">{course.title}</p>
                              <p className="text-sm text-gray-400">{course.students} students</p>
                            </div>
                            <span className="text-cyan-400 text-sm font-bold">#{course.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isAdmin ? 'All Courses' : 'My Courses'}
                  </h1>
                  <p className="text-gray-400 mt-1">Manage courses</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </button>
              </div>

              {/* Search and Filter */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input input-bordered w-full pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button className="btn bg-gray-700 hover:bg-gray-600 text-white border-none">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Courses Table */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-compact w-full text-white">
                    <thead className="bg-gray-700 border-b border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Instructor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800">
                      {filteredCourses.map((course) => (
                        <tr key={course._id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BookOpen className="w-5 h-5 text-cyan-500 mr-3" />
                              <div className="text-sm font-medium text-white">{course.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.instructor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.students || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {course.revenue ? formatCurrency(course.revenue) : formatCurrency(course.price || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-900/40 text-green-300 border border-green-800">
                              {course.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => navigate(`/edit-course/${course._id}`)}
                                className="btn btn-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCourse(course._id)}
                                className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none"
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

          {activeTab === 'users' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">All Users</h1>
                <p className="text-gray-400 mt-1">Manage platform users</p>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-compact w-full text-white">
                    <thead className="bg-gray-700 border-b border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800">
                      {usersToDisplay.map((u) => (
                        <tr key={u._id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                {u.name?.[0] || u.email?.[0]?.toUpperCase()}
                              </div>
                              <div className="text-sm font-medium text-white">{u.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-800">
                              {u.role || 'Student'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-900/40 text-green-300 border border-green-800">
                              {u.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account settings</p>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                        <input
                          type="text"
                          value={user?.displayName || ''}
                          className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">Email Notifications</p>
                          <p className="text-sm text-gray-400">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="checkbox checkbox-primary"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Course Title</label>
                <input
                  type="text"
                  placeholder="Enter course title"
                  className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  placeholder="Enter course description"
                  rows={3}
                  className="textarea textarea-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price</label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  toast.success('Course added (sample)');
                }}
                className="btn bg-green-600 hover:bg-green-700 text-white border-none"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
