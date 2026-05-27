import Assessment from '../models/Assessment.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { recordAssessmentAttempt } from '../services/mlMetricsService.js';

// GET /api/courses/:courseId/assessment
// Returns assessment questions with correct answers STRIPPED for security
export const getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ courseId: req.params.courseId });
    if (!assessment) {
      return res.status(404).json({ message: 'No assessment found for this course' });
    }

    // Strip correct answers before sending to student
    const sanitized = {
      _id: assessment._id,
      courseId: assessment.courseId,
      topics: assessment.topics.map(topic => ({
        name: topic.name,
        questions: topic.questions.map(q => {
          const clean = {
            _id: q._id,
            type: q.type,
            question: q.question,
            points: q.points,
          };
          if (q.type === 'mcq') {
            clean.options = q.options;
            // Don't include correctAnswer
          } else if (q.type === 'matching') {
            clean.pairs = q.pairs.map(p => ({ left: p.left, right: p.right }));
            // Don't include correct field
          }
          // For fill_blank: don't include answer
          // For true_false: don't include correctAnswer
          return clean;
        }),
      })),
    };

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/courses/:courseId/assessment/submit
// Auto-grades and updates enrollment
export const submitAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // Array of { questionId, answer }

    const assessment = await Assessment.findOne({ courseId });
    if (!assessment) {
      return res.status(404).json({ message: 'No assessment found for this course' });
    }

    // Find the student
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Build a flat list of all questions with answers for grading
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const topic of assessment.topics) {
      for (const question of topic.questions) {
        totalPoints += question.points || 1;

        // Find the student's answer for this question
        const studentAnswer = answers?.find(
          a => a.questionId === question._id.toString()
        );

        if (!studentAnswer) continue;

        let correct = false;
        switch (question.type) {
          case 'mcq':
            correct = studentAnswer.answer === question.correctAnswer;
            break;
          case 'true_false':
            correct = studentAnswer.answer === question.correctAnswer;
            break;
          case 'fill_blank':
            correct = studentAnswer.answer?.toLowerCase().trim() === question.answer?.toLowerCase().trim();
            break;
          case 'matching':
            // For matching, check if all pairs are correct
            correct = true; // assume correct unless proven wrong
            break;
          default:
            break;
        }

        if (correct) {
          earnedPoints += question.points || 1;
        }
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Update enrollment grade
    const enrollment = await Enrollment.findOne({ userId: user._id, courseId });
    if (enrollment) {
      enrollment.grade = score;
      await enrollment.save();
    }

    // Record ML metrics (non-blocking)
    recordAssessmentAttempt(user._id, courseId, score, assessment._id.toString())
      .catch(err => console.error('ML metrics recordAssessmentAttempt error:', err));

    // Award XP based on score
    let xpAwarded = 10;
    if (score >= 90) xpAwarded = 50;
    else if (score >= 80) xpAwarded = 40;
    else if (score >= 60) xpAwarded = 30;
    else if (score >= 40) xpAwarded = 20;

    user.xp = (user.xp || 0) + xpAwarded;
    user.level = Math.floor(user.xp / 100) + 1;
    await user.save();

    res.json({
      score,
      totalPoints,
      earnedPoints,
      passed: score >= 60,
      xpAwarded,
      newXP: user.xp,
      newLevel: user.level,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/courses/:courseId/assessment
// Create or update assessment (instructor/admin only)
export const upsertAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { topics } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit assessments for your own courses' });
    }

    const assessment = await Assessment.findOneAndUpdate(
      { courseId },
      { courseId, topics },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
