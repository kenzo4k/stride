import CourseContent from '../models/CourseContent.js';
import Course from '../models/Course.js';

// GET /api/courses/:courseId/content
export const getContent = async (req, res) => {
  try {
    const content = await CourseContent.findOne({ courseId: req.params.courseId });
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
    if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit content for your own courses' });
    }

    const content = await CourseContent.findOneAndUpdate(
      { courseId },
      { courseId, sections },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
