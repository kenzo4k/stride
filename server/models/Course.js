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
    name: { type: String, required: true },
    email: { type: String, required: true },
    bio: String,
    qualification: String,
    photoURL: String,
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  author: {
    name: String,
    email: String,
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
  topics: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected', 'draft', 'published', 'archived'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

courseSchema.index({ status: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ 'instructor.email': 1 });
courseSchema.index({ instructorId: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;
