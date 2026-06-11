import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

// Badge definitions — computed server-side from user data
const BADGE_DEFINITIONS = [
  {
    id: 'first_steps',
    name: 'First Steps',
    iconUrl: '🎯',
    description: 'Enrolled in your first course',
    check: (user, enrollments) => enrollments.length >= 1,
  },
  {
    id: 'course_explorer',
    name: 'Course Explorer',
    iconUrl: '🗺️',
    description: 'Enrolled in 3 or more courses',
    check: (user, enrollments) => enrollments.length >= 3,
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    iconUrl: '🏅',
    description: 'Scored 90% or above on an assessment',
    check: (user, enrollments) => enrollments.some(e => e.grade >= 90),
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    iconUrl: '💯',
    description: 'Achieved a perfect 100% score',
    check: (user, enrollments) => enrollments.some(e => e.grade === 100),
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    iconUrl: '📚',
    description: 'Earned 1,000 XP or more',
    check: (user) => user.xp >= 1000,
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    iconUrl: '⭐',
    description: 'Earned 3,000 XP or more',
    check: (user) => user.xp >= 3000,
  },
  {
    id: 'legend',
    name: 'Legend',
    iconUrl: '👑',
    description: 'Earned 5,000 XP or more',
    check: (user) => user.xp >= 5000,
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    iconUrl: '⚡',
    description: 'Completed a course with 100% progress',
    check: (user, enrollments) => enrollments.some(e => e.progress === 100),
  },
];

export const getLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isPublic: true })
      .sort({ xp: -1 })
      .limit(20)
      .select('name xp level photoURL');

    const leaderboard = students.map(s => ({
      _id: s._id,
      name: s.name,
      points: s.xp, // Frontend expects 'points' field
      level: s.level,
      photoURL: s.photoURL,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/student/badges
export const getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enrollments = await Enrollment.find({ userId: user._id });

    const earnedBadges = BADGE_DEFINITIONS
      .filter(badge => badge.check(user, enrollments))
      .map(badge => ({
        _id: badge.id,
        name: badge.name,
        iconUrl: badge.iconUrl,
        description: badge.description,
      }));

    res.json(earnedBadges);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/users/award-xp
export const awardXP = async (req, res) => {
  try {
    // Allow awarding to self or to a specific userId (for system/admin use)
    const userId = req.body.userId || req.user.id;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid XP amount is required' });
    }

    if (amount > 1000) {
      return res.status(400).json({ message: 'XP award amount exceeds maximum limit of 1000' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.xp = (user.xp || 0) + amount;
    user.level = Math.floor(user.xp / 100) + 1;
    await user.save();

    res.json({
      xp: user.xp,
      level: user.level,
      awarded: amount,
      reason: reason || 'XP awarded',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
