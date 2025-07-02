import React from 'react';
import { Briefcase, Home, PlusCircle, MessageSquare, AlertTriangle, Settings, UserCircle, ChevronDown, ChevronUp, LogOut } from 'lucide-react';

const Sidebar = ({ t, isSidebarOpen, setIsSidebarOpen, loggedInUser, currentViewMode, activePage, setActivePage }) => {
  return (
    <div
      className={`bg-gray-800 text-white ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } p-4 space-y-4 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-30`}
    >
      <div className="flex items-center justify-between mb-2">
        {isSidebarOpen && (
          <div className="flex items-center">
            <Briefcase className="h-7 w-7 mr-2 text-indigo-400" />
            <h1 className="text-xl font-semibold">{t.appName}</h1>
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded-md hover:bg-gray-700"
        >
          {isSidebarOpen ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>
      <div className="border-t border-gray-700 pt-4 mb-4">
        {isSidebarOpen && (
          <div className="text-center mb-2">
            <UserCircle
              size={isSidebarOpen ? 48 : 28}
              className="mx-auto mb-1 text-gray-400"
            />
            <p className="text-sm font-medium">{loggedInUser.name}</p>
            <p className="text-xs text-gray-400">
              {t.currentRoleIs}{' '}
              {currentViewMode === 'client'
                ? t.userRoleClient
                : t.userRoleContractor}
            </p>
          </div>
        )}
        {!isSidebarOpen && (
          <UserCircle
            size={28}
            className="mx-auto text-gray-400 mb-2"
            title={`${loggedInUser.name} (${t.currentRoleIs} ${
              currentViewMode === 'client'
                ? t.userRoleClient
                : t.userRoleContractor
            })`}
          />
        )}
      </div>
      <nav className="flex-grow">
        <ul>
          {[
            {
              nameKey: 'dashboard',
              icon: <Home className="h-5 w-5" />,
              page: 'dashboard',
            },
            currentViewMode === 'client'
              ? {
                  nameKey: 'newProject',
                  icon: <PlusCircle className="h-5 w-5" />,
                  page: 'newProject',
                }
              : null,
            {
              nameKey: 'messages',
              icon: <MessageSquare className="h-5 w-5" />,
              page: 'messages',
            },
            {
              nameKey: 'disputes',
              icon: <AlertTriangle className="h-5 w-5" />,
              page: 'disputes',
            },
            {
              nameKey: 'settings',
              icon: <Settings className="h-5 w-5" />,
              page: 'settings',
            },
          ]
            .filter(Boolean)
            .map((item) => (
              <li key={item.nameKey} className="mb-1.5">
                <button
                  onClick={() => setActivePage(item.page)}
                  className={`w-full flex items-center p-2.5 rounded-md hover:bg-gray-700 ${
                    activePage === item.page
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  } ${!isSidebarOpen ? 'justify-center' : ''}`}
                  title={isSidebarOpen ? '' : t[item.nameKey]}
                >
                  {item.icon}
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm">{t[item.nameKey]}</span>
                  )}
                </button>
              </li>
            ))}
        </ul>
      </nav>
      <div className="mt-auto border-t border-gray-700 pt-3">
        <button
          className={`w-full flex items-center p-2.5 rounded-md hover:bg-gray-700 text-gray-300 hover:text-white ${
            !isSidebarOpen ? 'justify-center' : ''
          }`}
          title={isSidebarOpen ? '' : t.logout}
        >
          <LogOut className="h-5 w-5" />
          {isSidebarOpen && <span className="ml-3 text-sm">{t.logout}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
