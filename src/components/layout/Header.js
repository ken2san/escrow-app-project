import React from 'react';
import { Globe, Bell } from 'lucide-react';

const Header = ({ t, isSidebarOpen, activePage, currentViewMode, toggleViewMode, toggleLanguage, currentLanguage }) => {
  let pageTitle = '';
  if (activePage === 'dashboard') {
    pageTitle =
      currentViewMode === 'client' ? t('dashboard') : t('openProjectsDashboard');
  } else if (activePage === 'newProject' && currentViewMode === 'client') {
    pageTitle = t('newProject');
  } else if (activePage === 'contractReview') {
    pageTitle = t('contractReviewTitle');
  } else if (activePage === 'messages') {
    pageTitle = t('messages');
  } else if (activePage === 'disputes') {
    pageTitle = t('disputes');
  } else if (activePage === 'settings') {
    pageTitle = t('settings');
  }

  return (
    <header
      className="bg-white shadow-sm p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-20 h-16"
      style={{
        paddingLeft: isSidebarOpen
          ? 'calc(16rem + 1rem)'
          : 'calc(5rem + 1rem)',
        transition: 'padding-left 0.3s ease-in-out',
      }}
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-700">
          {pageTitle}
        </h2>
      </div>
      <div className="flex items-center space-x-2 md:space-x-3">
  {/* View mode switch button moved to DashboardPage */}
        <button
          onClick={toggleLanguage}
          className="text-gray-600 hover:text-indigo-600 p-2 rounded-md hover:bg-gray-100 flex items-center text-xs sm:text-sm"
        >
          <Globe size={16} className="mr-1 sm:mr-1.5 flex-shrink-0" />
          {currentLanguage === 'ja' ? 'English' : '日本語'}
        </button>
        <button className="text-gray-500 hover:text-gray-700 relative p-1">
          <Bell size={22} />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;