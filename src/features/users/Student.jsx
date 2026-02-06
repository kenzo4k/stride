import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthProvider";
import { 
  BookOpen, 
  Award,
  Clock,
  Target,
  Calendar,
  Play,
  CheckCircle,
  Star,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Flame
} from 'lucide-react';

import { StatsGrid, ProgressBar, Leaderboard, Badges } from '../../components/common';
import ProgressCard from '../../components/common/ProgressCard';
import MyEnrolledCourses from '../courses/MyEnrolledCourses';

// Sample data structure
const sampleDashboard = {
  stats: {
    enrolledCourses: 5,
    inProgress: 2,
    completed: 3,
    currentLevel: 4,
    totalXP: 450
  },
  courses: [
    {
      id: '1',
      title: "Web Development Fundamentals",
      progress: 42,
      lessons: "5/12 lessons completed",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
      lastAccessed: "Today",
      category: "Web Development"
    },
    {
      id: '2',
      title: "Python Basics",
      progress: 60,
      lessons: "9/15 lessons completed",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
      lastAccessed: "2 days ago",
      category: "Python"
    },
    {
      id: '3',
      title: "React Advanced",
      progress: 30,
      lessons: "6/20 lessons completed",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
      lastAccessed: "3 days ago",
      category: "React"
    },
    {
      id: '4',
      title: "Data Science Basics",
      progress: 85,
      lessons: "11/13 lessons completed",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      lastAccessed: "Yesterday",
      category: "Data Science"
    },
    {
      id: '5',
      title: "JavaScript Advanced",
      progress: 100,
      lessons: "12/12 lessons completed",
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400",
      lastAccessed: "1 week ago",
      category: "Web Development"
    }
  ],
  deadlines: [
    { course: "Web Development", assignment: "Quiz", dueDate: "2024-01-10", daysLeft: 3 },
    { course: "React Fundamentals", assignment: "Assignment", dueDate: "2024-01-09", daysLeft: 2 },
    { course: "Python Programming", assignment: "Project", dueDate: "2024-01-14", daysLeft: 7 },
    { course: "Data Science", assignment: "Quiz", dueDate: "2024-01-12", daysLeft: 5 }
  ],
  recommended: [
    { 
      id: 1,
      title: "Continue: React Fundamentals", 
      progress: 30, 
      action: "View",
      description: "2 lessons remaining"
    },
    { 
      id: 2,
      title: "Start: Node.js Basics", 
      progress: 0, 
      action: "View",
      description: "Recommended based on progress"
    },
    { 
      id: 3,
      title: "Complete Quiz: Data Structures", 
      progress: 100, 
      action: "Take Quiz",
      description: "Quiz pending"
    }
  ],
  recentActivity: [
    { action: "Completed Module 2", course: "Web Development", time: "2 hours ago", icon: "✅", xp: null },
    { action: "Earned 50 XP", course: "HTML Quiz", time: "Yesterday", icon: "⭐", xp: 50 },
    { action: "Started Course", course: "Python Fundamentals", time: "2 days ago", icon: "📚", xp: null },
    { action: "Earned 100 XP", course: "Completed JavaScript Advanced", time: "3 days ago", icon: "🏆", xp: 100 }
  ],
  categoryProgress: [
    { category: "Web Dev", progress: 70, color: "from-cyan-400 to-blue-500" },
    { category: "Python", progress: 60, color: "from-green-400 to-emerald-500" },
    { category: "Data Science", progress: 45, color: "from-purple-400 to-pink-500" },
    { category: "Mobile Dev", progress: 30, color: "from-orange-400 to-red-500" },
    { category: "DevOps", progress: 20, color: "from-yellow-400 to-orange-500" }
  ]
};

