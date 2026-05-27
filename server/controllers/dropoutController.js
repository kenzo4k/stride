import User from '../models/User.js';
import Course from '../models/Course.js';
import MLFeature from '../models/MLFeature.js';
import axios from 'axios';
import { recordSessionTime, recordLessonStarted } from '../services/mlMetricsService.js';

export const getDropoutPredictions = async (req, res) => {
  try {
    const email = req.user.email;
    const instructor = await User.findOne({ email });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    const courses = await Course.find({ "instructor.email": instructor.email });
    const courseIds = courses.map(c => c._id);

    const predictions = await MLFeature.find({
      courseId: { $in: courseIds },
      dropout_prediction: { $ne: null }
    })
    .populate('studentId', 'name email photoURL')
    .populate('courseId', 'title')
    .sort({ dropout_risk_score: -1 });

    res.json(predictions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const triggerPredictions = async (req, res) => {
  try {
    const pythonServiceUrl = process.env.DROPOUT_SERVICE_URL || 'http://localhost:8001';
    const response = await axios.post(`${pythonServiceUrl}/api/predict-all`);
    res.json(response.data);
  } catch (err) {
    console.error('Error triggering predictions on Python service:', err.message);
    res.status(500).json({ message: "Failed to trigger predictions on ML service", error: err.message });
  }
};

export const recordSessionTimeController = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, durationMinutes } = req.body;

    if (!courseId || durationMinutes === undefined) {
      return res.status(400).json({ message: "courseId and durationMinutes are required" });
    }

    const doc = await recordSessionTime(studentId, courseId, Number(durationMinutes));
    res.json({ message: "Session time recorded successfully", doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const recordLessonStartedController = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    await recordLessonStarted(studentId, courseId);
    res.json({ message: "Lesson start recorded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
