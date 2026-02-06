// src/components/common/StatsCard.jsx
import React from 'react';
import { Card } from '../ui';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend = null,
  size = 'md' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  const bgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100'
  };

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <Card hover={true} className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-gray-900 ${size === 'lg' ? 'text-3xl' : ''}`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-1">
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${bgColors[color]}`}>
          <Icon className={`w-6 h-6 ${textColors[color]}`} />
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClasses[color]}`}></div>
    </Card>
  );
};

export default StatsCard;
