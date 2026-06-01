import mongoose from 'mongoose';

const timeTrackingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true,
  },
  minutes: {
    type: Number,
    default: 0,
  },
  sessions: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

// Unique index to ensure one tracking record per student per course per day
timeTrackingSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

// Query index for weekly activity across all courses
timeTrackingSchema.index({ studentId: 1, date: 1 });

const TimeTracking = mongoose.model('TimeTracking', timeTrackingSchema);
export default TimeTracking;
