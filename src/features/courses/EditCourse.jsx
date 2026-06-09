import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import toast from 'react-hot-toast';
import CourseContentEditor from './CourseContentEditor';
import CourseAssessmentEditor from './CourseAssessmentEditor';
import { FileText, Video, List, BookOpen, Settings, CheckSquare, Loader2, Upload } from 'lucide-react';
import { courseService } from '../../services/courseService';
import api from '../../services/api';

import { API_BASE_URL } from '../../utils/constants';

const transformEditorToViewer = (sections) => {
    return (sections || []).map(section => ({
        title: section.title,
        lessons: (section.contents || []).map(item => {
            const lesson = {
                id: item.id ? String(item.id) : `lesson-${Date.now()}-${Math.random()}`,
                title: item.title || item.question || 'Untitled Lesson',
                type: item.type === 'code' ? 'coding' : (item.type === 'text' ? 'article' : item.type),
                xp: item.type === 'quiz' ? 20 : (item.type === 'code' ? 30 : 10),
            };

            if (item.type === 'text') {
                lesson.content = item.content || '';
            } else if (item.type === 'video') {
                lesson.content = item.url || '';
                lesson.videoInputType = item.videoInputType || 'url';
                if (item.cloudinaryPublicId) lesson.cloudinaryPublicId = item.cloudinaryPublicId;
                if (item.originalFileName) lesson.originalFileName = item.originalFileName;
            } else if (item.type === 'document') {
                lesson.content = item.url || '';
                if (item.cloudinaryPublicId) lesson.cloudinaryPublicId = item.cloudinaryPublicId;
                if (item.originalFileName) lesson.originalFileName = item.originalFileName;
                if (item.fileFormat) lesson.fileFormat = item.fileFormat;
                if (item.fileSize) lesson.fileSize = item.fileSize;
            } else if (item.type === 'quiz') {
                const quizType = item.quizType || 'multiple-choice';
                lesson.questions = [{
                    id: `q-${lesson.id}`,
                    type: quizType === 'true-false' ? 'trueFalse' : 'mcq',
                    question: item.question || '',
                    options: quizType === 'true-false' ? ['True', 'False'] : (item.options || []),
                    correctAnswers: item.correctAnswers || [],
                    quizType: quizType
                }];
            } else if (item.type === 'code') {
                lesson.exercise = {
                    description: item.description || '',
                    starterCode: item.starterCode || '',
                    language: item.language || 'javascript'
                };
            }
            return lesson;
        })
    }));
};

