import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Middleware to validate ObjectId in route params
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: `Invalid ${paramName} format` });
    }
    next();
  };
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'active' });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid course ID format" });
    }
    
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { instructorEmail, instructor, ...courseData } = req.body;
    
    // If the logged-in user is an instructor, force them to be the instructor of the new course
    const email = req.user.role === 'instructor' ? req.user.email : (instructorEmail || instructor?.email);
    
    const instructorUser = await User.findOne({ email: email });
    if (!instructorUser) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const newCourse = new Course({
      ...courseData,
      instructor: {
        name: instructorUser.name,
        email: instructorUser.email,
        bio: instructorUser.bio,
        qualification: instructorUser.title || 'Instructor',
        photoURL: instructorUser.photoURL
      },
      author: {
        name: instructorUser.name,
        email: instructorUser.email
      },
      status: 'pending'
    });

    const saved = await newCourse.save();
    res.status(201).json({ ...saved.toObject(), insertedId: saved._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid course ID format" });
    }
    
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Enforce ownership: instructors can only edit their own courses
    if (req.user.role === 'instructor' && course.instructor?.email !== req.user.email) {
      return res.status(403).json({ message: "Not authorized to update this course. You can only manage your own courses." });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid course ID format" });
    }
    
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Enforce ownership: instructors can only delete their own courses
    if (req.user.role === 'instructor' && course.instructor?.email !== req.user.email) {
      return res.status(403).json({ message: "Not authorized to delete this course. You can only manage your own courses." });
    }

    await Course.findByIdAndDelete(id);
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
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};