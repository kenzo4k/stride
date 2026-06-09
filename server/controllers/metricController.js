import MLFeature from '../models/MLFeature.js';

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
