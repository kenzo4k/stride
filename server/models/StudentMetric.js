import mongoose from 'mongoose';

const studentMetricSchema = new mongoose.Schema({
  // ML Feature 1: Time window for metrics collection
  window_start: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  // ML Feature 2: Target variable - whether student drops out in next 7 days
  dropout_next_7_days: {
    type: Boolean,
    default: false,
  },
  
  // ML Feature 3: Number of logins in the window
  login_count: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 4: Average session duration in minutes
  session_time_avg: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 5: Number of lessons completed
  lessons_completed: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 6: Total number of lessons in course
  total_lessons: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 7: Average quiz score (0-100)
  quiz_avg_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // ML Feature 8: Average assignment score (0-100)
  assignment_avg_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // ML Feature 9: Total video watch time in minutes
  video_watch_time: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 10: Number of articles read
  articles_read: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 11: Number of coding exercises completed
  coding_exercises_completed: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 12: Days since last activity
  last_active_days_ago: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 13: Current login streak
  streak_days: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 14: Total days active in window
  total_days_active: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // ML Feature 15: Calculated engagement score (0-100)
  engagement_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // ML Feature 16: Risk flag (low, medium, high)
  risk_flag: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  
  // References
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
}, {
  timestamps: true,
});

// Compound index for efficient lookups
studentMetricSchema.index({ studentId: 1, courseId: 1, window_start: 1 }, { unique: true });

// Index for ML queries - find at-risk students
studentMetricSchema.index({ risk_flag: 1, dropout_next_7_days: 1 });

// Helper to calculate engagement score
studentMetricSchema.methods.calculateEngagementScore = function() {
  const lessonProgress = this.total_lessons > 0 
    ? (this.lessons_completed / this.total_lessons) * 30 
    : 0;
  const quizContribution = this.quiz_avg_score * 0.25;
  const assignmentContribution = this.assignment_avg_score * 0.25;
  const activityScore = Math.min(this.login_count / 10, 1) * 20;
  
  this.engagement_score = Math.round(lessonProgress + quizContribution + assignmentContribution + activityScore);
  return this.engagement_score;
};

// Helper to determine risk flag based on engagement
studentMetricSchema.methods.updateRiskFlag = function() {
  const lastActive = this.last_active_days_ago || 0;
  
  // High risk conditions
  if (this.engagement_score < 30 || this.quiz_avg_score < 50 || lastActive > 7 || this.streak_days === 0) {
    this.risk_flag = 'high';
  } else if (this.engagement_score < 60 || this.quiz_avg_score < 70 || lastActive > 3) {
    this.risk_flag = 'medium';
  } else {
    this.risk_flag = 'low';
  }
  return this.risk_flag;
};

// Pre-save hook to auto-calculate metrics
studentMetricSchema.pre('save', function(next) {
  if (this.isModified('login_count') || this.isModified('lessons_completed') || 
      this.isModified('quiz_avg_score') || this.isModified('assignment_avg_score')) {
    this.calculateEngagementScore();
    this.updateRiskFlag();
  }
  next();
});

const StudentMetric = mongoose.model('StudentMetric', studentMetricSchema);
export default StudentMetric;