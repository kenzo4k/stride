import React from 'react';

const AnalyticsChart = ({ data, type = 'bar', title, maxValue }) => {
  if (type === 'bar') {
    const max = maxValue || Math.max(...data.map(item => item.count));
    
    return (
      <div className="space-y-4">
        {title && <h3 className="text-lg font-medium text-gray-200">{title}</h3>}
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.count / max) * 100;
            const colorClasses = {
              blue: 'bg-blue-500',
              cyan: 'bg-cyan-500',
              yellow: 'bg-yellow-500',
              red: 'bg-red-500',
              green: 'bg-green-500',
              purple: 'bg-purple-500',
              orange: 'bg-orange-500'
            };

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 font-medium">{item.grade || item.label}</span>
                  <span className="text-gray-400">{item.count} students</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${colorClasses[item.color] || 'bg-blue-500'} rounded-full flex items-center justify-end px-3 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-medium text-white">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'progress') {
    return (
      <div className="space-y-2">
        {title && <h3 className="text-sm font-medium text-gray-400">{title}</h3>}
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center transition-all duration-500"
            style={{ width: `${data.percentage}%` }}
          >
            <span className="text-xs font-medium text-white">{data.percentage}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">{data.label}</p>
      </div>
    );
  }

  return null;
};

export default AnalyticsChart;
