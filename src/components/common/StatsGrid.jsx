import React from 'react';

const StatsGrid = ({ stats }) => {
  const statCards = [
    {
      icon: '📚',
      label: 'Enrolled Courses',
      value: stats.enrolledCourses,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⏳',
      label: 'In Progress',
      value: stats.inProgress,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '✅',
      label: 'Completed',
      value: stats.completed,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '⭐',
      label: 'Current Level',
      value: `Level ${stats.currentLevel} • ${stats.totalXP} XP`,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <div 
          key={index}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-3xl">{card.icon}</span>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
          </div>
          <p className="text-gray-400 text-sm mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
