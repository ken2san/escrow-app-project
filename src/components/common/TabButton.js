import React from 'react';

const TabButton = ({ title, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 ${
      isActive
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {React.cloneElement(icon, { size: 16, className: 'mr-2' })}
    {title}
  </button>
);

export default TabButton;