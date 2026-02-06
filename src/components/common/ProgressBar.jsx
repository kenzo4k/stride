import React from 'react';

const ProgressBar = ({ current, max, label = '', color = 'cyan', height = 'h-3' }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const colorClasses = {
    cyan: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    orange: 'bg-gradient-to-r from-orange-500 to-red-500'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>{label}</span>
          <span>{current} / {max}</span>
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`${colorClasses[color] || colorClasses.cyan} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;