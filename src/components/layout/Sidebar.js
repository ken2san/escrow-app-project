import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Home, PlusCircle, MessageSquare, AlertTriangle, Settings, UserCircle, ChevronDown, ChevronUp, LogOut, Coins, History } from 'lucide-react';
import WalletInfo from '../common/WalletInfo';

const Sidebar = ({ t, isSidebarOpen, setIsSidebarOpen, loggedInUser, currentViewMode, activePage, userPoints, onPurchasePointsClick, onShowPointsHistory, onSendPointsClick, onReceivePointsClick }) => {
            <>
              <button
                className="w-full flex items-center justify-center mt-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-yellow-200 hover:text-white text-sm font-medium transition shadow-sm border border-gray-600"
                onClick={onShowPointsHistory}
                style={{ minHeight: '40px' }}
              >
                <History className="h-5 w-5 mr-2 text-gray-400" />
                <span>{t('pointsHistory') || 'ポイント履歴'}</span>
              </button>
              <button
                className="w-full flex items-center justify-center mt-2 p-2 rounded-md bg-gray-700 hover:bg-green-600 text-green-200 hover:text-white text-sm font-medium transition shadow-sm border border-gray-600"
                onClick={onSendPointsClick}
                style={{ minHeight: '40px' }}
              >
                <Coins className="h-5 w-5 mr-2 text-green-300" />
                <span>{t('sendPoints') || 'ポイント送信'}</span>
              </button>
              <button
                className="w-full flex items-center justify-center mt-2 p-2 rounded-md bg-gray-700 hover:bg-blue-600 text-blue-200 hover:text-white text-sm font-medium transition shadow-sm border border-gray-600"
                onClick={onReceivePointsClick}
                style={{ minHeight: '40px' }}
              >
                <Coins className="h-5 w-5 mr-2 text-blue-300" />
                <span>{t('receivePoints') || 'ポイント受取'}</span>
              </button>
            </>
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
      <div className="pt-4 mb-4">
        {isSidebarOpen && (
          <div className="sidebar-user-info bg-gray-800/90 rounded-2xl p-5 mb-6 flex flex-col items-center gap-3 shadow-xl border border-gray-700">
            <UserCircle
              size={48}
              className="mx-auto mb-1 text-gray-400"
            />
            <p className="text-base font-semibold mt-1">{(i18n.language === 'en' && loggedInUser.name_en) ? loggedInUser.name_en : loggedInUser.name}</p>
            <p className="text-xs text-gray-400 mb-1">
              {t('currentRoleIs')}{' '}
              {currentViewMode === 'client'
                ? t('userRoleClient')
                : t('userRoleContractor')}
            </p>
            <p className="text-xs text-yellow-300 font-semibold">
              {t('pointsBalance') || 'ポイント残高'}: {userPoints} pt
            </p>
            <WalletInfo
              walletAddress="0x1234...abcd"
              onChainBalance="1,234.56"
              unit="PT"
              onSync={() => alert(t('syncing') || '同期中...')}
              onCopy={(addr) => navigator.clipboard.writeText(addr)}
              syncing={false}
            />
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                className="w-full flex items-center justify-center p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-yellow-100 hover:text-white text-sm font-medium transition shadow-sm border border-indigo-700"
                onClick={onPurchasePointsClick}
                style={{ minHeight: '40px' }}
              >
                <Coins className="h-5 w-5 mr-2 text-yellow-300" />
                <span>{t('purchasePoints') || 'ポイント購入'}</span>
              </button>
              <DropdownPointsActions
                t={t}
                onShowPointsHistory={onShowPointsHistory}
                onSendPointsClick={onSendPointsClick}
                onReceivePointsClick={onReceivePointsClick}
              />
            </div>
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
        <div className="bg-gray-800/80 rounded-2xl shadow-lg border border-gray-700 px-2 py-4 mb-4">
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


// ドロップダウン式ポイント操作ボタン群

function DropdownPointsActions({ t, onShowPointsHistory, onSendPointsClick, onReceivePointsClick }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative w-full">
      <button
        className="w-full flex items-center justify-center p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-yellow-200 hover:text-white text-sm font-medium transition shadow-sm border border-gray-600"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ minHeight: '40px' }}
      >
        <History className="h-5 w-5 mr-2 text-gray-400" />
        <span>{t('pointsActions') || 'ポイント操作'}</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-900 rounded-lg shadow-lg py-2 z-20 animate-fade-in flex flex-col gap-1 border border-gray-700">
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-md transition"
            onClick={() => { setOpen(false); onShowPointsHistory(); }}
          >
            <History className="h-4 w-4 mr-2 text-gray-400" />
            {t('pointsHistory') || 'ポイント履歴'}
          </button>
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-green-200 hover:bg-gray-800 rounded-md transition"
            onClick={() => { setOpen(false); onSendPointsClick(); }}
          >
            <Coins className="h-4 w-4 mr-2 text-green-300" />
            {t('sendPoints') || 'ポイント送信'}
          </button>
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-800 rounded-md transition"
            onClick={() => { setOpen(false); onReceivePointsClick(); }}
          >
            <Coins className="h-4 w-4 mr-2 text-blue-300" />
            {t('receivePoints') || 'ポイント受取'}
          </button>
        </div>
      )}
    </div>
  );
}
