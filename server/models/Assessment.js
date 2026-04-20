import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'fill_blank', 'matching', 'true_false'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [String], // For MCQ
  correctAnswer: mongoose.Schema.Types.Mixed, // Index for MCQ, Boolean for true_false
  answer: String, // For fill_blank
  pairs: [{ // For matching
    left: String,
    right: String,
    correct: { type: Boolean, default: true }
  }],
  points: {
    type: Number,
    default: 1,
  }
});

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
});

const assessmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true,
  },
  topics: [topicSchema],
}, {
  timestamps: true,
});

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
