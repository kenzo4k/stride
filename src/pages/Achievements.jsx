import React from 'react';
import XPCounter from '../components/common/XPCounter';
import Achievements from '../components/common/Achievements';

const AchievementsPage = () => {
  const [xp] = React.useState(450);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Achievements</h1>
          <p className="text-gray-400">Track your learning progress and unlock rewards</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <XPCounter xp={xp} />
          </div>
          <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-cyan-600 transition">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="text-white font-medium">Completed "Introduction to React"</p>
                    <p className="text-gray-400 text-sm">2 hours ago</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">+25 XP</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-white font-medium">Achieved "Quiz Master"</p>
                    <p className="text-gray-400 text-sm">1 day ago</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">🏅</span>
              </div>
            </div>
          </div>
        </div>

        <Achievements />
      </div>
    </div>
  );
};

export default AchievementsPage;