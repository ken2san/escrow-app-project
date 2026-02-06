import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProjectCard from '../components/dashboard/ProjectCard';
import { Search, Filter, PlusCircle, Briefcase, Zap, ListChecks, History, Repeat } from 'lucide-react';
import TabButton from '../components/common/TabButton';

import { dashboardAllProjects } from '../utils/initialData';

const DashboardPage = ({
  projects,
  searchTerm,
  setSearchTerm,
  currentViewMode,
  loggedInUser,
  handleProjectClick,
  selectedProjectId,
  setActivePage,
  // toggleViewMode,
  // currentLanguage,
  // toggleLanguage,
  ...props
}) => {
  const { t } = useTranslation();
  const [activeDashboardTab, setActiveDashboardTab] = useState(
    currentViewMode === 'contractor' ? 'recommended' : 'my_tasks'
  );

  const navigate = useNavigate();

  useEffect(() => {
    setActiveDashboardTab(
      currentViewMode === 'contractor' ? 'recommended' : 'my_tasks'
    );
  }, [currentViewMode]);

  // Use dashboardAllProjects when props.projects is not provided
  // Fallback for loggedInUser and searchTerm
  const safeLoggedInUser = loggedInUser || { id: '', name: '' };
  const safeSearchTerm = typeof searchTerm === 'string' ? searchTerm : '';
  // Note: avoid debug logging in production UI
  const projectsData = projects && Array.isArray(projects) ? projects : dashboardAllProjects;
  const projectsToDisplay = (() => {
    const normalizedSearchTerm = safeSearchTerm.toLowerCase().trim();
    if (currentViewMode === 'client') {
      const clientProjects = projectsData.filter(p => p.clientId === safeLoggedInUser.id);
      if (!normalizedSearchTerm) return clientProjects;
      return clientProjects.filter(
        (project) =>
          project.name?.toLowerCase().includes(normalizedSearchTerm) ||
          project.contractorName?.toLowerCase().includes(normalizedSearchTerm) ||
          project.description?.toLowerCase().includes(normalizedSearchTerm)
      );
    } else {
      const allProjects = projectsData;
      const filterBySearch = (list) => {
        if (!normalizedSearchTerm) return list;
        return list.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(normalizedSearchTerm)) ||
            (p.description && p.description.toLowerCase().includes(normalizedSearchTerm)) ||
            (p.clientName && p.clientName.toLowerCase().includes(normalizedSearchTerm))
        );
      };

      let aiRecommendedProjects = filterBySearch(
        allProjects
          .filter(
            (p) =>
              p.aiRecommendationScore &&
              p.aiRecommendationScore > 0.7 &&
              p.status === '募集中' &&
              p.clientId !== safeLoggedInUser.id
          )
          .sort((a, b) => b.aiRecommendationScore - a.aiRecommendationScore)
      );

      let openForProposals = filterBySearch(
        allProjects.filter(
          (p) =>
            p.status === '募集中' &&
            p.clientId !== safeLoggedInUser.id &&
            !p.proposals?.some(
              (prop) =>
                prop.contractorId === safeLoggedInUser.id &&
                prop.status !== 'archived'
            )
        )
      );

      let myPendingProposals = filterBySearch(
        allProjects.filter(
          (p) =>
            p.status === '募集中' &&
            p.proposals?.some(
              (prop) =>
                prop.contractorId === safeLoggedInUser.id &&
                prop.status === 'pending_review'
            )
        )
      );

      let activeContracts = filterBySearch(
        allProjects.filter(
          (p) =>
            p.contractorId === safeLoggedInUser.id &&
            ([t('statusInProgress'), t('statusWorkReady'), t('agreementPending'), t('statusInDispute')].includes(p.status))
        )
      ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      let completedContracts = filterBySearch(
        allProjects.filter(
          (p) => p.contractorId === safeLoggedInUser.id && p.status === '完了'
        )
      );

      return {
        aiRecommendedProjects,
        openForProposals,
        myPendingProposals,
        activeContracts,
        completedContracts,
      };
    }
  })();

  // Fix: only render title and cards when the list is not empty
  const renderProjectList = (list, title, isRecommended = false) => {
    if (!list || list.length === 0) {
      return null;
    }
    // Use a no-op if handleProjectClick is undefined
    const safeHandleProjectClick = typeof handleProjectClick === 'function' ? handleProjectClick : () => {};
    return (
      <>
        {title && (
          <h3 className="text-xl font-semibold text-slate-800 mb-4 mt-6 first:mt-0 col-span-full flex items-center">
            {isRecommended && <Zap size={20} className="mr-2 text-indigo-400" />}
            {title}
          </h3>
        )}
        {list.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={(project, forceSelect) => safeHandleProjectClick(project, forceSelect)}
            isSelected={selectedProjectId === project.id}
            currentUser={loggedInUser}
            t={t}
            currentViewMode={currentViewMode}
            isRecommendedCard={isRecommended}
            setActivePage={setActivePage}
            navigate={navigate}
            {...props}
          />
        ))}
      </>
    );
  } // ← renderProjectList ends here

  // Fix: component for displaying the "no projects" message
  const NoProjectsMessage = () => (
    <div className="text-center py-10 col-span-full">
      <Briefcase size={40} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-500">{t('noProjectsFound')}</p>
    </div>
  );

  // Use i18n for role switch button text
  const roleSwitchButtonText = currentViewMode === 'client' ? t('viewAsContractor') : t('viewAsClient');

  // Mode switch handler: update mode, then navigate
  const handleModeSwitch = () => {
    if (typeof props.setCurrentViewMode === 'function') {
      const nextMode = currentViewMode === 'client' ? 'contractor' : 'client';
      props.setCurrentViewMode(nextMode);
      setTimeout(() => navigate('/dashboard'), 0);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-80 shadow-sm bg-white text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>
        <div className="flex items-center space-x-2">
          {currentViewMode === 'client' && (
            <button
              onClick={() => navigate('/newProject')}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm shadow-md transition"
            >
              <PlusCircle size={16} className="mr-2" />
              {t('registerNewProject')}
            </button>
          )}
          <button
            onClick={handleModeSwitch}
            className="text-slate-600 hover:text-indigo-600 p-2 rounded-md hover:bg-indigo-50 flex items-center text-xs sm:text-sm whitespace-nowrap transition"
            title={t('roleSwitchButton')}
          >
            <Repeat size={16} className="mr-1 sm:mr-1.5 flex-shrink-0" />
            {roleSwitchButtonText}
          </button>
          <button className="flex items-center bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm shadow-sm transition">
            <Filter size={16} className="mr-2" />
            {t('filter')}
          </button>
        </div>
      </div>
      {currentViewMode === 'contractor' ? (
        <>
          <div className="flex border-b border-slate-200 mb-6">
            <TabButton title={t('tabRecommended')} icon={<Zap />} isActive={activeDashboardTab === 'recommended'} onClick={() => setActiveDashboardTab('recommended')} />
            <TabButton title={t('tabMyTasks')} icon={<ListChecks />} isActive={activeDashboardTab === 'my_tasks'} onClick={() => setActiveDashboardTab('my_tasks')} />
            <TabButton title={t('tabCompletedHistory')} icon={<History />} isActive={activeDashboardTab === 'completed_history'} onClick={() => setActiveDashboardTab('completed_history')} />
          </div>
          <div className={`grid grid-cols-1 ${currentViewMode === 'contractor' ? 'md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6 items-start`}>
            {activeDashboardTab === 'recommended' && (
              (Array.isArray(projectsToDisplay.aiRecommendedProjects) && Array.isArray(projectsToDisplay.openForProposals) && projectsToDisplay.aiRecommendedProjects.length === 0 && projectsToDisplay.openForProposals.length === 0)
                ? <NoProjectsMessage />
                : <>
                    {Array.isArray(projectsToDisplay.aiRecommendedProjects) && projectsToDisplay.aiRecommendedProjects.length > 0 && renderProjectList(projectsToDisplay.aiRecommendedProjects, t('contractorAiRecommendedProjectsTitle'), true)}
                    {Array.isArray(projectsToDisplay.openForProposals) && projectsToDisplay.openForProposals.length > 0 && renderProjectList(projectsToDisplay.openForProposals, t('contractorOpenForProposals'))}
                  </>
            )}
            {activeDashboardTab === 'my_tasks' && (
              (Array.isArray(projectsToDisplay.activeContracts) && Array.isArray(projectsToDisplay.myPendingProposals) && projectsToDisplay.activeContracts.length === 0 && projectsToDisplay.myPendingProposals.length === 0)
                ? <NoProjectsMessage />
                : <>
                    {Array.isArray(projectsToDisplay.activeContracts) && projectsToDisplay.activeContracts.length > 0 && renderProjectList(projectsToDisplay.activeContracts, t('contractorActiveProjects'))}
                    {Array.isArray(projectsToDisplay.myPendingProposals) && projectsToDisplay.myPendingProposals.length > 0 && renderProjectList(projectsToDisplay.myPendingProposals, t('contractorMyPendingProposals'))}
                  </>
            )}
            {activeDashboardTab === 'completed_history' && (
              (Array.isArray(projectsToDisplay.completedContracts) && projectsToDisplay.completedContracts.length === 0)
                ? <NoProjectsMessage />
                : Array.isArray(projectsToDisplay.completedContracts) && projectsToDisplay.completedContracts.length > 0 && renderProjectList(projectsToDisplay.completedContracts, t('contractorCompletedProjects'))
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {Array.isArray(projectsToDisplay) && projectsToDisplay.length === 0 ? <NoProjectsMessage /> : Array.isArray(projectsToDisplay) && projectsToDisplay.length > 0 && renderProjectList(projectsToDisplay, null)}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
