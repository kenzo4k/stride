import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  lessons: [mongoose.Schema.Types.Mixed],
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
