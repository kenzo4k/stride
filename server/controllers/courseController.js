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
    const courses = await Course.find({ status: 'active' }).populate('instructor', 'name email photoURL');
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
    
    const course = await Course.findById(id).populate('instructor', 'name email photoURL');
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
    
    const course = await Course.findByIdAndUpdate(
      id,
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
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid course ID format" });
    }
    
    const course = await Course.findByIdAndDelete(id);
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