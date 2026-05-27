import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get('/student/badges');
        setBadges(response.data);
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <span className="loading loading-spinner text-cyan-400"></span>
        <span className="text-gray-400 ml-2">Loading achievements…</span>
      </div>
    );
  }

  if (!badges.length) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 text-center text-gray-400">
        No badges earned yet. Complete lessons and quizzes to earn achievements!
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 p-6 mb-8 shadow-xl">
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
        🏆 My Achievements
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map(badge => (
          <div 
            key={badge._id} 
            className="group flex flex-col items-center bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-yellow-500/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5 cursor-default"
            title={badge.description}
          >
            <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl mb-3 shadow-inner group-hover:scale-110 transition-transform duration-300">
              {badge.iconUrl}
            </div>
            <span className="text-sm font-semibold text-gray-200 text-center line-clamp-1 mb-1">{badge.name}</span>
            <span className="text-[10px] text-gray-500 text-center line-clamp-2 leading-tight">{badge.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Badges;
