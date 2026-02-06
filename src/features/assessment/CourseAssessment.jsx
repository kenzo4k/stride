import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ASSESSMENT_CONFIG, getRandomQuestions, shuffleOptions, QUESTION_TYPES } from './AssessmentConfig';

const CourseAssessment = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();

    // Assessment configuration
    const [assessmentConfig] = useState(ASSESSMENT_CONFIG);

    // State management
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [wrongAnswersPerTopic, setWrongAnswersPerTopic] = useState({});
    const [showTopicFeedback, setShowTopicFeedback] = useState(false);
    const [assessmentComplete, setAssessmentComplete] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState({});

    // Generate questions for all topics
    useEffect(() => {
        const questions = {};
        assessmentConfig.topics.forEach((topic, topicIndex) => {
            const topicQuestions = getRandomQuestions(topic, assessmentConfig.questionsPerTopic);
            questions[topicIndex] = topicQuestions.map((question, index) => ({
                ...shuffleOptions(question),
                id: `${topicIndex}-q${index}`
            }));
        });
        setGeneratedQuestions(questions);
    }, [assessmentConfig]);

    // Handle answer selection
    const handleAnswerSelect = (questionId, selectedOption) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    // Navigate to next question
    const handleNextQuestion = () => {
        const currentTopicQuestions = generatedQuestions[currentTopicIndex] || [];
        const isLastQuestionInTopic = currentQuestionIndex === currentTopicQuestions.length - 1;

        if (isLastQuestionInTopic) {
            // Evaluate topic performance
            evaluateTopicPerformance();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    // Evaluate performance for the current topic
    const evaluateTopicPerformance = () => {
        const currentTopicQuestions = generatedQuestions[currentTopicIndex] || [];
        let wrongCount = 0;

        currentTopicQuestions.forEach(question => {
            const userAnswer = selectedAnswers[question.id];
            let isCorrect = false;

            // Check answer based on question type
            switch (question.type) {
                case 'mcq':
                    isCorrect = userAnswer === question.correctAnswer;
                    break;
                case 'fill_blank':
                    isCorrect = userAnswer && userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
                    break;
                case 'matching':
                    if (userAnswer && question.pairs) {
                        isCorrect = question.pairs.every((pair, idx) => {
                            return userAnswer[idx] === pair.right;
                        });
                    }
                    break;
                case 'true_false':
                    isCorrect = userAnswer === question.correctAnswer;
                    break;
                default:
                    // Legacy support for questions without type (assume MCQ)
                    isCorrect = userAnswer === question.correctAnswer;
            }

            if (!isCorrect) {
                wrongCount++;
            }
        });

        setWrongAnswersPerTopic(prev => ({
            ...prev,
            [currentTopicIndex]: wrongCount
        }));

        setShowTopicFeedback(true);
    };

    // Get feedback message based on wrong answers
    const getFeedbackMessage = (wrongCount) => {
        if (wrongCount === 0) {
            return "Excellent! You have mastered this topic.";
        } else if (wrongCount === 1) {
            return "You need a light review of this topic.";
        } else if (wrongCount >= 2 && wrongCount <= 3) {
            return "You need to review this topic again.";
        } else {
            return "You need to study the topic again.";
        }
    };

    // Continue to next topic after feedback
    const handleContinueToNextTopic = () => {
        const isLastTopic = currentTopicIndex === assessmentConfig.numberOfTopics - 1;

        if (isLastTopic) {
            setAssessmentComplete(true);
        } else {
            setCurrentTopicIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
            setShowTopicFeedback(false);
        }
    };

    // Restart assessment
    const handleRestart = () => {
        setCurrentTopicIndex(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setWrongAnswersPerTopic({});
        setShowTopicFeedback(false);
        setAssessmentComplete(false);
    };

    // Navigate back to course
    const handleBackToCourse = () => {
        navigate(`/course/${courseId}`);
    };

    const currentTopicQuestions = generatedQuestions[currentTopicIndex] || [];
    const currentQuestion = currentTopicQuestions[currentQuestionIndex];
    const progress = ((currentTopicIndex * assessmentConfig.questionsPerTopic) + currentQuestionIndex + 1) /
        (assessmentConfig.numberOfTopics * assessmentConfig.questionsPerTopic) * 100;

    if (assessmentComplete) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
                        <h1 className="text-3xl font-bold text-white mb-6">Assessment Complete!</h1>

                        <div className="space-y-4 mb-8">
                            <h2 className="text-xl font-semibold text-white">Your Performance Summary:</h2>
                            {assessmentConfig.topics.map((topic, index) => {
                                const wrongCount = wrongAnswersPerTopic[index] || 0;
                                const correctCount = assessmentConfig.questionsPerTopic - wrongCount;
                                const percentage = (correctCount / assessmentConfig.questionsPerTopic) * 100;

                                return (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium text-white">{topic}</h3>
                                            <span className={`font-bold ${wrongCount === 0 ? 'text-green-400' :
                                                wrongCount === 1 ? 'text-yellow-400' :
                                                    wrongCount <= 3 ? 'text-orange-400' : 'text-red-400'
                                                }`}>
                                                {correctCount}/{assessmentConfig.questionsPerTopic} ({percentage.toFixed(0)}%)
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300">{getFeedbackMessage(wrongCount)}</p>
                                        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                                            <div
                                                className={`h-2 rounded-full ${wrongCount === 0 ? 'bg-green-500' :
                                                    wrongCount === 1 ? 'bg-yellow-500' :
                                                        wrongCount <= 3 ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleRestart}
                                className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none"
                            >
                                Restart Assessment
                            </button>
                            <button
                                onClick={handleBackToCourse}
                                className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
                            >
                                Back to Course
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showTopicFeedback) {
        const wrongCount = wrongAnswersPerTopic[currentTopicIndex] || 0;
        const correctCount = assessmentConfig.questionsPerTopic - wrongCount;

        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
                        <h1 className="text-2xl font-bold text-white mb-4">
                            Topic Complete: {assessmentConfig.topics[currentTopicIndex]}
                        </h1>

                        <div className="text-center mb-6">
                            <div className="text-4xl font-bold mb-4">
                                <span className="text-green-400">{correctCount}</span>
                                <span className="text-gray-400">/</span>
                                <span className="text-white">{assessmentConfig.questionsPerTopic}</span>
                            </div>
                            <p className={`text-xl font-semibold ${wrongCount === 0 ? 'text-green-400' :
                                wrongCount === 1 ? 'text-yellow-400' :
                                    wrongCount <= 3 ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                {getFeedbackMessage(wrongCount)}
                            </p>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
                            <div
                                className={`h-4 rounded-full ${wrongCount === 0 ? 'bg-green-500' :
                                    wrongCount === 1 ? 'bg-yellow-500' :
                                        wrongCount <= 3 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${(correctCount / assessmentConfig.questionsPerTopic) * 100}%` }}
                            ></div>
                        </div>

                        <button
                            onClick={handleContinueToNextTopic}
                            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none w-full"
                        >
                            {currentTopicIndex === assessmentConfig.numberOfTopics - 1 ? 'View Results' : 'Next Topic'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-white">
                            {assessmentConfig.courseName} Assessment
                        </h1>
                        <button
                            onClick={handleBackToCourse}
                            className="btn bg-gray-700 hover:bg-gray-600 text-white border-none btn-sm"
                        >
                            Back to Course
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">
                                Topic {currentTopicIndex + 1} of {assessmentConfig.numberOfTopics}: {assessmentConfig.topics[currentTopicIndex]}
                            </span>
                            <span className="text-white">
                                Question {currentQuestionIndex + 1} of {currentTopicQuestions.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">
                        {currentQuestion.question}
                    </h2>

                    {/* MCQ Question */}
                    {currentQuestion.type === 'mcq' && (
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <label
                                    key={index}
                                    className={`block p-4 rounded-lg border cursor-pointer transition-all ${selectedAnswers[currentQuestion.id] === index
                                        ? 'border-indigo-500 bg-indigo-900/30'
                                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={currentQuestion.id}
                                        value={index}
                                        checked={selectedAnswers[currentQuestion.id] === index}
                                        onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                                        className="mr-3"
                                    />
                                    <span className="text-gray-100">{option}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Fill in the Blank Question */}
                    {currentQuestion.type === 'fill_blank' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                                placeholder="Type your answer here..."
                                value={selectedAnswers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                            />
                        </div>
                    )}

                    {/* Matching Question */}
                    {currentQuestion.type === 'matching' && currentQuestion.pairs && (
                        <div className="space-y-4">
                            {currentQuestion.pairs.map((pair, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="flex-1 p-3 bg-gray-700 rounded-lg text-white font-medium border border-gray-600">
                                        {pair.left}
                                    </div>
                                    <span className="text-gray-400">→</span>
                                    <select
                                        className="select select-bordered flex-1 bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-cyan-500"
                                        value={selectedAnswers[currentQuestion.id]?.[idx] || ''}
                                        onChange={(e) => {
                                            const currentAnswers = selectedAnswers[currentQuestion.id] || {};
                                            handleAnswerSelect(currentQuestion.id, {
                                                ...currentAnswers,
                                                [idx]: e.target.value
                                            });
                                        }}
                                    >
                                        <option value="">Select match...</option>
                                        {currentQuestion.pairs.map((_, optIdx) => (
                                            <option key={optIdx} value={currentQuestion.pairs[optIdx].right}>
                                                {currentQuestion.pairs[optIdx].right}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* True/False Question */}
                    {currentQuestion.type === 'true_false' && (
                        <div className="flex gap-4">
                            <button
                                className={`flex-1 p-6 rounded-lg border-2 font-bold text-lg transition-all ${
                                    selectedAnswers[currentQuestion.id] === true
                                        ? 'border-green-500 bg-green-900/30 text-green-400'
                                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-gray-300'
                                }`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, true)}
                            >
                                True
                            </button>
                            <button
                                className={`flex-1 p-6 rounded-lg border-2 font-bold text-lg transition-all ${
                                    selectedAnswers[currentQuestion.id] === false
                                        ? 'border-red-500 bg-red-900/30 text-red-400'
                                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-gray-300'
                                }`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, false)}
                            >
                                False
                            </button>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNextQuestion}
                            disabled={selectedAnswers[currentQuestion.id] === undefined || selectedAnswers[currentQuestion.id] === ''}
                            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentQuestionIndex === currentTopicQuestions.length - 1 ? 'Complete Topic' : 'Next Question'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAssessment;
