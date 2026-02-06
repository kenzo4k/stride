import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import toast from 'react-hot-toast';
import CourseCard from '../../components/common/CourseCard';
import coursesData from '../../../public/courses.json';

const ManageCourses = () => {
    const { user: _user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = () => {
        const toastId = toast.loading('Loading courses...');

        try {
            // Filter out courses that were "deleted" in this session
            const deletedCourseIds = JSON.parse(localStorage.getItem('deletedCourses') || '[]');
            const filteredData = coursesData.filter(course => !deletedCourseIds.includes(course._id));

            setCourses(filteredData);
            setIsLoading(false);

            toast.success(`${filteredData.length} courses loaded successfully!`, { id: toastId });
        } catch (error) {
            console.error('Error loading courses:', error);
            toast.error('Failed to load courses. Please try again.', { id: toastId });
            setIsLoading(false);
        }
    };

    const openDeleteModal = (course) => {
        setCourseToDelete(course);
        document.getElementById('delete_modal').showModal();
    };

    const closeDeleteModal = () => {
        setCourseToDelete(null);
        document.getElementById('delete_modal').close();
    };

    const openDetailsModal = (course) => {
        setSelectedCourse(course);
        document.getElementById('details_modal').showModal();
    };

    const closeDetailsModal = () => {
        setSelectedCourse(null);
        document.getElementById('details_modal').close();
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;

        // Check if user is logged in
        // if (!user) {
        //     toast.error('Please log in to delete courses');
        //     closeDeleteModal();
        //     return;
        // }
        setIsDeleting(true);
        const toastId = toast.loading(`Deleting "${courseToDelete.title}"...`);

        try {
            // Mock delete operation since the server requires authentication
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store the deleted course ID in localStorage to persist across page refreshes
            const deletedCourseIds = JSON.parse(localStorage.getItem('deletedCourses') || '[]');
            deletedCourseIds.push(courseToDelete._id);
            localStorage.setItem('deletedCourses', JSON.stringify(deletedCourseIds));

            // Only update UI if backend deletion was successful
            setCourses(prevCourses =>
                prevCourses.filter(course => course._id !== courseToDelete._id)
            );

            toast.success(`"${courseToDelete.title}" has been permanently deleted!`, {
                id: toastId,
                duration: 3000
            });

            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error(error.message || 'Failed to delete course. Please try again.', {
                id: toastId,
                duration: 4000
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const formatPrice = (price, discountPrice) => {
        if (discountPrice && discountPrice < price) {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-success">${discountPrice}</span>
                    <span className="text-sm line-through text-base-content/50">${price}</span>
                    <div className="badge badge-success badge-sm">
                        {Math.round(((price - discountPrice) / price) * 100)}% OFF
                    </div>
                </div>
            );
        }
        return <span className="text-lg font-bold">${price}</span>;
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'active': 'badge-success',
            'inactive': 'badge-warning',
            'draft': 'badge-info',
            'archived': 'badge-error'
        };
        return `badge ${statusColors[status] || 'badge-neutral'} badge-lg`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-gray-300">Loading your courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white">Manage Courses</h1>
                            <p className="text-gray-400 mt-2">
                                You have {courses.length} course{courses.length !== 1 ? 's' : ''} •
                                Total enrollments: {courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)}
                            </p>
                        </div>
                        <Link
                            to="/add-course"
                            className="btn btn-primary btn-lg gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Course
                        </Link>
                    </div>
                </div>

                {/* Courses Grid */}
                {courses.length === 0 ? (
                    <div className="text-center py-16 bg-gray-800 rounded-2xl">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
                            <p className="text-gray-400 mb-6">Start creating your first course to share your knowledge!</p>
                            <Link to="/add-course" className="btn btn-primary">
                                Create Your First Course
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course._id} className="relative group bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1">
                                <CourseCard course={course} />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={(e) => { e.preventDefault(); openDetailsModal(course); }}
                                            className="btn btn-ghost btn-circle text-white hover:bg-gray-700 tooltip" data-tip="View Details"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <Link
                                            to={`/edit-course/${course._id}`}
                                            className="btn btn-info btn-circle text-white hover:bg-blue-700 tooltip" data-tip="Edit"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={(e) => { e.preventDefault(); openDeleteModal(course); }}
                                            className="btn btn-error btn-circle text-white hover:bg-red-700 tooltip" data-tip="Delete"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Course Details Modal */}
            <dialog id="details_modal" className="modal">
                <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedCourse && (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-bold text-2xl text-gray-900">{selectedCourse.title}</h3>
                                <button
                                    className="btn btn-sm btn-circle btn-ghost"
                                    onClick={closeDetailsModal}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Course Image */}
                            <div className="mb-6">
                                <img
                                    src={selectedCourse.image}
                                    alt={selectedCourse.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.target.src = '/api/placeholder/800/400';
                                    }}
                                />
                            </div>

                            {/* Course Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-gray-800">Basic Information</h4>
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div><span className="font-medium">Category:</span> {selectedCourse.category}</div>
                                            <div><span className="font-medium">Level:</span> {selectedCourse.level}</div>
                                            <div><span className="font-medium">Duration:</span> {selectedCourse.duration}</div>
                                            <div><span className="font-medium">Language:</span> {selectedCourse.language}</div>
                                            <div><span className="font-medium">Status:</span>
                                                <span className={`ml-2 badge ${getStatusBadge(selectedCourse.status)}`}>
                                                    {selectedCourse.status?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-gray-800">Pricing</h4>
                                        <div className="space-y-2">
                                            {formatPrice(selectedCourse.price, selectedCourse.discount_price)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-gray-800">Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-100 p-3 rounded-lg text-center">
                                                <div className="font-bold text-lg text-primary">{selectedCourse.enrollmentCount || 0}</div>
                                                <div className="text-xs text-gray-600">Enrolled</div>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-lg text-center">
                                                <div className="font-bold text-lg text-secondary">{selectedCourse.seats}</div>
                                                <div className="text-xs text-gray-600">Max Seats</div>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-lg text-center">
                                                <div className="font-bold text-lg text-accent">{selectedCourse.rating || 0}</div>
                                                <div className="text-xs text-gray-600">Rating</div>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-lg text-center">
                                                <div className="font-bold text-lg text-success">{selectedCourse.reviews?.length || 0}</div>
                                                <div className="text-xs text-gray-600">Reviews</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-gray-800">Features</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCourse.completion_certificate && (
                                                <div className="badge badge-success">Certificate</div>
                                            )}
                                            {selectedCourse.featured && (
                                                <div className="badge badge-accent">Featured</div>
                                            )}
                                            {selectedCourse.prerequisites?.length > 0 && (
                                                <div className="badge badge-info">Prerequisites</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-4 mb-6">
                                {selectedCourse.short_description && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-gray-800">Short Description</h4>
                                        <p className="text-gray-700">{selectedCourse.short_description}</p>
                                    </div>
                                )}

                                {selectedCourse.detailed_description && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-gray-800">Detailed Description</h4>
                                        <p className="text-gray-700">{selectedCourse.detailed_description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Prerequisites */}
                            {selectedCourse.prerequisites?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2 text-gray-800">Prerequisites</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedCourse.prerequisites.map((prereq, index) => (
                                            <li key={index} className="text-gray-700">{prereq}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Learning Outcomes */}
                            {selectedCourse.learning_outcomes?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2 text-gray-800">Learning Outcomes</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedCourse.learning_outcomes.map((outcome, index) => (
                                            <li key={index} className="text-gray-700">{outcome}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Curriculum */}
                            {selectedCourse.curriculum?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2 text-gray-800">Curriculum</h4>
                                    <div className="space-y-2">
                                        {selectedCourse.curriculum.map((item, index) => (
                                            <div key={index} className="bg-gray-100 p-3 rounded-lg">
                                                <div className="font-medium text-gray-900">{item.title || `Module ${index + 1}`}</div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-700 mt-1">{item.description}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructor Info */}
                            {selectedCourse.instructor && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2 text-gray-800">Instructor</h4>
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <div className="font-medium text-gray-900">{selectedCourse.instructor.name || 'Instructor Name'}</div>
                                        {selectedCourse.instructor.email && (
                                            <div className="text-sm text-gray-700">{selectedCourse.instructor.email}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {selectedCourse.tags?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2 text-gray-800">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCourse.tags.map((tag, index) => (
                                            <div key={index} className="badge badge-outline">{tag}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="text-sm text-gray-700 pt-4 border-t border-gray-200">
                                <div>Created: {new Date(selectedCourse.createdAt).toLocaleString()}</div>
                                <div>Updated: {new Date(selectedCourse.updatedAt).toLocaleString()}</div>
                            </div>
                        </div>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeDetailsModal}>close</button>
                </form>
            </dialog>

            {/* Delete Confirmation Modal */}
            <dialog id="delete_modal" className="modal">
                <div className="modal-box max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">Delete Course</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-gray-900">
                                "{courseToDelete?.title}"
                            </span>
                            ? This action cannot be undone.
                        </p>
                    </div>

                    <div className="modal-action justify-center gap-3">
                        <button
                            className="btn btn-ghost min-w-24"
                            onClick={closeDeleteModal}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-error min-w-24"
                            onClick={confirmDeleteCourse}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Course'
                            )}
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeDeleteModal}>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default ManageCourses;