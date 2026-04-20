import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['article', 'video', 'pdf', 'quiz', 'coding'],
    required: true,
  },
  content: {
    type: String, // HTML for article, URL for video/pdf
  },
  xp: {
    type: Number,
    default: 10,
  },
  questions: [mongoose.Schema.Types.Mixed], // For quiz type
  exercise: mongoose.Schema.Types.Mixed, // For coding type
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  lessons: [lessonSchema],
});

const courseContentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true,
  },
  sections: [sectionSchema],
}, {
  timestamps: true,
});

const CourseContent = mongoose.model('CourseContent', courseContentSchema);
export default CourseContent;
