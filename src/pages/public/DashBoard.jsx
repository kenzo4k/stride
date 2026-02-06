import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';
import { FiBook, FiAward, FiBarChart2 } from 'react-icons/fi';
import { CourseCard, RecommendedCourses } from '../../components/common';

const Dashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            const fetchEnrolledCourses = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('access-token');
                    const response = await axios.get('https://course-management-system-server-woad.vercel.app/api/my-enrollments', {
                        headers: { 'authorization': `Bearer ${token}` }
                    });
                    setEnrolledCourses(response.data);
                } catch (error) {
                    console.error("Failed to fetch enrolled courses for dashboard.", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchEnrolledCourses();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Welcome back, {user?.displayName || 'Learner'}!
                    </h1>
                    <p className="text-gray-400 mt-2">Here's your learning dashboard</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600 transition">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-cyan-900/30 text-cyan-400 mr-4">
                                <FiBook className="text-xl" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Courses Enrolled</p>
                                <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600 transition">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-900/30 text-blue-400 mr-4">
                                <FiAward className="text-xl" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Certificates</p>
                                <p className="text-2xl font-bold">
                                    {enrolledCourses.filter(c => c.completion_certificate).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600 transition">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-900/30 text-green-400 mr-4">
                                <FiBarChart2 className="text-xl" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Learning Progress</p>
                                <p className="text-2xl font-bold">0%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personalized Recommendations Section - Only for logged-in users */}
                {user && (
                    <RecommendedCourses 
                        scenario="mixed"
                        title="Personalized Recommendations"
                        description="Based on your learning journey and interests"
                        compact={true}
                    />
                )}

                {/* Main Content Area */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                    {/* Your Courses Section */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Continue Learning</h2>
                            <Link to="/my-courses" className="text-cyan-400 hover:text-cyan-300 flex items-center text-sm">
                                View all <FaArrowRight className="ml-1" />
                            </Link>
                        </div>
                        
                        {enrolledCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrolledCourses.slice(0, 4).map((course) => (
                                    <CourseCard key={course.enrollmentId} course={course} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-gray-700">
                                <div className="max-w-md mx-auto">
                                    <FiBook className="text-5xl text-cyan-400/50 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">No Enrolled Courses</h3>
                                    <p className="text-gray-400 mb-6">
                                        You haven't enrolled in any courses yet. Explore our catalog to start learning!
                                    </p>
                                    <Link 
                                        to="/courses"
                                        className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none px-8"
                                    >
                                        Browse Courses
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;