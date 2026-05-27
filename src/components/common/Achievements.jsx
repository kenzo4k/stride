import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ALL_ACHIEVEMENTS = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Enrolled in your first course',
    icon: '🎯',
    xpReward: 50
  },
  {
    id: 'course_explorer',
    name: 'Course Explorer',
    description: 'Enrolled in 3 or more courses',
    icon: '🗺️',
    xpReward: 100
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Scored 90% or above on an assessment',
    icon: '🏅',
    xpReward: 150
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieved a perfect 100% score',
    icon: '💯',
    xpReward: 200
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Earned 1,000 XP or more',
    icon: '📚',
    xpReward: 100
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Earned 3,000 XP or more',
    icon: '⭐',
    xpReward: 200
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Earned 5,000 XP or more',
    icon: '👑',
    xpReward: 500
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Completed a course with 100% progress',
    icon: '⚡',
    xpReward: 250
  }
];

const renderBadgeIcon = (icon) => {
  if (!icon) return null;
  const isPath = icon.includes('/') || icon.includes('.') || icon.startsWith('http') || icon.includes('\\');
  if (isPath) {
    return <img src={icon} alt="badge icon" className="w-10 h-10 object-contain rounded-lg" />;
  }
  return <span className="text-3xl">{icon}</span>;
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.get('/student/badges');
        const earnedBadges = response.data || [];
        
        const updated = ALL_ACHIEVEMENTS.map(ach => {
          const earned = earnedBadges.find(b => b._id === ach.id);
          if (earned) {
            return {
              ...ach,
              icon: earned.iconUrl || ach.icon,
              description: earned.description || ach.description,
              earned: true,
              dateEarned: earned.dateEarned || new Date().toLocaleDateString()
            };
          }
          return {
            ...ach,
            earned: false
          };
        });
        setAchievements(updated);
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
        setAchievements(ALL_ACHIEVEMENTS.map(ach => ({ ...ach, earned: false })));
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-800 rounded-lg border border-gray-700">
        <span className="loading loading-spinner text-cyan-400"></span>
        <span className="text-gray-400 ml-2">Loading achievements...</span>
      </div>
    );
  }

  const earnedAchievements = achievements.filter(ach => ach.earned);
  const totalAchievements = achievements.length;
  const progress = totalAchievements > 0 ? Math.round((earnedAchievements.length / totalAchievements) * 100) : 0;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-cyan-600 transition">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Achievements</h2>
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400 font-bold">{earnedAchievements.length}/{totalAchievements}</span>
          <span className="text-gray-400">completed</span>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              achievement.earned
                ? 'bg-gray-700 border-gray-600 hover:border-cyan-500'
                : 'bg-gray-800 border-gray-700 opacity-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-3xl flex-shrink-0 flex items-center justify-center w-10 h-10">{renderBadgeIcon(achievement.icon)}</div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{achievement.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-cyan-400 font-medium">
                    +{achievement.xpReward} XP
                  </span>
                  {achievement.earned ? (
                    <span className="text-xs text-green-400">
                      Earned
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Locked</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;