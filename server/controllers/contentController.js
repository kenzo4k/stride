import CourseContent from '../models/CourseContent.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// GET /api/courses/:courseId/content
export const getContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is admin, the course instructor, or enrolled
    const isInstructor = course.instructorId 
      ? course.instructorId.toString() === req.user.id
      : course.instructor?.email === req.user.email;

    const isEnrolled = await Enrollment.findOne({
      userId: req.user.id,
      courseId: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (req.user.role !== 'admin' && !isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied. You must be enrolled in this course to view its content.' });
    }

    const content = await CourseContent.findOne({ courseId });
    if (!content) {
      return res.status(404).json({ message: 'No content found for this course' });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/courses/:courseId/content
export const upsertContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sections } = req.body;

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify instructor owns this course (skip for admin)
    const isOwner = course.instructorId 
      ? course.instructorId.toString() === req.user.id
      : course.instructor?.email === req.user.email;

    if (req.user.role === 'instructor' && !isOwner) {
      return res.status(403).json({ message: 'You can only edit content for your own courses' });
    }

    const content = await CourseContent.findOneAndUpdate(
      { courseId },
      { courseId, sections },
      { new: true, upsert: true }
    );

    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