const Student = () => {
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState(sampleDashboard.stats);
  const [courses] = useState(sampleDashboard.courses);
  const [deadlines] = useState(sampleDashboard.deadlines);
  const [recommended] = useState(sampleDashboard.recommended);
  const [recentActivity] = useState(sampleDashboard.recentActivity);
  const [categoryProgress] = useState(sampleDashboard.categoryProgress);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}/learn`);
  };

  const handleContinueCourse = (courseId) => {
    handleCourseClick(courseId);
  };

  const getDeadlineColor = (daysLeft) => {
    if (daysLeft <= 2) return 'text-red-400 bg-red-900/30 border-red-800';
    if (daysLeft <= 5) return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    return 'text-green-400 bg-green-900/30 border-green-800';
  };

  const getDeadlineBadge = (daysLeft) => {
    if (daysLeft <= 2) return <AlertTriangle className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Student'}! 👋
              </h1>
              <p className="text-gray-400">Track your learning progress and achievements</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full shadow-lg">
                <Flame className="w-5 h-5" />
                <span className="font-semibold">{stats.currentLevel} Day Streak!</span>
              </div>
              <button 
                onClick={() => navigate('/achievements')}
                className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg"
              >
                <Award className="w-4 h-4 mr-2" />
                View Achievements
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid stats={stats} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-700 overflow-x-auto">
          {['overview', 'courses', 'progress', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Progress Metrics Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                Progress Metrics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overall Completion */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Overall Completion</span>
                    <span className="text-cyan-400 font-semibold">45%</span>
                  </div>
                  <ProgressBar current={45} max={100} color="cyan" />
                  <p className="text-sm text-gray-400 mt-2">of all courses</p>
                </div>

                {/* Average Grade */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Average Grade</span>
                    <span className="text-green-400 font-semibold">85%</span>
                  </div>
                  <ProgressBar current={85} max={100} color="green" />
                  <p className="text-sm text-gray-400 mt-2">Excellent performance!</p>
                </div>

                {/* Learning Hours */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Total Learning Hours</span>
                    <span className="text-purple-400 font-semibold">24h</span>
                  </div>
                  <ProgressBar current={24} max={100} color="purple" />
                  <p className="text-sm text-gray-400 mt-2">Keep it up!</p>
                </div>
              </div>

              {/* Category Progress Chart */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Category Progress</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {categoryProgress.map((cat, index) => (
                    <div key={index} className="text-center">
                      <div className="h-32 bg-gray-700 rounded-lg relative overflow-hidden mb-2">
                        <div 
                          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${cat.color} transition-all duration-500`}
                          style={{ height: `${cat.progress}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-white z-10">{cat.progress}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 font-medium">{cat.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Next Steps & Dead */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommended Next Steps */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-cyan-400" />
                  Recommended Next Steps
                </h2>
                <div className="space-y-4">
                  {recommended.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-cyan-500 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        {item.progress > 0 && (
                          <span className="px-3 py-1 bg-cyan-900/50 text-cyan-300 text-xs rounded-full">
                            {item.progress}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-32">
                          <ProgressBar 
                            current={item.progress} 
                            max={100} 
                            color={item.progress === 100 ? 'green' : 'blue'}
                            height="h-2"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            if (item.action === 'Take Quiz') {
                              navigate(`/course/${item.id}/assessment`);
                            } else {
                              navigate(`/course/${item.id}/learn`);
                            }
                          }}
                          className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none btn-sm flex items-center group-hover:translate-x-1 transition-transform"
                        >
                          {item.action}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                  Upcoming Deadlines
                </h2>
                <div className="space-y-3">
                  {deadlines.map((deadline, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${getDeadlineColor(deadline.daysLeft)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2">
                          {getDeadlineBadge(deadline.daysLeft)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{deadline.course}</p>
                          <p className="text-sm opacity-80">{deadline.assignment}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{deadline.daysLeft} days left</p>
                        <p className="text-xs opacity-70">{new Date(deadline.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* My Enrolled Courses (sample) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                  My Enrolled Courses
                </h2>
                <Link
                  to="/my-courses"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center text-sm"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCourseClick(course.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCourseClick(course.id);
                    }}
                    className="cursor-pointer"
                  >
                    <ProgressCard
                      {...course}
                      actionText="Continue Learning"
                      onAction={(e) => {
                        e?.stopPropagation?.();
                        handleContinueCourse(course.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-cyan-400" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                        {activity.icon}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {activity.action}: {activity.course}
                        </p>
                        <p className="text-sm text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                    {activity.xp && (
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-5 h-5 mr-1" />
                        <span className="font-semibold">+{activity.xp} XP</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">My Courses</h2>
            </div>
            <div className="p-6">
              {/* Display the student's enrolled courses */}
              <MyEnrolledCourses />
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6">Detailed Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                  Weekly Activity
                </h3>
                <div className="space-y-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="w-12 text-sm text-gray-400">{day}</span>
                      <div className="flex-1 bg-gray-600 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full"
                          style={{ width: `${[65, 80, 45, 90, 70, 30, 50][i]}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-300 w-12"> {[2.5, 3, 2, 3.5, 2.8, 1.2, 2][i]}h</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-cyan-400" />
                  Achievements
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {['First Course', '7 Day Streak', 'Top 10%', 'Fast Learner', 'Quiz Master', 'Perfect Score'].map((achievement, i) => (
                    <div key={i} className="text-center p-4 bg-gray-600 rounded-lg">
                      <div className="text-3xl mb-2">{['🎯', '🔥', '🏆', '⚡', '🧠', '💯'][i]}</div>
                      <p className="text-xs text-gray-300">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <Badges userEmail={user?.email} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;
