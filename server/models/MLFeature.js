import mongoose from 'mongoose';

const mlFeatureSchema = new mongoose.Schema({
  // === References ===
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // === Time Window ===
  window_start: { type: Date, required: true },
  window_end:   { type: Date, required: true },

  // === 12 Raw ML Features ===
  login_count:                  { type: Number, default: 0 },
  days_active:                  { type: Number, default: 0 },
  total_session_time_minutes:   { type: Number, default: 0 },
  avg_session_time_minutes:     { type: Number, default: 0 },
  median_session_time_minutes:  { type: Number, default: 0 },
  lessons_started:              { type: Number, default: 0 },
  lessons_completed:            { type: Number, default: 0 },
  assessments_attempted:        { type: Number, default: 0 },
  avg_assessment_score:         { type: Number, default: 0 },
  num_failed_attempts:          { type: Number, default: 0 },
  num_repeated_attempts:        { type: Number, default: 0 },
  no_improvement_attempts:      { type: Number, default: 0 },

  // === Internal tracking arrays (for computing avg/median) ===
  _session_durations: [Number],       // individual session times in minutes
  _assessment_scores: [Number],       // individual scores
  _assessment_history: [{             // for repeat/improvement tracking
    assessmentId: String,
    score: Number,
    attemptNumber: Number,
    timestamp: Date
  }],
  _active_dates: [String],           // ISO date strings for distinct day counting (YYYY-MM-DD)

  // === ML Prediction Results (written by Python service) ===
  dropout_risk_score:  { type: Number, default: null },  // 0.0-1.0
  dropout_prediction:  { type: Boolean, default: null },
  risk_level:          { type: String, enum: ['low', 'medium', 'high', null], default: null },
  last_prediction_at:  { type: Date, default: null },
  engagement_score: { type: Number, default: 0, min: 0, max: 100 },
  risk_flag: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { timestamps: true });

// One record per student per course per window
mlFeatureSchema.index({ studentId: 1, courseId: 1, window_start: 1 }, { unique: true });
// For querying at-risk students
mlFeatureSchema.index({ dropout_prediction: 1, risk_level: 1 });

const MLFeature = mongoose.model('MLFeature', mlFeatureSchema);
export default MLFeature;
