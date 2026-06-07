import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { 
    FaPlay, FaCheckCircle, FaLock, FaFilePdf, FaBook, 
    FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight,
    FaClock, FaTrophy, FaLayerGroup, FaHome, FaBars, FaTimes
} from 'react-icons/fa';
import { BsFileText } from 'react-icons/bs';
import { RiQuestionAnswerFill } from 'react-icons/ri';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import toast from 'react-hot-toast';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import QuizEditor from '../../components/forms/QuizEditor';
import CodingExerciseEditor from '../../components/forms/CodingExerciseEditor';
import ProgressBar from '../../components/common/ProgressBar';
import XPCounter from '../../components/common/XPCounter';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import api from '../../services/api';
import { courseService } from '../../services/courseService';

const CourseContent = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const { user, refreshUser } = useContext(AuthContext);

    // State
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [earnedXP, setEarnedXP] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [checkedQuestions, setCheckedQuestions] = useState({});
    const [expandedSections, setExpandedSections] = useState(new Set([1])); // First section expanded by default
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [enrollmentId, setEnrollmentId] = useState(null);

    // Fetch course data and check enrollment status

    // State for expanded sections
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    // Find adjacent lessons for navigation
    const { prevLesson, nextLesson } = useMemo(() => {
        if (!course || !activeLesson) return { prevLesson: null, nextLesson: null };

        const allLessons = course.sections.flatMap(s => s.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);

        return {
            prevLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
            nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
        };
    }, [course, activeLesson]);

    const currentSection = useMemo(() => {
        return course?.sections?.find(s =>
            s.lessons?.some(l => l.id === activeLesson?.id)
        );
    }, [course, activeLesson]);

    useEffect(() => {
        if (!user?.email) return;
        setLoading(true);
        document.title = "Course Details | Stride";

        const fetchContent = async () => {
            try {
                // Fetch course details, content, and user enrollment in parallel
                const [courseRes, contentRes, enrollmentsRes] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/courses/${courseId}/content`),
                    api.get(`/my-enrollments?email=${user.email}`)
                ]);

                const fetchedCourse = courseRes.data;
                const fetchedContent = contentRes.data;
                
                // Merge content sections into course object for UI compatibility
                const combinedCourse = {
                    ...fetchedCourse,
                    sections: fetchedContent.sections || []
                };
                
                setCourse(combinedCourse);

                const enrollment = enrollmentsRes.data.find(e => {
                    // Handle both populated course and unpopulated course ID
                    const eCourseId = e.courseId._id || e.courseId;
                    return eCourseId === courseId;
                });

                if (enrollment) {
                    setIsEnrolled(true);
                    setEnrollmentId(enrollment._id);
                    if (enrollment.completedLessons) {
                        setCompletedLessons(new Set(enrollment.completedLessons));
                    }
                }

                // Set first lesson as active by default
                if (combinedCourse?.sections?.[0]?.lessons?.[0]) {
                    setActiveLesson(combinedCourse.sections[0].lessons[0]);
                }

                // Expand the first section by default
                if (combinedCourse?.sections?.[0]) {
                    const firstSectionId = combinedCourse.sections[0].id || combinedCourse.sections[0]._id || 'section-0';
                    setExpandedSections(new Set([firstSectionId]));
                }
            } catch (err) {
                console.error("Failed to load content", err);
                setError('An error occurred while loading the course content');
                toast.error('Failed to load course content');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [courseId, user]);

    // Reset quiz state when lesson changes
    useEffect(() => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setCheckedQuestions({});
    }, [activeLesson?.id]);

    // Record when a lesson is started (for ML dropout tracking)
    useEffect(() => {
        if (!user || user.role !== 'student' || !courseId || !activeLesson?.id) return;
        courseService.recordLessonStarted(courseId)
            .catch(err => console.error('Failed to record lesson start:', err));
    }, [activeLesson?.id, courseId, user]);

    // Study session time tracking (for ML dropout tracking)
    useEffect(() => {
        if (!user || user.role !== 'student' || !courseId) return;

        let activeSeconds = 0;
        let isWindowActive = true;

        const handleFocus = () => { isWindowActive = true; };
        const handleBlur = () => { isWindowActive = false; };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        const interval = setInterval(() => {
            if (isWindowActive) {
                activeSeconds += 5; // increment every 5 seconds
                
                // When we accumulate 60 active seconds, send 1 minute to the server
                if (activeSeconds >= 60) {
                    const durationMinutes = activeSeconds / 60;
                    activeSeconds = 0; // reset
                    
                    courseService.recordSessionTime(courseId, durationMinutes)
                        .catch(err => console.error('Failed to record session time:', err));
                }
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            
            // On unmount, send remaining active seconds
            if (activeSeconds > 0) {
                const durationMinutes = activeSeconds / 60;
                courseService.recordSessionTime(courseId, durationMinutes)
                    .catch(err => console.error('Failed to record unmount session time:', err));
            }
        };
    }, [courseId, user]);

    // Handle lesson completion
    const markLessonComplete = async (lessonId) => {
        setCompletedLessons(prev => {
            const newSet = new Set(prev);
            newSet.add(lessonId);
            
            // Calculate new progress
            const totalLessons = course.sections.reduce(
                (total, section) => total + (section.lessons?.length || 0), 0
            );
            const newProgress = totalLessons === 0 ? 0 : Math.round((newSet.size / totalLessons) * 100);

            // Save to backend
            if (enrollmentId) {
                api.patch(`/enrollments/${enrollmentId}/progress`, {
                    completedLessons: Array.from(newSet),
                    progress: newProgress
                }).catch(console.error);
            }

            return newSet;
        });

        // Add XP for completed lesson
        const lesson = course?.sections?.flatMap(s => s.lessons)?.find(l => l.id === lessonId);
        if (lesson && lesson.xp) {
            setEarnedXP(prevXP => prevXP + lesson.xp);
            api.post('/users/award-xp', { amount: lesson.xp, reason: `Completed lesson: ${lesson.title}` })
                .then(() => {
                    if (refreshUser) refreshUser();
                })
                .catch(console.error);
        }
    };

    // Handle quiz answer
    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    // Check current question answer
    const checkCurrentAnswer = (question) => {
        if (answers[question.id] === undefined) return;

        let isCorrect = false;
        if (question.type === 'mcq') {
            isCorrect = question.correctAnswers?.includes(answers[question.id]);
        } else if (question.type === 'trueFalse') {
            isCorrect = answers[question.id] === (question.correctAnswers?.[0] === 0);
        } else if (question.type === 'fillInBlank') {
            const studentAns = String(answers[question.id]).trim().toLowerCase();
            const correctAns = String(question.correctAnswer || question.answer || '').trim().toLowerCase();
            isCorrect = studentAns === correctAns;
        } else {
            isCorrect = true; // Fallback
        }

        setCheckedQuestions(prev => ({
            ...prev,
            [question.id]: {
                checked: true,
                isCorrect
            }
        }));

        if (isCorrect) {
            toast.success("Correct answer!");
        } else {
            toast.error("Incorrect answer. Check the correct option below.");
        }
    };

    // Calculate course progress
    const calculateProgress = () => {
        if (!course || !course.sections) return 0;

        const totalLessons = course.sections.reduce(
            (total, section) => total + (section.lessons?.length || 0), 0
        );

        if (totalLessons === 0) return 0;
        return Math.round((completedLessons.size / totalLessons) * 100);
    };

    const goToLesson = (lesson) => {
        if (lesson) {
            setActiveLesson(lesson);
            setPageNumber(1);
            // Scroll to top of content
            const contentArea = document.querySelector('main');
            if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const progress = calculateProgress();
    const totalLessons = course?.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0);

    // Render different content based on lesson type
    const renderLessonContent = () => {
        if (!activeLesson) return null;

        // Display only exercises or content without any editor or code execution
        switch (activeLesson.type) {
            case 'video':
                return (
                    <Motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-700 flex items-center justify-center">
                            {(activeLesson.videoInputType === 'file' || activeLesson.content?.includes('cloudinary.com') || activeLesson.content?.match(/\.(mp4|webm|ogg|mov)($|\?)/i)) ? (
                                <video
                                    key={activeLesson.content}
                                    src={activeLesson.content}
                                    className="w-full h-full object-contain"
                                    controls
                                    playsInline
                                    controlsList="nodownload"
                                    onEnded={() => markLessonComplete(activeLesson.id)}
                                />
                            ) : (
                                <ReactPlayer
                                    key={activeLesson.content}
                                    url={activeLesson.content}
                                    width="100%"
                                    height="100%"
                                    controls
                                    playsinline
                                    config={{
                                        file: {
                                            attributes: {
                                                crossOrigin: "anonymous",
                                                controlsList: "nodownload"
                                            }
                                        }
                                    }}
                                    onEnded={() => markLessonComplete(activeLesson.id)}
                                />
                            )}
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-500/20 rounded-lg">
                                    <FaPlay className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 font-medium">Video Lesson</p>
                                    <h4 className="font-bold">{activeLesson.title}</h4>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Rewards</p>
                                    <p className="text-yellow-400 font-bold">+{activeLesson.xp} XP</p>
                                </div>
                            </div>
                        </div>
                    </Motion.div>
                );
            case 'article':
                return (
                    <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-invert max-w-none"
                    >
                        <div className="mb-8 p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-500/20">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-green-500/20 rounded-lg">
                                    <BsFileText className="text-green-400 text-xl" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Reading Material</span>
                                    <h2 className="text-2xl font-bold m-0">{activeLesson.title}</h2>
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-400 space-x-4">
                                <span className="flex items-center"><FaClock className="mr-2" /> 10 min read</span>
                                <span className="flex items-center text-yellow-400"><FaTrophy className="mr-2" /> {activeLesson.xp} XP</span>
                            </div>
                        </div>
                        
                        <div className="px-2" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                        
                        <div className="mt-12 p-8 bg-gray-800/50 rounded-2xl border border-gray-700 text-center">
                            <h4 className="text-xl font-bold mb-4">Finished reading?</h4>
                            <p className="text-gray-400 mb-6">Mark this lesson as complete to earn your XP and move forward.</p>
                            <button
                                onClick={() => {
                                    markLessonComplete(activeLesson.id);
                                    toast.success('Lesson completed!');
                                }}
                                className={`btn btn-lg ${completedLessons.has(activeLesson.id) ? 'btn-disabled bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white border-none px-12 rounded-full transition-all hover:scale-105 shadow-lg shadow-green-900/20`}
                            >
                                {completedLessons.has(activeLesson.id) ? (
                                    <><FaCheckCircle className="mr-2" /> Completed</>
                                ) : (
                                    'Mark as Complete'
                                )}
                            </button>
                        </div>
                    </Motion.div>
                );
            case 'pdf':
                return (
                    <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col space-y-4"
                    >
                        <div className="flex items-center justify-between p-4 bg-red-900/10 rounded-xl border border-red-500/20">
                            <div className="flex items-center space-x-3">
                                <FaFilePdf className="text-red-500 text-2xl" />
                                <div>
                                    <h3 className="font-bold">{activeLesson.title}</h3>
                                    <p className="text-xs text-gray-400">PDF Document • {numPages || '--'} pages</p>
                                </div>
                            </div>
                            <a
                                href={activeLesson.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none rounded-lg"
                            >
                                <FaFilePdf className="mr-2" /> Download
                            </a>
                        </div>

                        <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 min-h-[600px] flex flex-col items-center">
                            <div className="p-4 w-full flex justify-center bg-gray-800 border-b border-gray-700 space-x-4">
                                <button
                                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                    disabled={pageNumber <= 1}
                                    className="btn btn-circle btn-sm bg-gray-700 hover:bg-gray-600 border-none disabled:opacity-30"
                                >
                                    <FaChevronLeft />
                                </button>
                                <div className="flex items-center px-4 bg-gray-900 rounded-lg text-sm font-medium">
                                    Page {pageNumber} of {numPages || '--'}
                                </div>
                                <button
                                    onClick={() => setPageNumber(prev => Math.min(prev + 1, (numPages || 1)))}
                                    disabled={pageNumber >= (numPages || 1)}
                                    className="btn btn-circle btn-sm bg-gray-700 hover:bg-gray-600 border-none disabled:opacity-30"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto w-full p-4 flex justify-center bg-gray-900/50">
                                <Document
                                    file={activeLesson.content}
                                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                    className="shadow-2xl"
                                    loading={
                                        <div className="flex flex-col items-center justify-center p-20">
                                            <div className="loading loading-spinner loading-md text-red-500 mb-4"></div>
                                            <p className="text-gray-400">Loading PDF document...</p>
                                        </div>
                                    }
                                >
                                    <Page pageNumber={pageNumber} width={700} />
                                </Document>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                markLessonComplete(activeLesson.id);
                                toast.success('XP Earned!');
                            }}
                            className={`btn w-full ${completedLessons.has(activeLesson.id) ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white border-none h-14 rounded-xl font-bold`}
                        >
                            {completedLessons.has(activeLesson.id) ? 'Document Read' : `Complete Document & Earn ${activeLesson.xp} XP`}
                        </button>
                    </Motion.div>
                );
            case 'quiz': {
                const currentQuestion = activeLesson.questions?.[currentQuestionIndex];
                if (!currentQuestion) return null;
                const quizProgress = ((currentQuestionIndex + 1) / activeLesson.questions.length) * 100;
                
                return (
                    <Motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-4"
                    >
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
                                <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-black uppercase tracking-widest border border-yellow-500/20">
                                    {activeLesson.xp} XP Reward
                                </span>
                            </div>
                            <p className="text-gray-400">Answer all questions to complete the lesson.</p>
                        </div>
                        
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-tighter">
                                    Question {currentQuestionIndex + 1} of {activeLesson.questions?.length}
                                </span>
                                <span className="text-xs font-bold text-gray-500">
                                    {Math.round(quizProgress)}% Complete
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                <Motion.div 
                                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${quizProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="px-3 py-1 bg-gray-900 text-gray-400 rounded-lg text-xs font-medium border border-gray-700">
                                    {currentQuestion.type === 'mcq' && 'Multiple Choice'}
                                    {currentQuestion.type === 'fillInBlank' && 'Fill in the Blank'}
                                    {currentQuestion.type === 'trueFalse' && 'True/False'}
                                    {currentQuestion.type === 'matching' && 'Matching'}
                                </span>
                            </div>

                            <div className="min-h-[250px] flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    <Motion.div
                                        key={currentQuestion.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <h3 className="text-xl font-bold mb-8 leading-relaxed">
                                            {currentQuestion.question}
                                        </h3>

                                        {currentQuestion.type === 'mcq' && (
                                            <div className="grid grid-cols-1 gap-3">
                                                {currentQuestion.options.map((option, idx) => {
                                                    const isSelected = answers[currentQuestion.id] === idx;
                                                    const isQuestionChecked = checkedQuestions[currentQuestion.id]?.checked;
                                                    const isQuestionCorrect = checkedQuestions[currentQuestion.id]?.isCorrect;
                                                    const isCorrectOption = currentQuestion.correctAnswers?.includes(idx);

                                                    let borderClass = 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50';
                                                    if (isQuestionChecked) {
                                                        if (isSelected) {
                                                            borderClass = isQuestionCorrect 
                                                                ? 'border-green-500 bg-green-500/10 text-green-400 cursor-not-allowed'
                                                                : 'border-red-500 bg-red-500/10 text-red-400 cursor-not-allowed';
                                                        } else if (isCorrectOption) {
                                                            borderClass = 'border-green-500 bg-green-500/5 text-green-400 cursor-not-allowed';
                                                        } else {
                                                            borderClass = 'border-gray-800 opacity-40 cursor-not-allowed';
                                                        }
                                                    } else if (isSelected) {
                                                        borderClass = 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-900/10';
                                                    }

                                                    return (
                                                        <label 
                                                            key={idx} 
                                                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${borderClass}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${currentQuestion.id}`}
                                                                value={idx}
                                                                checked={isSelected}
                                                                disabled={isQuestionChecked}
                                                                onChange={(e) => handleAnswer(currentQuestion.id, parseInt(e.target.value))}
                                                                className="radio radio-primary border-gray-600 disabled:opacity-50"
                                                            />
                                                            <span className="ml-4 font-medium">{option}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {currentQuestion.type === 'fillInBlank' && (
                                            <div className="max-w-md">
                                                <input
                                                    type="text"
                                                    placeholder="Type your answer here..."
                                                    value={answers[currentQuestion.id] || ''}
                                                    disabled={checkedQuestions[currentQuestion.id]?.checked}
                                                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                                    className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-all font-medium disabled:opacity-50"
                                                />
                                            </div>
                                        )}

                                        {currentQuestion.type === 'trueFalse' && (
                                            <div className="flex gap-4 max-w-md">
                                                {(() => {
                                                    const isSelected = answers[currentQuestion.id] === true;
                                                    const isQuestionChecked = checkedQuestions[currentQuestion.id]?.checked;
                                                    const isQuestionCorrect = checkedQuestions[currentQuestion.id]?.isCorrect;
                                                    const isCorrectOption = currentQuestion.correctAnswers?.[0] === 0;

                                                    let btnClass = 'bg-gray-900 border-gray-700 text-gray-400 hover:border-green-600/50';
                                                    if (isQuestionChecked) {
                                                        if (isSelected) {
                                                            btnClass = isQuestionCorrect
                                                                ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-900/20 cursor-not-allowed'
                                                                : 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/20 cursor-not-allowed';
                                                        } else if (isCorrectOption) {
                                                            btnClass = 'bg-green-900/20 border-green-500 text-green-400 cursor-not-allowed';
                                                        } else {
                                                            btnClass = 'bg-gray-950 border-gray-800 text-gray-600 opacity-40 cursor-not-allowed';
                                                        }
                                                    } else if (isSelected) {
                                                        btnClass = 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-900/20';
                                                    }

                                                    return (
                                                        <button
                                                            disabled={isQuestionChecked}
                                                            onClick={() => handleAnswer(currentQuestion.id, true)}
                                                            className={`flex-1 p-6 rounded-2xl font-bold transition-all border-2 ${btnClass}`}
                                                        >
                                                            True
                                                        </button>
                                                    );
                                                })()}

                                                {(() => {
                                                    const isSelected = answers[currentQuestion.id] === false;
                                                    const isQuestionChecked = checkedQuestions[currentQuestion.id]?.checked;
                                                    const isQuestionCorrect = checkedQuestions[currentQuestion.id]?.isCorrect;
                                                    const isCorrectOption = currentQuestion.correctAnswers?.[0] === 1;

                                                    let btnClass = 'bg-gray-900 border-gray-700 text-gray-400 hover:border-red-600/50';
                                                    if (isQuestionChecked) {
                                                        if (isSelected) {
                                                            btnClass = isQuestionCorrect
                                                                ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-900/20 cursor-not-allowed'
                                                                : 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/20 cursor-not-allowed';
                                                        } else if (isCorrectOption) {
                                                            btnClass = 'bg-green-900/20 border-green-500 text-green-400 cursor-not-allowed';
                                                        } else {
                                                            btnClass = 'bg-gray-950 border-gray-800 text-gray-600 opacity-40 cursor-not-allowed';
                                                        }
                                                    } else if (isSelected) {
                                                        btnClass = 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/20';
                                                    }

                                                    return (
                                                        <button
                                                            disabled={isQuestionChecked}
                                                            onClick={() => handleAnswer(currentQuestion.id, false)}
                                                            className={`flex-1 p-6 rounded-2xl font-bold transition-all border-2 ${btnClass}`}
                                                        >
                                                            False
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {currentQuestion.type === 'matching' && (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2 mb-4">Concepts</h4>
                                                        {currentQuestion.pairs.map((pair, idx) => (
                                                            <div key={idx} className="p-4 bg-gray-900/50 rounded-xl border border-gray-700 font-medium">
                                                                {pair.left}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2 mb-4">Definitions</h4>
                                                        {currentQuestion.pairs.map((pair, idx) => (
                                                            <div key={idx} className="p-4 bg-gray-900/50 rounded-xl border border-gray-700 font-medium">
                                                                {pair.right}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center">
                                                    <FaLayerGroup className="text-blue-400 mr-3" />
                                                    <p className="text-sm text-blue-300">Matching exercises require connecting the correct pairs. Selection logic is simulated for this demo.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Styled Feedback Section */}
                                        {checkedQuestions[currentQuestion.id]?.checked && (
                                            <div className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${
                                                checkedQuestions[currentQuestion.id]?.isCorrect
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                            }`}>
                                                {checkedQuestions[currentQuestion.id]?.isCorrect ? (
                                                    <>
                                                        <FaCheckCircle className="text-lg" />
                                                        <span className="font-semibold text-sm">Correct Answer! Great job.</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTimes className="text-lg text-red-500" />
                                                        <span className="font-semibold text-sm">
                                                            Incorrect. The correct answer was: {" "}
                                                            <span className="underline">
                                                                {currentQuestion.type === 'mcq' 
                                                                    ? currentQuestion.options[currentQuestion.correctAnswers[0]]
                                                                    : (currentQuestion.correctAnswers[0] === 0 ? 'True' : 'False')
                                                                }
                                                            </span>
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </Motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8">
                            <button 
                                onClick={() => {
                                    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                                }}
                                className="btn btn-ghost hover:bg-gray-800 text-gray-400 font-bold border-none"
                                disabled={currentQuestionIndex === 0}
                            >
                                <FaChevronLeft className="mr-2" /> Previous
                            </button>
                            
                            {!checkedQuestions[currentQuestion.id]?.checked ? (
                                <button
                                    onClick={() => checkCurrentAnswer(currentQuestion)}
                                    disabled={answers[currentQuestion.id] === undefined}
                                    className="btn px-10 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:opacity-50 text-white border-none rounded-full shadow-lg shadow-cyan-900/20"
                                >
                                    Check Answer
                                </button>
                            ) : (
                                currentQuestionIndex === activeLesson.questions.length - 1 ? (
                                    <button 
                                        onClick={() => {
                                            markLessonComplete(activeLesson.id);
                                            toast.success('Congratulations! Quiz completed.');
                                        }}
                                        className="btn px-10 bg-green-600 hover:bg-green-700 text-white border-none rounded-full shadow-lg shadow-green-900/20"
                                    >
                                        Finish Quiz & Claim XP
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setCurrentQuestionIndex(Math.min(activeLesson.questions.length - 1, currentQuestionIndex + 1));
                                        }}
                                        className="btn px-10 bg-cyan-600 hover:bg-cyan-700 text-white border-none rounded-full shadow-lg shadow-cyan-900/20"
                                    >
                                        Next Question <FaChevronRight className="ml-2" />
                                    </button>
                                )
                            )}
                        </div>
                    </Motion.div>
                );
            }
            case 'coding':
                return (
                    <Motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="p-6 bg-purple-900/10 rounded-2xl border border-purple-500/20">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-purple-500/20 rounded-lg">
                                    <FaBook className="text-purple-400 text-xl" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Coding Challenge</span>
                                    <h2 className="text-2xl font-bold m-0">{activeLesson.title}</h2>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{activeLesson.exercise?.description}</p>
                        </div>
                        
                        <CodingExerciseEditor
                            exercise={activeLesson.exercise}
                            lesson={activeLesson}
                        />

                        <div className="flex flex-col items-center justify-center p-8 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700">
                            <p className="text-gray-400 mb-4 text-center">Run your code to verify the output, then submit when you're ready.</p>
                            <button
                                onClick={() => {
                                    markLessonComplete(activeLesson.id);
                                    toast.success('Excellent work! Coding XP awarded.');
                                }}
                                className="btn btn-wide bg-purple-600 hover:bg-purple-700 text-white border-none rounded-xl"
                            >
                                Submit & Earn {activeLesson.xp} XP
                            </button>
                        </div>
                    </Motion.div>
                );
            case 'document': {
                const isPdf = activeLesson.fileFormat === 'pdf' || activeLesson.content?.toLowerCase().endsWith('.pdf');
                
                if (isPdf) {
                    return (
                        <Motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col space-y-4"
                        >
                            <div className="flex items-center justify-between p-4 bg-orange-900/10 rounded-xl border border-orange-500/20">
                                <div className="flex items-center space-x-3">
                                    <FaFilePdf className="text-orange-500 text-2xl" />
                                    <div>
                                        <h3 className="font-bold">{activeLesson.title}</h3>
                                        <p className="text-xs text-gray-400">PDF Document {activeLesson.originalFileName ? `• ${activeLesson.originalFileName}` : ''}</p>
                                    </div>
                                </div>
                                <a
                                    href={activeLesson.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-none rounded-lg"
                                >
                                    <FaFilePdf className="mr-2" /> Download
                                </a>
                            </div>

                            <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 min-h-[600px] flex flex-col items-center">
                                <div className="p-4 w-full flex justify-center bg-gray-800 border-b border-gray-700 space-x-4">
                                    <button
                                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                        disabled={pageNumber <= 1}
                                        className="btn btn-circle btn-sm bg-gray-700 hover:bg-gray-600 border-none disabled:opacity-30"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <div className="flex items-center px-4 bg-gray-900 rounded-lg text-sm font-medium">
                                        Page {pageNumber} of {numPages || '--'}
                                    </div>
                                    <button
                                        onClick={() => setPageNumber(prev => Math.min(prev + 1, (numPages || 1)))}
                                        disabled={pageNumber >= (numPages || 1)}
                                        className="btn btn-circle btn-sm bg-gray-700 hover:bg-gray-600 border-none disabled:opacity-30"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto w-full p-4 flex justify-center bg-gray-900/50">
                                    <Document
                                        file={activeLesson.content}
                                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                        className="shadow-2xl"
                                        loading={
                                            <div className="flex flex-col items-center justify-center p-20">
                                                <div className="loading loading-spinner loading-md text-orange-500 mb-4"></div>
                                                <p className="text-gray-400">Loading document...</p>
                                            </div>
                                        }
                                    >
                                        <Page pageNumber={pageNumber} width={700} />
                                    </Document>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    markLessonComplete(activeLesson.id);
                                    toast.success('XP Earned!');
                                }}
                                className={`btn w-full ${completedLessons.has(activeLesson.id) ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white border-none h-14 rounded-xl font-bold`}
                            >
                                {completedLessons.has(activeLesson.id) ? 'Document Read' : `Complete Document & Earn ${activeLesson.xp} XP`}
                            </button>
                        </Motion.div>
                    );
                }

                // Non-PDF document (TXT etc.)
                return (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="p-6 bg-orange-900/10 rounded-2xl border border-orange-500/20">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-orange-500/20 rounded-lg">
                                    <BsFileText className="text-orange-400 text-xl" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Document</span>
                                    <h2 className="text-2xl font-bold m-0">{activeLesson.title}</h2>
                                    {activeLesson.originalFileName && (
                                        <p className="text-sm text-gray-400">{activeLesson.originalFileName}</p>
                                    )}
                                </div>
                            </div>
                            <a
                                href={activeLesson.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn bg-orange-600 hover:bg-orange-700 text-white border-none rounded-lg"
                            >
                                Download Document
                            </a>
                        </div>

                        <button
                            onClick={() => {
                                markLessonComplete(activeLesson.id);
                                toast.success('XP Earned!');
                            }}
                            className={`btn w-full ${completedLessons.has(activeLesson.id) ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white border-none h-14 rounded-xl font-bold`}
                        >
                            {completedLessons.has(activeLesson.id) ? 'Document Read' : `Complete & Earn ${activeLesson.xp} XP`}
                        </button>
                    </Motion.div>
                );
            }
            default:
                return <div>Unsupported content type</div>;
        }
    };

    // Get icon based on lesson type
    const getLessonIcon = (type) => {
        switch (type) {
            case 'video': return <FaPlay className="text-blue-400" />;
            case 'article': return <BsFileText className="text-green-400" />;
            case 'pdf': return <FaFilePdf className="text-red-400" />;
            case 'document': return <FaFilePdf className="text-orange-400" />;
            case 'quiz': return <RiQuestionAnswerFill className="text-yellow-400" />;
            case 'coding': return <FaBook className="text-purple-400" />;
            default: return <FaBook className="text-gray-400" />;
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="alert alert-error max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Error: {error}</span>
                </div>
            </div>
        );
    }

    const isInstructor = course?.instructorId 
        ? course.instructorId === (user?._id || user?.id)
        : course?.instructor?.email === user?.email;

    const allowed = isEnrolled || user?.role === 'admin' || isInstructor;

    if (!allowed) {
        navigate(`/course/${courseId}`);
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            {/* Top Navigation / Breadcrumbs */}
            <nav className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center space-x-3 md:space-x-4 text-sm">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 mr-2 hover:bg-gray-800 rounded-lg lg:hidden"
                    >
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <Link to="/dashboard" className="text-gray-500 hover:text-white transition-colors hidden xs:inline">
                        <FaHome />
                    </Link>
                    <span className="text-gray-700 hidden xs:inline">/</span>
                    <Link to={`/course/${courseId}`} className="text-gray-500 hover:text-white transition-colors truncate max-w-[100px] md:max-w-[150px]">
                        {course?.title}
                    </Link>
                    {currentSection && (
                        <>
                            <span className="text-gray-700 hidden sm:inline">/</span>
                            <span className="text-gray-500 truncate max-w-[100px] md:max-w-[150px] hidden sm:inline">{currentSection.title}</span>
                        </>
                    )}
                    {activeLesson && (
                        <>
                            <span className="text-gray-700 hidden md:inline">/</span>
                            <span className="text-cyan-500 font-medium truncate max-w-[150px] md:max-w-[200px] hidden md:inline">{activeLesson.title}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="hidden md:flex flex-col items-end">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Course Progress</span>
                            <span className="text-xs font-bold text-blue-400">{progress}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-1000" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <XPCounter xp={earnedXP} compact />
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Backdrop */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}
                {/* Enhanced Sidebar */}
                <aside className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    w-80 bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white mb-1">Course Content</h2>
                            <p className="text-xs text-gray-500 font-medium">{completedLessons.size} of {totalLessons} lessons completed</p>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-gray-800 rounded-lg lg:hidden"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {course?.sections?.map((section, sectionIndex) => {
                            const sectionId = section.id || section._id || `section-${sectionIndex}`;
                            const isExpanded = expandedSections.has(sectionId);
                            const sectionProgress = section.lessons?.filter(l => completedLessons.has(l.id)).length;
                            const sectionTotal = section.lessons?.length || 0;
                            const sectionPercent = (sectionProgress / sectionTotal) * 100;

                            return (
                                <div key={sectionId} className="group">
                                    <button
                                        onClick={() => toggleSection(sectionId)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                            isExpanded ? 'bg-gray-800/50 shadow-inner' : 'hover:bg-gray-800/30'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                                                isExpanded ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'
                                            }`}>
                                                {sectionIndex + 1}
                                            </div>
                                            <div className="text-left">
                                                <h3 className={`text-sm font-bold transition-colors ${isExpanded ? 'text-white' : 'text-gray-400'}`}>
                                                    {section.title}
                                                </h3>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-cyan-500" 
                                                            style={{ width: `${sectionPercent}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 font-bold">{sectionProgress}/{sectionTotal}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded ? <FaChevronUp className="text-gray-500 text-xs" /> : <FaChevronDown className="text-gray-500 text-xs" />}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <Motion.ul 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-2 ml-4 pl-4 border-l border-gray-800 space-y-1 overflow-hidden"
                                            >
                                                {section.lessons?.map((lesson, lessonIndex) => {
                                                    const isActive = activeLesson?.id === lesson.id;
                                                    const isCompleted = completedLessons.has(lesson.id);

                                                    return (
                                                        <li key={lesson.id || lessonIndex}>
                                                            <button
                                                                onClick={() => {
                                                                    setActiveLesson(lesson);
                                                                    setPageNumber(1);
                                                                }}
                                                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 text-sm transition-all group/item ${isActive
                                                                    ? 'bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/30'
                                                                    : 'hover:bg-gray-800/50 text-gray-500 hover:text-gray-300'
                                                                    }`}
                                                            >
                                                                <span className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                                                                    {isCompleted ? (
                                                                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                                                                            <FaCheckCircle className="text-green-500 text-xs" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-5 h-5 flex items-center justify-center">
                                                                            {getLessonIcon(lesson.type)}
                                                                        </div>
                                                                    )}
                                                                </span>
                                                                <span className={`truncate font-medium ${isActive ? 'text-blue-400' : ''}`}>
                                                                    {lesson.title}
                                                                </span>
                                                                {isActive && (
                                                                    <Motion.div 
                                                                        layoutId="activeIndicator"
                                                                        className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                                                                    />
                                                                )}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </Motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-4 bg-gray-900 border-t border-gray-800">
                        <button 
                            onClick={() => navigate(`/course/${courseId}/assessment`)}
                            className="btn btn-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none rounded-xl shadow-lg"
                        >
                            <RiQuestionAnswerFill className="mr-2" />
                            Final Assessment
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-950 relative custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeLesson ? (
                            <Motion.div 
                                key={activeLesson.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-5xl mx-auto p-8 lg:p-12"
                            >
                                <div className="mb-8 flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <FaLayerGroup />
                                        <span>{currentSection?.title}</span>
                                        <span className="mx-1">•</span>
                                        <span>Lesson {currentSection?.lessons?.findIndex(l => l.id === activeLesson.id) + 1}</span>
                                    </div>
                                    {completedLessons.has(activeLesson.id) && (
                                        <div className="flex items-center text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                                            <FaCheckCircle className="mr-2" /> Completed
                                        </div>
                                    )}
                                </div>

                                <div className="min-h-[60vh]">
                                    {renderLessonContent()}
                                </div>

                                {/* Navigation Controls */}
                                <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <button
                                        onClick={() => goToLesson(prevLesson)}
                                        disabled={!prevLesson}
                                        className="group flex items-center space-x-4 p-4 rounded-2xl transition-all hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed w-full md:w-auto"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                            <FaChevronLeft className="text-gray-400 group-hover:text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Previous Lesson</p>
                                            <p className="text-sm font-bold text-gray-400 group-hover:text-gray-200 truncate max-w-[200px]">
                                                {prevLesson ? prevLesson.title : 'Start of Course'}
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => goToLesson(nextLesson)}
                                        disabled={!nextLesson}
                                        className="group flex items-center justify-end space-x-4 p-4 rounded-2xl transition-all hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed w-full md:w-auto text-right"
                                    >
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Next Lesson</p>
                                            <p className="text-sm font-bold text-gray-400 group-hover:text-gray-200 truncate max-w-[200px]">
                                                {nextLesson ? nextLesson.title : 'Course Completed'}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                            <FaChevronRight className="text-blue-500 group-hover:text-white" />
                                        </div>
                                    </button>
                                </div>
                            </Motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-gray-800">
                                    <FaPlay className="text-4xl text-blue-500 ml-1" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">Ready to start learning?</h3>
                                <p className="text-gray-500 max-w-sm">Select a lesson from the sidebar to begin your journey and earn XP.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default CourseContent;
