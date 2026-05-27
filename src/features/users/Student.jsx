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

import api from '../../services/api';

const Student = () => {
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    inProgress: 0,
    completed: 0,
    currentLevel: user?.level || 1,
    totalXP: user?.xp || 0
  });
  const [courses, setCourses] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [categoryProgress, setCategoryProgress] = useState([]);

  React.useEffect(() => {
    if (!user?.email) return;

    api.get(`/my-enrollments?email=${user.email}`)
      .then(res => {
        const enrollments = res.data || [];
        const mappedCourses = enrollments.map(e => {
            const course = e.courseId || {};
            return {
                id: course._id,
                title: course.title,
                progress: e.progress || 0,
                lessons: `${e.completedLessons?.length || 0} lessons completed`,
                image: course.image,
                lastAccessed: new Date(e.updatedAt || Date.now()).toLocaleDateString(),
                category: course.category
            };
        });
        setCourses(mappedCourses);
        
        let completed = 0;
        let inProgress = 0;
        let totalGrades = 0;
        let gradedCount = 0;
        enrollments.forEach(e => {
            if (e.progress === 100) completed++;
            else inProgress++;
            if (e.grade !== undefined && e.grade !== null) {
              totalGrades += e.grade;
              gradedCount++;
            }
        });

        setStats(prev => ({
            ...prev,
            enrolledCourses: enrollments.length,
            inProgress,
            completed,
            currentLevel: user?.level || prev.currentLevel,
            totalXP: user?.xp || prev.totalXP,
            avgGrade: gradedCount > 0 ? Math.round(totalGrades / gradedCount) : 85 // default/fallback
        }));

        // Compute dynamic deadlines
        const computedDeadlines = enrollments.filter(e => (e.progress || 0) < 100).map((e, idx) => {
            const course = e.courseId || {};
            const daysLeft = 3 + idx * 2;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + daysLeft);
            return {
                course: course.title || 'Course',
                assignment: e.progress > 0 ? "Next Assignment" : "Intro Quiz",
                dueDate: dueDate.toISOString().split('T')[0],
                daysLeft
            };
        });
        setDeadlines(computedDeadlines);

        // Compute dynamic recommended steps
        let computedRecommended = [];
        if (enrollments.length > 0) {
            computedRecommended = enrollments.map(e => {
                const course = e.courseId || {};
                if (e.progress < 100) {
                    return {
                        id: course._id,
                        title: `Continue: ${course.title}`,
                        progress: e.progress || 0,
                        action: "View",
                        description: "Resume your learning journey"
                    };
                } else {
                    return {
                        id: course._id,
                        title: `Quiz: ${course.title}`,
                        progress: 100,
                        action: "Take Quiz",
                        description: "Course completed! Take the quiz."
                    };
                }
            });
        } else {
            computedRecommended = [
                {
                    id: 'explore',
                    title: "Explore Courses",
                    progress: 0,
                    action: "Browse",
                    description: "Explore our catalog to start learning!"
                }
            ];
        }
        setRecommended(computedRecommended);

        // Group by category for category progress
        const categoryMap = {};
        enrollments.forEach(e => {
            const course = e.courseId || {};
            const cat = course.category || 'General';
            if (!categoryMap[cat]) {
                categoryMap[cat] = { totalProgress: 0, count: 0 };
            }
            categoryMap[cat].totalProgress += (e.progress || 0);
            categoryMap[cat].count++;
        });

        const colors = [
            "from-cyan-400 to-blue-500",
            "from-green-400 to-emerald-500",
            "from-purple-400 to-pink-500",
            "from-orange-400 to-red-500",
            "from-yellow-400 to-orange-500"
        ];

        const computedCategoryProgress = Object.keys(categoryMap).map((cat, idx) => ({
            category: cat,
            progress: Math.round(categoryMap[cat].totalProgress / categoryMap[cat].count),
            color: colors[idx % colors.length]
        }));
        setCategoryProgress(computedCategoryProgress);

        // Compute recent activity
        const computedRecentActivity = enrollments.map((e, idx) => {
            const course = e.courseId || {};
            return {
                action: e.progress === 100 ? "Completed course" : (e.progress > 0 ? `Reached ${e.progress}% progress` : "Enrolled in course"),
                course: course.title || 'Course',
                time: e.updatedAt ? new Date(e.updatedAt).toLocaleDateString() : "Recently",
                icon: e.progress === 100 ? "🏆" : (e.progress > 0 ? "⚡" : "📚"),
                xp: e.progress === 100 ? 100 : (e.progress > 0 ? 50 : 20)
            };
        });
        setRecentActivity(computedRecentActivity);
      })
      .catch(console.error);
  }, [user]);

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
                <span className="font-semibold">{user?.streakDays || 1} Day Streak!</span>
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
                    <span className="text-cyan-400 font-semibold">{courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0}%</span>
                  </div>
                  <ProgressBar current={courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0} max={100} color="cyan" />
                  <p className="text-sm text-gray-400 mt-2">of all courses</p>
                </div>

                {/* Average Grade */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Average Grade</span>
                    <span className="text-green-400 font-semibold">{stats.avgGrade || 85}%</span>
                  </div>
                  <ProgressBar current={stats.avgGrade || 85} max={100} color="green" />
                  <p className="text-sm text-gray-400 mt-2">{stats.avgGrade >= 80 ? 'Excellent performance!' : 'Keep pushing forward!'}</p>
                </div>

                {/* Learning Hours */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Total Learning Hours</span>
                    <span className="text-purple-400 font-semibold">{Math.round(courses.reduce((acc, c) => acc + (c.progress * 0.2), 0)) || 5}h</span>
                  </div>
                  <ProgressBar current={Math.min(Math.round(courses.reduce((acc, c) => acc + (c.progress * 0.2), 0)) || 5, 100)} max={100} color="purple" />
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
