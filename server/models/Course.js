import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  short_description: {
    type: String,
  },
  detailed_description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  discount_price: {
    type: Number,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  enrollmentCount: {
    type: Number,
    default: 0,
  },
  seats: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  language: {
    type: String,
    default: 'English',
  },
  duration: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  completion_certificate: {
    type: Boolean,
    default: true,
  },
  prerequisites: [String],
  learning_outcomes: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
