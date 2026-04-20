import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, studentEmail } = req.body;
    
    const student = await User.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId: student._id, courseId: course._id });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    const enrollment = new Enrollment({
      userId: student._id,
      courseId: course._id,
    });

    await enrollment.save();

    // Increment enrollment count in course
    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    await course.save();

    // Add to user's enrolledCourses
    student.enrolledCourses.push(course._id);
    await student.save();

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const { email } = req.query; // Simplification for now
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const enrollments = await Enrollment.find({ userId: user._id })
      .populate('courseId');
    
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProgress = async (req, res) => {
    try {
        const { progress, completedLessons, grade } = req.body;
        const enrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            { progress, completedLessons, grade },
            { new: true }
        );
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}
