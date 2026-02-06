import React from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';

const ProgressCard = ({ 
  title, 
  progress, 
  lessons, 
  lastAccessed, 
  image,
  category,
  level,
  actionText = 'Continue',
  onAction 
}) => {
  const handleImageError = (e) => {
    e.target.src = FALLBACK_IMAGE;
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-cyan-600 transition group flex flex-col h-full shadow-lg hover:shadow-cyan-900/20">
      <div className="flex flex-col h-full">
        <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
          <img 
            src={image || FALLBACK_IMAGE} 
            alt={title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {(category || level) && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {category && (
                <span className="px-2 py-1 bg-cyan-500/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider rounded">
                  {category}
                </span>
              )}
              {level && (
                <span className="px-2 py-1 bg-indigo-500/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider rounded">
                  {level}
                </span>
              )}
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">{title}</h3>
        
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Progress</span>
            <span className="text-cyan-400 font-medium">{progress}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {lessons && (
            <p className="text-sm text-gray-400">{lessons}</p>
          )}
          
          {lastAccessed && (
            <p className="text-xs text-gray-500">Last accessed: {lastAccessed}</p>
          )}
        </div>
        
        {onAction && (
          <button 
            onClick={onAction}
            className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none mt-4 w-full"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
