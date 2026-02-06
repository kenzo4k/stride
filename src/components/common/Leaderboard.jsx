import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch('https://course-management-system-server-woad.vercel.app/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading leaderboard...</div>;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-blue-400">Leaderboard</h2>
      <ol className="space-y-2">
        {leaders.map((user, idx) => (
          <li key={user._id} className="flex items-center justify-between">
            <span className="font-medium text-white">{idx + 1}. {user.name}</span>
            <span className="text-blue-300 font-bold">{user.points} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
