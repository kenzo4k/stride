import React, { useEffect, useState } from 'react';

import { API_BASE_URL } from '../../utils/constants';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch(`${API_BASE_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setLeaders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <span className="loading loading-spinner text-cyan-400"></span>
        <span className="text-gray-400 ml-2">Loading leaderboard...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
        🏆 Leaderboard Standings
      </h2>
      <ol className="space-y-3">
        {leaders.map((user, idx) => {
          let rankBadge = '';
          if (idx === 0) rankBadge = '🥇';
          else if (idx === 1) rankBadge = '🥈';
          else if (idx === 2) rankBadge = '🥉';

          return (
            <li 
              key={user._id} 
              className="flex items-center justify-between p-4 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-cyan-500/30 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 cursor-default"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-400 w-8 flex justify-center">
                  {rankBadge || `#${idx + 1}`}
                </span>
                <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || 'S'
                  )}
                </div>
                <div>
                  <span className="font-semibold text-gray-200 block">{user.name}</span>
                  <span className="text-xs text-gray-500">Level {user.level || 1}</span>
                </div>
              </div>
              <span className="text-cyan-400 font-black">{user.points?.toLocaleString() || 0} XP</span>
            </li>
          );
        })}
        {leaders.length === 0 && (
          <p className="text-gray-400 text-center py-4 italic">No leaders yet. Be the first to earn points!</p>
        )}
      </ol>
    </div>
  );
};

export default Leaderboard;