const transformViewerToEditor = (sections) => {
    return (sections || []).map((section, sIdx) => ({
        id: section._id || section.id || `sec-${Date.now()}-${sIdx}`,
        title: section.title,
        description: section.description || '',
        contents: (section.lessons || []).map(lesson => {
            const item = {
                id: lesson.id,
                title: lesson.title,
                type: lesson.type === 'coding' ? 'code' : (lesson.type === 'article' ? 'text' : lesson.type),
            };

            if (lesson.type === 'article') {
                item.content = lesson.content || '';
            } else if (lesson.type === 'video') {
                item.videoInputType = lesson.videoInputType || 'url';
                item.url = lesson.content || '';
                if (lesson.cloudinaryPublicId) item.cloudinaryPublicId = lesson.cloudinaryPublicId;
                if (lesson.originalFileName) item.originalFileName = lesson.originalFileName;
            } else if (lesson.type === 'document') {
                item.url = lesson.content || '';
                if (lesson.cloudinaryPublicId) item.cloudinaryPublicId = lesson.cloudinaryPublicId;
                if (lesson.originalFileName) item.originalFileName = lesson.originalFileName;
                if (lesson.fileFormat) item.fileFormat = lesson.fileFormat;
                if (lesson.fileSize) item.fileSize = lesson.fileSize;
            } else if (lesson.type === 'quiz') {
                const q = lesson.questions?.[0] || {};
                item.quizType = q.quizType || (q.type === 'trueFalse' ? 'true-false' : 'multiple-choice');
                item.question = q.question || '';
                item.options = q.options || [];
                item.correctAnswers = q.correctAnswers || [];
            } else if (lesson.type === 'coding') {
                item.description = lesson.exercise?.description || '';
                item.starterCode = lesson.exercise?.starterCode || '';
                item.language = lesson.exercise?.language || 'javascript';
            }
            return item;
        })
    }));
};

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
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
    const [isSaving, setIsSaving] = useState(false);
    const [preAssessmentData, setPreAssessmentData] = useState({ topics: [] });
    const [finalAssessmentData, setFinalAssessmentData] = useState({ topics: [] });
    const [activeAssessmentTab, setActiveAssessmentTab] = useState('final-exam');

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchCourseAndContent = async () => {
            try {
                setLoading(true);
                
                // Fetch course details and content concurrently
                const [courseDataResult, courseContentResult, finalAssessmentResult, preAssessmentResult] = await Promise.all([
                    courseService.getCourseById(id),
                    courseService.getCourseContent(id).catch(err => {
                        console.warn("No course content found yet or failed to fetch:", err.message);
                        return null;
                    }),
                    courseService.getCourseAssessment(id, 'final-exam').catch(err => {
                        console.warn("No final assessment found yet or failed to fetch:", err.message);
                        return { topics: [] };
                    }),
                    courseService.getCourseAssessment(id, 'pre-assessment').catch(err => {
                        console.warn("No pre assessment found yet or failed to fetch:", err.message);
                        return { topics: [] };
                    })
                ]);

                if (!courseDataResult) {
                    toast.error('Course not found.');
                    setLoading(false);
                    return;
                }

                if (finalAssessmentResult && finalAssessmentResult.topics) {
                    setFinalAssessmentData(finalAssessmentResult);
                }
                if (preAssessmentResult && preAssessmentResult.topics) {
                    setPreAssessmentData(preAssessmentResult);
                }

                // Verify ownership: Instructors can only edit their own courses
                const isOwner = courseDataResult.instructorId 
                  ? courseDataResult.instructorId === (user?._id || user?.id)
                  : courseDataResult.instructor?.email === user?.email;

                if (user && user.role === 'instructor' && !isOwner) {
                    toast.error('Not authorized to edit this course.');
                    navigate('/manage-courses');
                    return;
                }

                const rawSections = courseContentResult?.sections || [];
                const editorSections = transformViewerToEditor(rawSections);

                setCourseData(prev => ({
                    ...prev,
                    ...courseDataResult,
                    prerequisites: courseDataResult.prerequisites?.length > 0 ? courseDataResult.prerequisites : [''],
                    learning_outcomes: courseDataResult.learning_outcomes?.length > 0 ? courseDataResult.learning_outcomes : [''],
                    content: editorSections.length > 0 ? editorSections : [{
                        id: Date.now(),
                        title: 'Introduction',
                        description: '',
                        contents: []
                    }],
                    instructor: {
                        ...prev.instructor,
                        ...courseDataResult.instructor
                    },
                    tags: courseDataResult.tags?.length > 0 ? courseDataResult.tags : [''],
                    status: courseDataResult.status || 'draft'
                }));
            } catch (err) {
                console.error("Failed to load course details:", err);
                toast.error('Failed to load course data.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchCourseAndContent();
        }
    }, [id, user, navigate]);

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

    const saveCourse = async (statusOverride) => {
        const topics = (courseData.content || []).map(section => section.title);

        const payload = {
            ...courseData,
            topics,
            ...(statusOverride ? { status: statusOverride } : {})
        };
        // Remove content and metadata/immutable fields from main course payload
        delete payload._id;
        delete payload.content;
        delete payload.createdAt;
        delete payload.updatedAt;
        delete payload.__v;

        let savedCourse;
        if (id) {
            savedCourse = await courseService.updateCourse(id, payload);
        } else {
            savedCourse = await courseService.createCourse(payload);
        }

        // Save sections content to the CourseContent collection
        const courseId = id || savedCourse?._id || savedCourse?.id;
        if (courseId) {
            if (courseData.content) {
                const transformedSections = transformEditorToViewer(courseData.content);
                await courseService.updateCourseContent(courseId, transformedSections).catch(err => {
                    console.error("Failed to save course content:", err);
                    toast.error("Basic info saved, but content failed to save.");
                });
            }
            const savePromises = [];
            if (preAssessmentData) {
                savePromises.push(
                    courseService.updateCourseAssessment(courseId, preAssessmentData, 'pre-assessment').catch(err => {
                        console.error("Failed to save pre-assessment:", err);
                        toast.error("Saved, but pre-assessment failed to save.");
                    })
                );
            }
            if (finalAssessmentData) {
                savePromises.push(
                    courseService.updateCourseAssessment(courseId, finalAssessmentData, 'final-exam').catch(err => {
                        console.error("Failed to save final assessment:", err);
                        toast.error("Saved, but final exam failed to save.");
                    })
                );
            }
            if (savePromises.length > 0) {
                await Promise.all(savePromises);
            }
        }
        return savedCourse;
    };

    const handleUpdateCourse = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsSaving(true);
        try {
            await saveCourse();
            toast.success(`Course ${id ? 'updated' : 'created'} successfully!`);
            navigate('/manage-courses');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'basic', name: 'Basic Info', icon: <FileText size={18} className="mr-2" /> },
        { id: 'content', name: 'Course Content', icon: <List size={18} className="mr-2" /> },
        { id: 'assessment', name: 'Assessment', icon: <CheckSquare size={18} className="mr-2" /> },
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
            case 'assessment':
                return (
                    <div className="bg-gray-700 p-6 rounded-lg space-y-6">
                        {/* Sub-tabs for Pre-Assessment vs Final Exam */}
                        <div className="flex border-b border-gray-600 pb-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setActiveAssessmentTab('pre-assessment')}
                                className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 mr-4 ${
                                    activeAssessmentTab === 'pre-assessment'
                                        ? 'border-teal-500 text-teal-400 font-bold'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Pre-Assessment
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveAssessmentTab('final-exam')}
                                className={`px-4 py-2 font-semibold text-sm transition-all border-b-2 ${
                                    activeAssessmentTab === 'final-exam'
                                        ? 'border-blue-500 text-cyan-400 font-bold'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Final Exam
                            </button>
                        </div>

                        {activeAssessmentTab === 'pre-assessment' ? (
                            <CourseAssessmentEditor 
                                assessmentData={preAssessmentData} 
                                onChange={setPreAssessmentData} 
                                type="pre-assessment"
                            />
                        ) : (
                            <CourseAssessmentEditor 
                                assessmentData={finalAssessmentData} 
                                onChange={setFinalAssessmentData} 
                                type="final-exam"
                            />
                        )}
                    </div>
                );
            case 'media': {
                const handleImageUpload = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (!file.type.startsWith('image/')) {
                        toast.error('Please select an image file.');
                        return;
                    }
                    setCourseData(prev => ({ ...prev, _imageUploading: true }));
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await api.post('/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        setCourseData(prev => ({
                            ...prev,
                            image: response.data.url,
                            _imageUploading: false,
                        }));
                        toast.success('Image uploaded!');
                    } catch (error) {
                        console.error('Image upload failed:', error);
                        toast.error(error.response?.data?.message || 'Failed to upload image.');
                        setCourseData(prev => ({ ...prev, _imageUploading: false }));
                    }
                };

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
                                        onChange={handleImageUpload}
                                        disabled={courseData._imageUploading}
                                    />
                                    <label
                                        htmlFor="course-image"
                                        className={`cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors inline-flex items-center gap-2 ${courseData._imageUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {courseData._imageUploading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                        ) : (
                                            <><Upload size={16} /> Upload Image</>
                                        )}
                                    </label>
                                    <p className="mt-1 text-sm text-gray-400">Recommended size: 1280x720px</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
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
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to discard your unsaved changes?")) {
                                        navigate(-1);
                                    }
                                }}
                                className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <div className="space-x-4">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    onClick={async () => {
                                        setIsSaving(true);
                                        try {
                                            await saveCourse('draft');
                                            toast.success('Course saved as draft successfully!');
                                            navigate('/manage-courses');
                                        } catch (error) {
                                            toast.error(error.response?.data?.message || error.message);
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                >
                                    {isSaving ? 'Saving...' : 'Save as Draft'}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    onClick={async () => {
                                        setIsSaving(true);
                                        try {
                                            const data = await saveCourse();
                                            toast.success('Course changes saved!');
                                            const courseId = id || data?._id || data?.id;
                                            if (courseId) {
                                                navigate(`/course/${courseId}`);
                                            }
                                        } catch (error) {
                                            toast.error(error.response?.data?.message || error.message);
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                >
                                    {isSaving ? 'Saving...' : 'Preview Course'}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                                    onClick={async () => {
                                        setIsSaving(true);
                                        try {
                                            await saveCourse('published');
                                            toast.success('Course published successfully!');
                                            navigate('/manage-courses');
                                        } catch (error) {
                                            toast.error(error.response?.data?.message || error.message);
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                >
                                    {isSaving ? 'Saving...' : 'Publish Course'}
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