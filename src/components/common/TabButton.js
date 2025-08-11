import React from 'react';


const TabButton = ({ title, isActive, onClick, icon }) => {
  // Fallback for missing title
  const safeTitle = typeof title === 'string' && title.trim() !== '' ? title : ' ';
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isActive
          ? 'border-indigo-500 text-indigo-600 bg-white'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white'
      }`}
      type="button"
      tabIndex={0}
    >
      {icon && React.cloneElement(icon, { size: 16, className: 'mr-2' })}
      <span className="whitespace-nowrap">{safeTitle}</span>
    </button>
  );
};

export default TabButton;