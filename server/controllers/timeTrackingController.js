import TimeTracking from '../models/TimeTracking.js';

/**
 * Record study minutes for a specific student, course, and day.
 * Upserts a TimeTracking document and increments the minutes and session counts.
 */
export const recordDailyTime = async (studentId, courseId, minutes) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    
    await TimeTracking.findOneAndUpdate(
      { studentId, courseId, date: today },
      { 
        $inc: { minutes: minutes, sessions: 1 } 
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Error recording daily study time:', err);
  }
};

/**
 * Get weekly activity (study time in minutes) for a student across all courses.
 * Groups by date for the last 7 days.
 */
export const getWeeklyActivity = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Generate dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    
    // Find all time tracking records for this student in the last 7 days
    const records = await TimeTracking.find({
      studentId: studentId,
      date: { $in: dates }
    });
    
    // Group records by date
    const timeMap = {};
    records.forEach(r => {
      timeMap[r.date] = (timeMap[r.date] || 0) + r.minutes;
    });
    
    // Convert to the format expected by the frontend chart: [{ date: 'YYYY-MM-DD', day: 'Mon', minutes: Number }]
    const weeklyData = dates.map(date => {
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date,
        day: dayName,
        minutes: timeMap[date] || 0
      };
    });
    
    res.json(weeklyData);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
