import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    short_description: '',
    price: '',
    category: 'Front End',
    seats: 50,
  });

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, usersRes, statsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users'),
        api.get('/admin/stats').catch(err => {
          console.warn("Failed to fetch admin stats:", err);
          return { data: null };
        })
      ]);
      
      setCourses(coursesRes.data || []);
      setUsers(usersRes.data || []);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to retrieve dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${courseId}`);
        setCourses(courses.filter(course => course._id !== courseId));
        toast.success('Course deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  const handleAddCourse = async () => {
    try {
      if (!newCourse.title || !newCourse.price) {
        toast.error("Please fill in course title and price.");
        return;
      }
      
      const payload = {
        title: newCourse.title,
        short_description: newCourse.short_description || 'No description provided.',
        price: parseFloat(newCourse.price),
        category: newCourse.category,
        seats: parseInt(newCourse.seats) || 50,
        instructorEmail: user?.email,
      };

      await api.post('/courses', payload);
      toast.success('Course created successfully!');
      setShowAddModal(false);
      setNewCourse({
        title: '',
        short_description: '',
        price: '',
        category: 'Front End',
        seats: 50,
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgRating = courses.length > 0
    ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1)
    : '0.0';

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
                <p className="text-xs text-gray-400 capitalize font-bold">
                  {user?.role || 'student'}
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
                  value={stats ? stats.totalCourses : courses.length}
                  icon={BookOpen}
                  color="bg-cyan-600"
                />
                <StatCard
                  title="Total Users"
                  value={stats ? stats.totalUsers : users.length}
                  icon={Users}
                  color="bg-blue-600"
                />
                <StatCard
                  title="Total Revenue"
                  value={stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
                  icon={DollarSign}
                  color="bg-indigo-600"
                />
                <StatCard
                  title="Avg Rating"
                  value={avgRating}
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
                        Recent Courses
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
                          {courses.slice(0, 5).map((course) => (
                            <tr key={course._id} className="border-b border-gray-700 hover:bg-gray-750">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{course.title}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{course.instructor?.name || 'Unknown'}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{course.enrollmentCount || 0}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                {formatCurrency((course.enrollmentCount || 0) * course.price)}
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
                        Recent Users
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
                          {users.slice(0, 5).map((u) => (
                            <tr key={u._id} className="border-b border-gray-700 hover:bg-gray-750">
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
                        Recent Users List
                      </h2>
                      <div className="space-y-3">
                        {users.slice(0, 5).map((u) => (
                          <div
                            key={u._id}
                            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/40 px-4 py-3"
                          >
                            <div>
                              <p className="text-white font-medium">{u.name}</p>
                              <p className="text-sm text-gray-400">{u.email}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
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
                        {[...courses]
                          .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
                          .slice(0, 5)
                          .map((course, idx) => (
                            <div
                              key={course._id}
                              className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/40 px-4 py-3"
                            >
                              <div>
                                <p className="text-white font-medium">{course.title}</p>
                                <p className="text-sm text-gray-400">{course.enrollmentCount || 0} students</p>
                              </div>
                              <span className="text-cyan-400 text-sm font-bold">#{idx + 1}</span>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.instructor?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{course.enrollmentCount || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatCurrency((course.enrollmentCount || 0) * course.price)}
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
                      {users.map((u) => (
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
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Enter course title"
                  className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={newCourse.short_description}
                  onChange={(e) => setNewCourse({ ...newCourse, short_description: e.target.value })}
                  placeholder="Enter course description"
                  rows={3}
                  className="textarea textarea-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                  placeholder="0"
                  className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  className="select select-bordered w-full bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Front End">Front End</option>
                  <option value="Back End">Back End</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Mobile Applications">Mobile Applications</option>
                </select>
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
                onClick={handleAddCourse}
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
