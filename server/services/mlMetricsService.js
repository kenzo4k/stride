import MLFeature from '../models/MLFeature.js';
import { recordDailyTime } from '../controllers/timeTrackingController.js';

export const getWindowBounds = (date = new Date()) => {
  const now = new Date(date);
  const day = now.getDay();
  // day: 0 (Sun), 1 (Mon), ..., 6 (Sat)
  // If today is Sun (0), we need to go back 6 days to get Mon.
  // Otherwise, we subtract (day - 1) days.
  const window_start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + (day === 0 ? -6 : 1));
  window_start.setHours(0, 0, 0, 0);

  const window_end = new Date(window_start);
  window_end.setDate(window_start.getDate() + 6);
  window_end.setHours(23, 59, 59, 999);
  return { window_start, window_end };
};

export const ensureCurrentWindow = async (studentId, courseId) => {
  const { window_start, window_end } = getWindowBounds();
  
  let doc = await MLFeature.findOne({
    studentId,
    courseId,
    window_start
  });
  
  if (!doc) {
    try {
      doc = await MLFeature.create({
        studentId,
        courseId,
        window_start,
        window_end
      });
    } catch (err) {
      // Handle potential race condition if created concurrently
      doc = await MLFeature.findOne({
        studentId,
        courseId,
        window_start
      });
      if (!doc) throw err;
    }
  }
  return doc;
};

export const recordLogin = async (studentId, courseIds) => {
  if (!courseIds || courseIds.length === 0) return;
  const todayStr = new Date().toISOString().split('T')[0];
  
  const promises = courseIds.map(async (courseId) => {
    const doc = await ensureCurrentWindow(studentId, courseId);
    doc.login_count = (doc.login_count || 0) + 1;
    if (!doc._active_dates.includes(todayStr)) {
      doc._active_dates.push(todayStr);
    }
    doc.days_active = doc._active_dates.length;
    await doc.save();
  });
  
  await Promise.all(promises);
};

export const recordSessionTime = async (studentId, courseId, durationMinutes) => {
  const doc = await ensureCurrentWindow(studentId, courseId);
  doc._session_durations.push(durationMinutes);
  
  const sum = doc._session_durations.reduce((a, b) => a + b, 0);
  doc.total_session_time_minutes = sum;
  doc.avg_session_time_minutes = sum / doc._session_durations.length;
  
  // Compute Median
  const sorted = [...doc._session_durations].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  doc.median_session_time_minutes = sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
    
  // Mark today active as well
  const todayStr = new Date().toISOString().split('T')[0];
  if (!doc._active_dates.includes(todayStr)) {
    doc._active_dates.push(todayStr);
    doc.days_active = doc._active_dates.length;
  }
  
  await doc.save();

  // Also track study time in TimeTracking for dashboard (non-blocking)
  recordDailyTime(studentId, courseId, durationMinutes)
    .catch(err => console.error('TimeTracking recordDailyTime error:', err));

  return doc;
};

export const recordLessonStarted = async (studentId, courseId) => {
  const doc = await ensureCurrentWindow(studentId, courseId);
  doc.lessons_started = (doc.lessons_started || 0) + 1;
  await doc.save();
};

export const recordLessonCompleted = async (studentId, courseId) => {
  const doc = await ensureCurrentWindow(studentId, courseId);
  doc.lessons_completed = (doc.lessons_completed || 0) + 1;
  await doc.save();
};

export const recordAssessmentAttempt = async (studentId, courseId, score, assessmentId) => {
  const doc = await ensureCurrentWindow(studentId, courseId);
  
  doc.assessments_attempted = (doc.assessments_attempted || 0) + 1;
  doc._assessment_scores.push(score);
  
  const sum = doc._assessment_scores.reduce((a, b) => a + b, 0);
  doc.avg_assessment_score = sum / doc._assessment_scores.length;
  
  if (score < 50) {
    doc.num_failed_attempts = (doc.num_failed_attempts || 0) + 1;
  }
  
  const prevAttempts = doc._assessment_history.filter(h => h.assessmentId === assessmentId);
  if (prevAttempts.length > 0) {
    doc.num_repeated_attempts = (doc.num_repeated_attempts || 0) + 1;
    const maxPrevScore = Math.max(...prevAttempts.map(h => h.score));
    if (score <= maxPrevScore) {
      doc.no_improvement_attempts = (doc.no_improvement_attempts || 0) + 1;
    }
  }
  
  doc._assessment_history.push({
    assessmentId,
    score,
    attemptNumber: prevAttempts.length + 1,
    timestamp: new Date()
  });
  
  await doc.save();
};
