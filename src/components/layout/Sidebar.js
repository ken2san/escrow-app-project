import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Home, PlusCircle, MessageSquare, AlertTriangle, Settings, UserCircle, ChevronDown, ChevronUp, LogOut, Coins, History } from 'lucide-react';

const Sidebar = ({ t, isSidebarOpen, setIsSidebarOpen, loggedInUser, currentViewMode, activePage, userPoints, onPurchasePointsClick, onShowPointsHistory }) => {
            <button
              className="w-full flex items-center justify-center mt-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-yellow-200 hover:text-white text-sm font-medium transition shadow-sm border border-gray-600"
              onClick={onShowPointsHistory}
              style={{ minHeight: '40px' }}
            >
              <History className="h-5 w-5 mr-2 text-gray-400" />
              <span>{t('pointsHistory') || 'ポイント履歴'}</span>
            </button>
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  // Helper to get correct path
  const getPath = (page) => {
    if (page === 'dashboard') return '/dashboard';
    if (page === 'newProject') return '/newProject';
    if (page === 'project-overview') return '/project-overview';
    if (page === 'messages') return '/messages';
    if (page === 'disputes') return '/disputes';
    if (page === 'settings') return '/settings';
    return '/';
  };
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
            <h1 className="text-xl font-semibold">{t('appName')}</h1>
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
            <p className="text-sm font-medium">{(i18n.language === 'en' && loggedInUser.name_en) ? loggedInUser.name_en : loggedInUser.name}</p>
            <p className="text-xs text-gray-400">
              {t('currentRoleIs')}{' '}
              {currentViewMode === 'client'
                ? t('userRoleClient')
                : t('userRoleContractor')}
            </p>
            {/* ポイント残高表示 */}
            <p className="text-xs text-yellow-300 mt-2 font-semibold">
              {t('pointsBalance') || 'ポイント残高'}: {userPoints} pt
            </p>
            <button
              className="w-full flex items-center justify-center mt-2 p-2 rounded-md bg-gray-700 hover:bg-indigo-600 text-yellow-200 hover:text-white text-sm font-medium transition shadow-sm border border-gray-600"
              onClick={onPurchasePointsClick}
              style={{ minHeight: '40px' }}
            >
              <Coins className="h-5 w-5 mr-2 text-yellow-300" />
              <span>{t('purchasePoints') || 'ポイント購入'}</span>
            </button>
          </div>
        )}
        {!isSidebarOpen && (
          <UserCircle
            size={28}
            className="mx-auto text-gray-400 mb-2"
            title={`${(i18n.language === 'en' && loggedInUser.name_en) ? loggedInUser.name_en : loggedInUser.name} (${t('currentRoleIs')} ${
              currentViewMode === 'client'
                ? t('userRoleClient')
                : t('userRoleContractor')
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
                  onClick={() => navigate(getPath(item.page))}
                  className={`w-full flex items-center p-2.5 rounded-md hover:bg-gray-700 ${
                    activePage === item.page
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  } ${!isSidebarOpen ? 'justify-center' : ''}`}
                  title={isSidebarOpen ? '' : t(item.nameKey)}
                >
                  {item.icon}
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm">{t(item.nameKey)}</span>
                  )}
                </button>
              </li>
            ))}
        </ul>
        {/* Project Overview button separated visually */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <button
            onClick={() => navigate(getPath('project-overview'))}
            className={`w-full flex items-center p-2.5 rounded-md hover:bg-gray-700 ${
              activePage === 'project-overview'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            } ${!isSidebarOpen ? 'justify-center' : ''}`}
            title={isSidebarOpen ? '' : t('projectOverview')}
          >
            <Briefcase className="h-5 w-5" />
            {isSidebarOpen && (
              <span className="ml-3 text-sm">{t('projectOverview')}</span>
            )}
          </button>
        </div>
      </nav>
      <div className="mt-auto border-t border-gray-700 pt-3">
        <button
          className={`w-full flex items-center p-2.5 rounded-md hover:bg-gray-700 text-gray-300 hover:text-white ${
            !isSidebarOpen ? 'justify-center' : ''
          }`}
          title={isSidebarOpen ? '' : t('logout')}
        >
          <LogOut className="h-5 w-5" />
          {isSidebarOpen && <span className="ml-3 text-sm">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
