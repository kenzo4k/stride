import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CourseContentEditor from './CourseContentEditor';
import { FileText, Video, List, BookOpen, Settings } from 'lucide-react';
import coursesData from '../../../public/courses.json';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('basic');
    const [courseData, setCourseData] = useState({
        title: '',
        short_description: '',
        detailed_description: '',
        image: '',
        duration: '',
        seats: '',
        price: '',
        discount_price: '',
        category: '',
        level: 'Beginner',
        language: 'English',
        prerequisites: [''],
        learning_outcomes: [''],
        content: [{
            id: Date.now(),
            title: 'Introduction',
            description: '',
            contents: []
        }],
        instructor: {
            name: '',
            email: '',
            bio: ''
        },
        tags: [''],
        featured: false,
        status: 'draft',
        completion_certificate: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            const data = coursesData.find(course => course._id === id);

            if (!data) {
                toast.error('Course not found.');
                setLoading(false);
                return;
            }

            setCourseData(prev => ({
                ...prev,
                ...data,
                prerequisites: data.prerequisites?.length > 0 ? data.prerequisites : [''],
                learning_outcomes: data.learning_outcomes?.length > 0 ? data.learning_outcomes : [''],
                content: data.content?.length > 0 ? data.content : [{
                    id: Date.now(),
                    title: 'Introduction',
                    description: '',
                    contents: []
                }],
                instructor: {
                    ...prev.instructor,
                    ...data.instructor
                },
                tags: data.tags?.length > 0 ? data.tags : [''],
                status: data.status || 'draft'
            }));
        } catch {
            toast.error('Failed to load course data.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    const handleContentChange = (updatedContent) => {
        setCourseData(prev => ({
            ...prev,
            content: updatedContent
        }));
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access-token');
            const response = await fetch(`https://course-management-system-server-woad.vercel.app/api/courses/${id || ''}`, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                toast.success(`Course ${id ? 'updated' : 'created'} successfully!`);
                navigate('/instructor/courses');
            } else {
                throw new Error('Failed to save course');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const tabs = [
        { id: 'basic', name: 'Basic Info', icon: <FileText size={18} className="mr-2" /> },
        { id: 'content', name: 'Course Content', icon: <List size={18} className="mr-2" /> },
        { id: 'media', name: 'Media', icon: <Video size={18} className="mr-2" /> },
        { id: 'settings', name: 'Settings', icon: <Settings size={18} className="mr-2" /> }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Course Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={courseData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="Course title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={courseData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="Category"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={courseData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="e.g., 8 weeks"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Seats</label>
                                <input
                                    type="number"
                                    name="seats"
                                    value={courseData.seats}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="Available seats"
                                    min="0"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                            <textarea
                                name="short_description"
                                value={courseData.short_description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                placeholder="Brief description that appears in course cards"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Description</label>
                            <textarea
                                name="detailed_description"
                                value={courseData.detailed_description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-40"
                                placeholder="Detailed course description"
                            />
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div className="bg-gray-700 p-6 rounded-lg">
                        <CourseContentEditor 
                            content={courseData.content || []} 
                            onChange={handleContentChange} 
                        />
                    </div>
                );
            case 'media':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Course Image</label>
                            <div className="mt-1 flex items-center">
                                <div className="h-32 w-32 rounded-lg overflow-hidden bg-gray-700 border border-gray-600 flex items-center justify-center">
                                    {courseData.image ? (
                                        <img src={courseData.image} alt="Course" className="h-full w-full object-cover" />
                                    ) : (
                                        <BookOpen className="h-16 w-16 text-gray-500" />
                                    )}
                                </div>
                                <div className="ml-4">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="course-image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setCourseData(prev => ({
                                                        ...prev,
                                                        image: reader.result
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="course-image"
                                        className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                                    >
                                        Upload Image
                                    </label>
                                    <p className="mt-1 text-sm text-gray-400">Recommended size: 1280x720px</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Course Level</label>
                                <select
                                    name="level"
                                    value={courseData.level}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                                <input
                                    type="text"
                                    name="language"
                                    value={courseData.language}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="e.g., English"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={courseData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="e.g., 199.99"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Discount Price ($)</label>
                                <input
                                    type="number"
                                    name="discount_price"
                                    value={courseData.discount_price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="e.g., 149.99"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="featured"
                                name="featured"
                                checked={courseData.featured}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                            />
                            <label htmlFor="featured" className="ml-2 block text-sm text-gray-300">
                                Featured Course
                            </label>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <select
                                name="status"
                                value={courseData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-300">Loading course data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 border-b border-gray-600">
                        <h1 className="text-3xl font-bold text-white flex items-center">
                            <BookOpen className="w-8 h-8 mr-3" />
                            {id ? 'Edit Course' : 'Create New Course'}
                        </h1>
                        <p className="text-gray-200 mt-2">Update your course information and content</p>
                    </div>

                    <form onSubmit={handleUpdateCourse} className="p-8">
                        {/* Tabs */}
                        <div className="border-b border-gray-700 mb-8">
                            <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-400'
                                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="mb-8">
                            {renderTabContent()}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between pt-6 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <div className="space-x-4">
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    onClick={() => {
                                        setCourseData(prev => ({
                                            ...prev,
                                            status: 'draft'
                                        }));
                                        handleUpdateCourse({ preventDefault: () => {} });
                                    }}
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                                    onClick={() => {
                                        setCourseData(prev => ({
                                            ...prev,
                                            status: 'published'
                                        }));
                                        handleUpdateCourse({ preventDefault: () => {} });
                                    }}
                                >
                                    Publish Course
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCourse;