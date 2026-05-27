// src/components/instructor/AtRiskStudents.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail, CheckCircle, RefreshCw, LogIn, BookOpen, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { instructorService } from '../../services/instructorService';

const AtRiskStudents = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [runningInference, setRunningInference] = useState(false);

    const fetchPredictions = async () => {
        try {
            setLoading(true);
            const data = await instructorService.getDropoutPredictions();
            setPredictions(data);
        } catch (error) {
            console.error('Error fetching dropout predictions:', error);
            toast.error('Failed to load dropout predictions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, []);

    const handleRunPredictions = async () => {
        try {
            setRunningInference(true);
            const toastId = toast.loading('Running ML Dropout Predictions...');
            const res = await instructorService.triggerPredictions();
            toast.success(`ML predictions run successfully! Predicted: ${res.total_predicted} student(s).`, { id: toastId });
            await fetchPredictions();
        } catch (error) {
            console.error('Error triggering predictions:', error);
            toast.error('Failed to run ML predictions');
        } finally {
            setRunningInference(false);
        }
    };

    const handleSendReminder = async (studentId) => {
        try {
            await instructorService.sendReminder(studentId);
            toast.success('Reminder sent successfully');
        } catch {
            toast.error('Failed to send reminder');
        }
    };

    // Helper to get formatted prediction time
    const getFormattedTime = (dateStr) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    // Determine the color of progress bar based on score
    const getProgressBarColor = (score) => {
        if (score >= 0.7) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
        if (score >= 0.4) return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
        return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
    };

    // Get Risk Level Badge classes
    const getRiskLevelBadge = (level) => {
        switch (level) {
            case 'high':
                return 'bg-red-950/80 border border-red-500/30 text-red-400 font-semibold';
            case 'medium':
                return 'bg-orange-950/80 border border-orange-500/30 text-orange-400 font-semibold';
            case 'low':
                return 'bg-green-950/80 border border-green-500/30 text-green-400 font-semibold';
            default:
                return 'bg-gray-800 text-gray-400';
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        AI-Powered At-Risk Students
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Predicting 7-day student dropout risks using a Random Forest classifier.
                    </p>
                    {predictions.length > 0 && predictions[0].last_prediction_at && (
                        <p className="text-xs text-gray-500 mt-1">
                            Last predicted at: <span className="text-indigo-400">{getFormattedTime(predictions[0].last_prediction_at)}</span>
                        </p>
                    )}
                </div>

                <button
                    onClick={handleRunPredictions}
                    disabled={runningInference || loading}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-950/30 border border-indigo-400/20`}
                >
                    <RefreshCw className={`w-4 h-4 ${runningInference ? 'animate-spin' : ''}`} />
                    {runningInference ? 'Running AI Engine...' : 'Run Predictions'}
                </button>
            </div>

            {/* Table or Empty State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm mt-4 font-medium animate-pulse">Analyzing student activities...</p>
                </div>
            ) : predictions.length === 0 ? (
                <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No students predicted to be at risk</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                        All enrolled students are consistently active. To run inference on the latest telemetry, click the "Run Predictions" button above.
                    </p>
                </div>
            ) : (
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="py-4 px-6 text-gray-400 font-semibold text-xs uppercase tracking-wider">Student Name</th>
                                    <th className="py-4 px-6 text-gray-400 font-semibold text-xs uppercase tracking-wider">Course</th>
                                    <th className="py-4 px-6 text-gray-400 font-semibold text-xs uppercase tracking-wider">Dropout Risk</th>
                                    <th className="py-4 px-6 text-gray-400 font-semibold text-xs uppercase tracking-wider">Risk Level</th>
                                    <th className="py-4 px-6 text-gray-400 font-semibold text-xs uppercase tracking-wider">Activity (7d)</th>
                                    <th className="py-4 px-6 text-gray-400 font-semibold text-xs uppercase tracking-wider">Quiz Avg</th>
                                    <th className="py-4 px-6 text-gray-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {predictions.map((pred, index) => {
                                    const student = pred.studentId || {};
                                    const course = pred.courseId || {};
                                    const riskPercentage = Math.round((pred.dropout_risk_score || 0) * 100);

                                    return (
                                        <tr key={index} className="border-b border-gray-850 hover:bg-gray-800/20 transition-all">
                                            {/* Student Details */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {student.photoURL ? (
                                                        <img
                                                            src={student.photoURL}
                                                            alt={student.name}
                                                            className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {student.name?.charAt(0) || 'S'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-200">{student.name || 'Unknown Student'}</p>
                                                        <p className="text-xs text-gray-500">{student.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Course */}
                                            <td className="py-4 px-6 text-sm text-gray-300 font-medium">
                                                {course.title || 'N/A'}
                                            </td>

                                            {/* Risk Progress Bar */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-gray-350 min-w-[36px]">{riskPercentage}%</span>
                                                    <div className="w-28 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-750">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${getProgressBarColor(pred.dropout_risk_score)}`}
                                                            style={{ width: `${riskPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Risk Level Badge */}
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs uppercase tracking-wide ${getRiskLevelBadge(pred.risk_level)}`}>
                                                    {pred.risk_level || 'unknown'}
                                                </span>
                                            </td>

                                            {/* Activity Logins / Lessons */}
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-300 flex items-center gap-1.5 font-medium">
                                                        <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                                                        {pred.login_count || 0} logins
                                                    </p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                                                        {pred.lessons_completed || 0}/{pred.lessons_started || 0} lessons
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Quiz Average Score */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-gray-200">
                                                    <Award className="w-4 h-4 text-yellow-500" />
                                                    <span>{pred.avg_assessment_score ? `${Math.round(pred.avg_assessment_score)}%` : 'N/A'}</span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => handleSendReminder(student._id)}
                                                    disabled={!student._id}
                                                    className="px-4 py-2 bg-gray-800 hover:bg-indigo-950 text-indigo-400 hover:text-indigo-300 border border-gray-750 hover:border-indigo-500/30 rounded-xl text-xs font-semibold transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center gap-1.5"
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
                                                    Contact
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtRiskStudents;
