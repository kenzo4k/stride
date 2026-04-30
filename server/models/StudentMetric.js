import mongoose from 'mongoose';

const studentMetricSchema = new mongoose.Schema({
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
  loginCount: {
    type: Number,
    default: 0,
  },
  sessionTime: {
    type: Number, // in minutes
    default: 0,
  },
  lessonsCompleted: {
    type: Number,
    default: 0,
  },
  totalLessons: {
    type: Number,
    default: 0,
  },
  quizScores: [{
    type: Number,
    min: 0,
    max: 100,
  }],
  averageQuizScore: {
    type: Number,
    default: 0,
  },
  assignmentsCompleted: {
    type: Number,
    default: 0,
  },
  totalAssignments: {
    type: Number,
    default: 0,
  },
  assignmentScores: [{
    type: Number,
    min: 0,
    max: 100,
  }],
  averageAssignmentScore: {
    type: Number,
    default: 0,
  },
  videoWatchTime: {
    type: Number, // in minutes
    default: 0,
  },
  articlesRead: {
    type: Number,
    default: 0,
  },
  codingExercisesCompleted: {
    type: Number,
    default: 0,
  },
  totalCodingExercises: {
    type: Number,
    default: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  streakDays: {
    type: Number,
    default: 0,
  },
  totalDaysActive: {
    type: Number,
    default: 0,
  },
  engagementScore: {
    type: Number,
    default: 0, // Calculated metric: combination of activity, scores, etc.
  },
  riskFlag: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
}, {
  timestamps: true,
});

// Compound index for efficient lookups
studentMetricSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Method to calculate engagement score
studentMetricSchema.methods.calculateEngagementScore = function() {
  const lessonScore = this.totalLessons > 0 
    ? (this.lessonsCompleted / this.totalLessons) * 30 
    : 0;
  const quizScore = this.averageQuizScore * 0.25;
  const assignmentScore = this.averageAssignmentScore * 0.25;
  const activityScore = Math.min(this.loginCount / 10, 1) * 20;
  
  this.engagementScore = Math.round(lessonScore + quizScore + assignmentScore + activityScore);
  return this.engagementScore;
};

// Method to update risk flag
studentMetricSchema.methods.updateRiskFlag = function() {
  if (this.engagementScore < 30 || this.averageQuizScore < 50) {
    this.riskFlag = 'high';
  } else if (this.engagementScore < 60 || this.averageQuizScore < 70) {
    this.riskFlag = 'medium';
  } else {
    this.riskFlag = 'low';
  }
  return this.riskFlag;
};

const StudentMetric = mongoose.model('StudentMetric', studentMetricSchema);
export default StudentMetric;