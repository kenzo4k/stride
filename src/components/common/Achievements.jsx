import React from 'react';

const sampleAchievements = [
  {
    id: 1,
    name: 'First Course',
    description: 'Enroll in your first course',
    icon: '🎓',
    earned: true,
    dateEarned: '2024-01-15',
    xpReward: 50
  },
  {
    id: 2,
    name: 'Quiz Master',
    description: 'Complete 5 quizzes with 80% or higher',
    icon: '🏆',
    earned: true,
    dateEarned: '2024-01-18',
    xpReward: 100
  },
  {
    id: 3,
    name: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: '💯',
    earned: true,
    dateEarned: '2024-01-20',
    xpReward: 75
  },
  {
    id: 4,
    name: '100 XP Earned',
    description: 'Earn your first 100 XP',
    icon: '⭐',
    earned: true,
    dateEarned: '2024-01-22',
    xpReward: 25
  },
  {
    id: 5,
    name: 'Speed Runner',
    description: 'Complete a lesson in under 5 minutes',
    icon: '⚡',
    earned: true,
    dateEarned: '2024-01-25',
    xpReward: 50
  },
  {
    id: 6,
    name: 'Course Completer',
    description: 'Complete your first course',
    icon: '🎯',
    earned: false,
    xpReward: 150
  }
];

const Achievements = () => {
  const earnedAchievements = sampleAchievements.filter(ach => ach.earned);
  const totalAchievements = sampleAchievements.length;
  const progress = Math.round((earnedAchievements.length / totalAchievements) * 100);

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
        {sampleAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              achievement.earned
                ? 'bg-gray-700 border-gray-600 hover:border-cyan-500'
                : 'bg-gray-800 border-gray-700 opacity-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-3xl flex-shrink-0">{achievement.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{achievement.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-cyan-400 font-medium">
                    +{achievement.xpReward} XP
                  </span>
                  {achievement.earned ? (
                    <span className="text-xs text-green-400">
                      Earned: {new Date(achievement.dateEarned).toLocaleDateString()}
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