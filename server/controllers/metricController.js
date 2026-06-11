import MLFeature from '../models/MLFeature.js';
import Course from '../models/Course.js';

// GET /api/metrics/student/:studentId
export const getStudentMetrics = async (req, res) => {
  try {
    // Prevent BOLA: only allow self access, instructors, or admins
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && req.user.id !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own metrics.' });
    }

    const metrics = await MLFeature.find({ studentId: req.params.studentId })
      .populate('courseId', 'title category');

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/metrics/course/:courseId
export const getCourseMetrics = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'instructor') {
      const isOwner = course.instructorId?.toString() === req.user.id
        || course.instructor?.email === req.user.email;
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied. You can only view metrics for your own courses.' });
      }
    }

    const metrics = await MLFeature.find({ courseId: req.params.courseId })
      .populate('studentId', 'name email photoURL');

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/metrics/at-risk
export const getAtRiskStudents = async (req, res) => {
  try {
    const metrics = await MLFeature.find({ risk_level: 'high' })
      .populate('studentId', 'name email photoURL')
      .populate('courseId', 'title category')
      .sort({ dropout_risk_score: -1 });

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
