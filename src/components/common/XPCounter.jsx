import React from 'react';

const XPCounter = ({ xp = 450, compact = false }) => {
  const currentLevel = Math.floor(xp / 100);
  const xpInCurrentLevel = xp - (currentLevel * 100);
  const progressToNextLevel = Math.round((xpInCurrentLevel / 100) * 100);

  if (compact) {
    return (
      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 rounded-lg">
        <span className="text-white text-sm font-bold">{xp.toLocaleString()} XP</span>
        <span className="text-white text-xs">|</span>
        <span className="text-white text-sm font-medium">Level {currentLevel}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-xl font-bold text-white">Level {currentLevel}</h3>
          <p className="text-3xl font-bold text-cyan-400 mt-1">{xp.toLocaleString()} XP</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">{currentLevel}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Progress to Level {currentLevel + 1}</span>
          <span>{xpInCurrentLevel} / 100 XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm text-gray-400">
          {100 - xpInCurrentLevel} XP needed for next level
        </p>
      </div>
    </div>
  );
};

export default XPCounter;