import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import toast from 'react-hot-toast';
import coursesData from '../../../public/courses.json';
import { RecommendedCourses } from '../../components/common';

const CourseDetails = () => {
    // Hooks
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useContext(AuthContext);

    // State
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [userEnrollmentCount, setUserEnrollmentCount] = useState(0);

    // Data fetching Dynamic Title useEffect
    useEffect(() => {
        const fetchCourseAndStatus = async () => {
            setLoading(true);
            document.title = "Course Details | Stride";

            try {
                // Load course from local JSON data
                const foundCourse = coursesData.find(c => c._id === id);
                
                if (!foundCourse) {
                    throw new Error('Course not found.');
                }

                // Map _id to id for consistency
                const mappedCourse = {
                    ...foundCourse,
                    id: foundCourse._id
                };

                setCourse(mappedCourse);
                document.title = `${mappedCourse.title} | Stride`;

                // Check enrollment status from localStorage
                if (user) {
                    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
                    const enrolled = enrolledCourses.includes(id);
                    setIsEnrolled(enrolled);

                    // Calculate user's enrollment count from localStorage
                    const userEnrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]');
                    setUserEnrollmentCount(userEnrollments.length);
                }
            } catch (err) {
                setError(err.message);
                toast.error("Could not load course data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndStatus();
    }, [id, user]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="alert alert-error max-w-md bg-red-900 border border-red-700 text-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Error: {error}</span>
                </div>
            </div>
        );
    }

    const seatsLeft = course?.seats - course?.enrollmentCount;
    const isEnrollmentLimitReached = !isEnrolled && userEnrollmentCount >= 3;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Header */}
                        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="badge badge-primary bg-indigo-500 text-white">{course?.category}</span>
                                <span className="badge badge-secondary bg-purple-500 text-white">{course?.level}</span>
                                <span className="badge badge-accent bg-cyan-500 text-white">{course?.language}</span>
                                {course?.featured && <span className="badge badge-warning">Featured</span>}
                                {course?.completion_certificate && <span className="badge badge-success">Certificate</span>}
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-4">{course?.title}</h1>
                            <p className="text-lg text-gray-300 mb-4">{course?.short_description}</p>

                            {/* Course Image */}
                            {course?.image && (
                                <div className="mb-6">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-64 object-cover rounded-lg shadow-md border border-gray-600"
                                    />
                                </div>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="rating rating-sm">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <input
                                            key={star}
                                            type="radio"
                                            name="rating"
                                            className="mask mask-star-2 bg-orange-400"
                                            checked={star <= (course?.rating || 0)}
                                            readOnly
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-400">
                                    {course?.rating || 0}/5 ({course?.reviews?.length || 0} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Detailed Description */}
                        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
                            <h2 className="text-2xl font-semibold mb-4 text-white">Course Description</h2>
                            <p className="text-gray-300 leading-relaxed">{course?.detailed_description}</p>
                        </div>

                        {/* Prerequisites */}
                        {course?.prerequisites && course.prerequisites.length > 0 && (
                            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
                                <h2 className="text-2xl font-semibold mb-4 text-white">Prerequisites</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {course.prerequisites.map((prerequisite, index) => (
                                        <li key={index} className="text-gray-300">{prerequisite}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Learning Outcomes */}
                        {course?.learning_outcomes && course.learning_outcomes.length > 0 && (
                            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
                                <h2 className="text-2xl font-semibold mb-4 text-white">What You'll Learn</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {course.learning_outcomes.map((outcome, index) => (
                                        <li key={index} className="text-gray-300">{outcome}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Curriculum */}
                        {course?.curriculum && course.curriculum.length > 0 && (
                            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
                                <h2 className="text-2xl font-semibold mb-4 text-white">Course Curriculum</h2>
                                <div className="space-y-3">
                                    {course.curriculum.map((item, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4 bg-gray-700 p-3 rounded-r-lg">
                                            <h3 className="font-medium text-white">{item.title || `Module ${index + 1}`}</h3>
                                            {item.description && (
                                                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                                            )}
                                            {item.duration && (
                                                <span className="text-xs text-blue-400">{item.duration}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructor Information */}
                        {course?.instructor && (
                            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
                                <h2 className="text-2xl font-semibold mb-4 text-white">Instructor</h2>
                                <div className="flex items-start gap-4">
                                    {course.instructor.avatar && (
                                        <img
                                            src={course.instructor.avatar}
                                            alt={course.instructor.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                                        />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-medium text-white">{course.instructor.name}</h3>
                                        {course.instructor.title && (
                                            <p className="text-gray-400">{course.instructor.title}</p>
                                        )}
                                        {course.instructor.bio && (
                                            <p className="text-sm text-gray-300 mt-2">{course.instructor.bio}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Course Info & Enrollment */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 sticky top-6">
                            {/* Price Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    {course?.discount_price && course.discount_price < course.price ? (
                                        <>
                                            <span className="text-3xl font-bold text-green-400">
                                                ${course.discount_price}
                                            </span>
                                            <span className="text-xl text-gray-500 line-through">
                                                ${course.price}
                                            </span>
                                            <span className="badge badge-error text-white">
                                                {Math.round(((course.price - course.discount_price) / course.price) * 100)}% OFF
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold text-blue-400">
                                            ${course?.price}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Course Stats */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Duration:</span>
                                    <span className="font-medium text-white">{course?.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Author:</span>
                                    <span className="font-medium text-white">{course?.author?.name || course?.instructor?.name || 'Not available'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Enrolled:</span>
                                    <span className="font-medium text-white">{course?.enrollmentCount} / {course?.seats}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Seats Left:</span>
                                    <span className={`font-medium ${seatsLeft <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                                        {seatsLeft > 0 ? seatsLeft : 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Language:</span>
                                    <span className="font-medium text-white">{course?.language}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Level:</span>
                                    <span className="font-medium text-white">{course?.level}</span>
                                </div>
                                {course?.completion_certificate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Certificate:</span>
                                        <span className="font-medium text-green-400">✓ Available</span>
                                    </div>
                                )}
                            </div>

                            {/* Enrollment Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Enrollment Progress</span>
                                    <span className="text-white">{Math.round((course?.enrollmentCount / course?.seats) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(course?.enrollmentCount / course?.seats) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Enrollment Button */}
                            <div className="space-y-3">
                                {seatsLeft <= 0 ? (
                                    <button className="btn btn-error btn-wide w-full border-none" disabled>
                                        No Seats Left
                                    </button>
                                ) : user?.email === course?.author?.email ? (
                                    <button className="btn btn-info btn-wide w-full border-none" disabled>
                                        This is Your Course
                                    </button>
                                ) : !user ? (
                                    <button
                                        onClick={() => navigate('/login', { state: { from: location }, replace: true })}
                                        className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none btn-wide w-full"
                                    >
                                        Login to Enroll
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/course/${id}/payment`)}
                                        className={`btn btn-wide w-full border-none ${isEnrolled ? 'bg-orange-600 hover:bg-orange-700 text-white' : (isEnrollmentLimitReached ? 'btn-disabled' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white')}`}
                                        disabled={isEnrollmentLimitReached}
                                    >
                                        {isEnrolled ? (
                                            '✓ Enrolled (Click to Un-enroll)'
                                        ) : isEnrollmentLimitReached ? (
                                            'Enrollment Limit Reached'
                                        ) : (
                                            'Enroll Now'
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Assessment Button */}
                            <div className="mt-4">
                                <button
                                    onClick={() => navigate(`/course/${id}/assessment`)}
                                    className="btn bg-green-600 hover:bg-green-700 text-white border-none btn-wide w-full"
                                >
                                    Take Assessment
                                </button>
                            </div>
                            {course?.tags && course.tags.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Tags:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {course.tags.map((tag, index) => (
                                            <span key={index} className="badge badge-outline text-xs border-gray-600 text-gray-300 hover:bg-gray-700">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Course Status */}
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`capitalize font-medium ${course?.status === 'active' ? 'text-green-400' : 'text-orange-400'
                                        }`}>
                                        {course?.status || 'active'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-400">Created:</span>
                                    <span className="font-medium text-white">
                                        {course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Courses Section */}
            <div className="border-t border-gray-800 pt-8">
                <RecommendedCourses 
                    scenario={course?.category?.toLowerCase().includes('python') || course?.category?.toLowerCase().includes('programming') ? 'python' : 'web-dev'}
                    title="Similar Courses"
                    description="Explore more courses in this category and level"
                />
            </div>
        </div>
    );
};

export default CourseDetails;
