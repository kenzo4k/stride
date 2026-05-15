import React from 'react';
import XPCounter from '../components/common/XPCounter';
import Achievements from '../components/common/Achievements';
import useAuth from '../hooks/useAuth';

const AchievementsPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Achievements</h1>
          <p className="text-gray-400">Track your learning progress and unlock rewards</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <XPCounter xp={user?.xp || 0} />
          </div>
          <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Gamification Stats</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                You are currently Level <span className="font-bold text-cyan-400">{user?.level || 1}</span> with <span className="font-bold text-cyan-400">{user?.xp || 0} XP</span>.
              </p>
              <p className="text-gray-300">
                You're on a <span className="font-bold text-purple-400">{user?.streakDays || 1} Day</span> learning streak! Keep logging in daily to maintain it.
              </p>
            </div>
          </div>
        </div>

        <Achievements />
      </div>
    </div>
  );
};

export default AchievementsPage;