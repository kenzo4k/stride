import React, { useEffect, useState } from 'react';

const Badges = ({ userEmail }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    // Replace with your actual API endpoint
    fetch(`https://course-management-system-server-woad.vercel.app/api/student/badges?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        setBadges(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userEmail]);

  if (loading) return <div className="text-gray-400">Loading badges...</div>;
  if (!badges.length) return <div className="text-gray-400">No badges earned yet.</div>;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-yellow-400">My Badges</h2>
      <div className="flex flex-wrap gap-3">
        {badges.map(badge => (
          <div key={badge._id} className="flex flex-col items-center bg-gray-700 rounded p-2 w-24">
            <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 mb-1" />
            <span className="text-xs text-white font-medium text-center">{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Badges;
