import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const CourseAssessment = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [assessmentResult, setAssessmentResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/courses/${courseId}/assessment`)
            .then(res => {
                setAssessment(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load assessment", err);
                toast.error("Could not load assessment for this course.");
                setLoading(false);
            });
    }, [courseId]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleNextQuestion = () => {
        const currentTopic = assessment.topics[currentTopicIndex];
        const isLastQuestionInTopic = currentQuestionIndex === currentTopic.questions.length - 1;
        const isLastTopic = currentTopicIndex === assessment.topics.length - 1;

        if (isLastQuestionInTopic && isLastTopic) {
            submitAssessment();
        } else if (isLastQuestionInTopic) {
            setCurrentTopicIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const submitAssessment = async () => {
        setSubmitting(true);
        // Format answers for backend: [{ questionId, answer }]
        const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, answer]) => ({
            questionId,
            answer
        }));

        try {
            const res = await api.post(`/courses/${courseId}/assessment/submit`, { answers: formattedAnswers });
            setAssessmentResult(res.data);
            if (refreshUser) refreshUser();
            toast.success("Assessment graded successfully!");
        } catch (err) {
            console.error("Submit failed", err);
            toast.error("Failed to submit assessment.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackToCourse = () => {
        navigate(`/course/${courseId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-xl text-cyan-400">Loading Assessment...</div>
            </div>
        );
    }

    if (!assessment || !assessment.topics || assessment.topics.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl mb-4">No Assessment Found</h2>
                <button onClick={handleBackToCourse} className="btn bg-cyan-600 hover:bg-cyan-700 text-white border-none">
                    Back to Course
                </button>
            </div>
        );
    }

    if (assessmentResult) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
                    <h1 className="text-3xl font-bold text-white mb-6">Assessment Complete!</h1>
                    
                    <div className="bg-gray-700 p-6 rounded-lg mb-8 text-center border-t-4 border-t-cyan-500">
                        <h2 className="text-2xl font-bold mb-2">Final Score</h2>
                        <div className="text-5xl font-black text-cyan-400 mb-4">{assessmentResult.score}%</div>
                        <p className="text-gray-300">
                            You earned {assessmentResult.earnedPoints} out of {assessmentResult.totalPoints} points.
                        </p>
                        <div className="mt-4 inline-block bg-gray-800 rounded-full px-6 py-2 border border-gray-600">
                            <span className="font-semibold text-yellow-400">+{assessmentResult.xpAwarded} XP Earned</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleBackToCourse}
                            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none px-8"
                        >
                            Return to Course
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentTopic = assessment.topics[currentTopicIndex];
    const currentQuestion = currentTopic.questions[currentQuestionIndex];
    
    // Calculate total questions across all topics
    let totalQuestions = 0;
    let currentOverallQuestion = 0;
    assessment.topics.forEach((topic, tIdx) => {
        if (tIdx < currentTopicIndex) currentOverallQuestion += topic.questions.length;
        if (tIdx === currentTopicIndex) currentOverallQuestion += currentQuestionIndex + 1;
        totalQuestions += topic.questions.length;
    });

    const progress = (currentOverallQuestion / totalQuestions) * 100;
    const isLastOverall = currentTopicIndex === assessment.topics.length - 1 && currentQuestionIndex === currentTopic.questions.length - 1;

    // Render Question based on type
    const renderQuestion = () => {
        if (!currentQuestion) return null;

        const value = selectedAnswers[currentQuestion._id] || '';

        switch (currentQuestion.type) {
            case 'mcq':
                return (
                    <div className="space-y-3 mt-6">
                        {currentQuestion.options.map((option, index) => (
                            <label
                                key={index}
                                className={`block w-full p-4 rounded-lg border ${
                                    value === option
                                        ? 'border-cyan-500 bg-cyan-900/30 text-white'
                                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                } cursor-pointer transition-colors`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion._id}`}
                                        value={option}
                                        checked={value === option}
                                        onChange={() => handleAnswerSelect(currentQuestion._id, option)}
                                        className="h-4 w-4 text-cyan-500 border-gray-500 focus:ring-cyan-500 bg-gray-800"
                                    />
                                    <span className="ml-3 font-medium">{option}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                );
            case 'true_false':
                return (
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => handleAnswerSelect(currentQuestion._id, true)}
                            className={`flex-1 py-4 rounded-lg border font-bold text-lg ${value === true ? 'border-green-500 bg-green-900/30 text-green-400' : 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        >True</button>
                        <button
                            onClick={() => handleAnswerSelect(currentQuestion._id, false)}
                            className={`flex-1 py-4 rounded-lg border font-bold text-lg ${value === false ? 'border-red-500 bg-red-900/30 text-red-400' : 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        >False</button>
                    </div>
                );
            case 'fill_blank':
                return (
                    <div className="mt-6">
                        <input 
                            type="text" 
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:border-cyan-500"
                            placeholder="Type your answer here..."
                            value={value}
                            onChange={(e) => handleAnswerSelect(currentQuestion._id, e.target.value)}
                        />
                    </div>
                );
            default:
                return <div className="text-red-400">Unsupported question type: {currentQuestion.type}</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{currentTopic.name}</h2>
                        <p className="text-gray-400">Question {currentOverallQuestion} of {totalQuestions}</p>
                    </div>
                    <button
                        onClick={handleBackToCourse}
                        className="text-gray-400 hover:text-white transition-colors text-sm font-medium border border-gray-700 rounded-lg px-4 py-2 hover:bg-gray-800"
                    >
                        Exit Assessment
                    </button>
                </div>

                <div className="w-full bg-gray-800 rounded-full h-2 mb-8 border border-gray-700">
                    <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-medium text-white mb-2 leading-relaxed">
                        {currentQuestion.question}
                    </h3>
                    
                    {renderQuestion()}

                    <div className="mt-10 flex justify-end">
                        <button
                            onClick={handleNextQuestion}
                            disabled={selectedAnswers[currentQuestion._id] === undefined || submitting}
                            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : isLastOverall ? 'Submit Assessment' : 'Next Question'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAssessment;
