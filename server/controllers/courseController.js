import Course from '../models/Course.js';
import User from '../models/User.js';

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'active' }).populate('instructor', 'name email photoURL');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email photoURL');
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { instructorEmail, instructor, ...courseData } = req.body;
    
    const email = instructorEmail || instructor?.email;
    
    const instructorUser = await User.findOne({ email: email });
    if (!instructorUser) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const newCourse = new Course({
      ...courseData,
      instructor: instructorUser._id,
      status: 'pending' // New courses are pending by default
    });

    const saved = await newCourse.save();
    res.status(201).json({ ...saved.toObject(), insertedId: saved._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getCoursesByCategory = async (req, res) => {
  try {
    const courses = await Course.find({ 
        category: req.params.category,
        status: 'active' 
    }).populate('instructor', 'name email photoURL');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
