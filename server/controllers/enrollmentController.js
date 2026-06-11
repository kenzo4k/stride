import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import CourseContent from '../models/CourseContent.js';
import { recordLessonCompleted } from '../services/mlMetricsService.js';

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;
    
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId: student._id, courseId: course._id });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Check seat limit
    if (course.seats && (course.enrollmentCount || 0) >= course.seats) {
      return res.status(400).json({ message: "Course is full. No seats remaining." });
    }

    const enrollment = new Enrollment({
      userId: student._id,
      courseId: course._id,
    });

    await enrollment.save();

    // Increment enrollment count in course atomically
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate('courseId');
    
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProgress = async (req, res) => {
    try {
        const { progress, completedLessons, grade } = req.body;
        
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

        // Enforce ownership
        if (enrollment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this enrollment progress" });
        }

        const previousSet = new Set((enrollment.completedLessons || []).map(String));
        const newlyCompleted = (completedLessons || []).filter(l => !previousSet.has(String(l)));

        enrollment.progress = progress;
        enrollment.completedLessons = completedLessons;
        if (grade !== undefined) {
            enrollment.grade = grade;
        }
        await enrollment.save();

        // Award XP securely on backend for newly completed lessons
        if (newlyCompleted.length > 0) {
            try {
                const content = await CourseContent.findOne({ courseId: enrollment.courseId });
                if (content) {
                    const lessons = content.sections.flatMap(s => s.lessons || []);
                    let totalXpToAward = 0;
                    for (const lessonId of newlyCompleted) {
                        const lesson = lessons.find(l => (l.id || l._id?.toString()) === lessonId);
                        if (lesson && lesson.xp) {
                            totalXpToAward += lesson.xp;
                        }
                    }
                    if (totalXpToAward > 0) {
                        const studentUser = await User.findById(enrollment.userId);
                        if (studentUser) {
                            studentUser.xp = (studentUser.xp || 0) + totalXpToAward;
                            studentUser.level = Math.floor(studentUser.xp / 100) + 1;
                            await studentUser.save();
                        }
                    }
                }
            } catch (xpErr) {
                console.error("Failed to calculate or award secure XP:", xpErr);
            }
        }

        // Record metrics for newly completed lessons (non-blocking)
        for (const _lessonId of newlyCompleted) {
            recordLessonCompleted(enrollment.userId, enrollment.courseId)
                .catch(err => console.error('ML metrics recordLessonCompleted error:', err));
        }

        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const requestUnenrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    // Verify the user owns this enrollment
    if (enrollment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to unenroll from this course" });
    }

    enrollment.refundStatus = 'requested';
    enrollment.refundRequestedAt = new Date();
    enrollment.refundReason = req.body.reason || 'Requested by student';
    await enrollment.save();

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getRefundRequests = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ refundStatus: 'requested' })
      .populate('userId', 'name email')
      .populate('courseId', 'title price instructor');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { id } = req.params; // enrollment ID
    const { action, reason } = req.body; // 'approve' or 'deny'

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    if (action === 'approve') {
      enrollment.refundStatus = 'approved';
      enrollment.refundProcessedAt = new Date();
      await enrollment.save();

      // Decrement enrollmentCount in course atomically, preventing negative values
      await Course.findOneAndUpdate(
        { _id: enrollment.courseId, enrollmentCount: { $gte: 1 } },
        { $inc: { enrollmentCount: -1 } }
      );

      // Delete the Enrollment record on approval to fully unenroll the student
      await Enrollment.findByIdAndDelete(id);
      return res.json({ message: "Refund approved and student unenrolled successfully", enrollmentId: id, status: 'approved' });
    } else if (action === 'deny') {
      enrollment.refundStatus = 'denied';
      enrollment.refundProcessedAt = new Date();
      if (reason) enrollment.refundReason = reason;
      await enrollment.save();
      return res.json(enrollment);
    } else {
      return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'deny'" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
