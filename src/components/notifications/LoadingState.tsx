
import React from 'react';

const LoadingState = () => {
  return (
    <div className="glass-card dark:bg-gray-800 dark:border-gray-700 p-8 text-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-axiv-light-gray dark:bg-gray-700 rounded-full mb-4"></div>
        <div className="h-5 bg-axiv-light-gray dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-axiv-light-gray dark:bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-axiv-light-gray dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export default LoadingState;
