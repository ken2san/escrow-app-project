import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/dashboard/ProjectCard';
import { Search, Filter, PlusCircle, Briefcase, Zap, ListChecks, History } from 'lucide-react';
import TabButton from '../components/common/TabButton';
import { translations } from '../utils/translations';

const DashboardPage = ({
  projects,
  searchTerm,
  setSearchTerm,
  currentViewMode,
  loggedInUser,
  t,
  handleProjectClick,
  selectedProjectId,
  ...props
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState(
    currentViewMode === 'contractor' ? 'recommended' : 'my_tasks'
  );

  const navigate = useNavigate();

  useEffect(() => {
    setActiveDashboardTab(
      currentViewMode === 'contractor' ? 'recommended' : 'my_tasks'
    );
  }, [currentViewMode]);

  const projectsToDisplay = (() => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    if (currentViewMode === 'client') {
      const clientProjects = projects.filter(p => p.clientId === loggedInUser.id);
      if (!normalizedSearchTerm) return clientProjects;
      return clientProjects.filter(
        (project) =>
          project.name?.toLowerCase().includes(normalizedSearchTerm) ||
          project.contractorName?.toLowerCase().includes(normalizedSearchTerm) ||
          project.description?.toLowerCase().includes(normalizedSearchTerm)
      );
    } else {
      const allProjects = projects;
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
              p.clientId !== loggedInUser.id
          )
          .sort((a, b) => b.aiRecommendationScore - a.aiRecommendationScore)
      );

      let openForProposals = filterBySearch(
        allProjects.filter(
          (p) =>
            p.status === '募集中' &&
            p.clientId !== loggedInUser.id &&
            !p.proposals?.some(
              (prop) =>
                prop.contractorId === loggedInUser.id &&
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
                prop.contractorId === loggedInUser.id &&
                prop.status === 'pending_review'
            )
        )
      );

      let activeContracts = filterBySearch(
        allProjects.filter(
          (p) =>
            p.contractorId === loggedInUser.id &&
            ([t.statusInProgress, translations.ja.statusInProgress].includes(p.status) ||
             [t.statusWorkReady, translations.ja.statusWorkReady].includes(p.status) ||
             [t.agreementPending, translations.ja.agreementPending].includes(p.status) ||
             [t.statusInDispute, translations.ja.statusInDispute].includes(p.status))
        )
      ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      let completedContracts = filterBySearch(
        allProjects.filter(
          (p) => p.contractorId === loggedInUser.id && p.status === '完了'
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

  // 修正: この関数はリストが空でなければタイトルとカードを表示するだけにする
  const renderProjectList = (list, title, isRecommended = false) => {
    if (!list || list.length === 0) {
      return null;
    }

    return (
      <>
        {title && (
          <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-6 first:mt-0 col-span-full flex items-center">
            {isRecommended && <Zap size={20} className="mr-2 text-yellow-500" />}
            {title}
          </h3>
        )}
        {list.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={handleProjectClick}
            isSelected={selectedProjectId === project.id}
            currentUser={loggedInUser}
            t={t}
            currentViewMode={currentViewMode}
            isRecommendedCard={isRecommended}
            {...props}
          />
        ))}
      </>
    );
  };

  // 修正: 「案件なし」メッセージを表示するためのコンポーネント
  const NoProjectsMessage = () => (
    <div className="text-center py-10 col-span-full">
      <Briefcase size={40} className="mx-auto text-gray-400 mb-4" />
      <p className="text-gray-500">{t.noProjectsFound}</p>
    </div>
  );

  const translationsObj = require('../utils/translations').translations;
  const tCurrent = translationsObj[props.currentLanguage];
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder={tCurrent.searchPlaceholder}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm shadow-sm">
            <Filter size={16} className="mr-2" />
            {tCurrent.filter}
          </button>
          {currentViewMode === 'client' && (
            <button
              onClick={() => navigate('/newProject')}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm shadow-md"
            >
              <PlusCircle size={16} className="mr-2" />
              {tCurrent.registerNewProject}
            </button>
          )}
        </div>
      </div>
      {currentViewMode === 'contractor' ? (
        <>
          <div className="flex border-b border-gray-300 mb-6">
            <TabButton title={tCurrent.tabRecommended} icon={<Zap />} isActive={activeDashboardTab === 'recommended'} onClick={() => setActiveDashboardTab('recommended')} />
            <TabButton title={tCurrent.tabMyTasks} icon={<ListChecks />} isActive={activeDashboardTab === 'my_tasks'} onClick={() => setActiveDashboardTab('my_tasks')} />
            <TabButton title={tCurrent.tabCompletedHistory} icon={<History />} isActive={activeDashboardTab === 'completed_history'} onClick={() => setActiveDashboardTab('completed_history')} />
          </div>
          <div className={`grid grid-cols-1 ${currentViewMode === 'contractor' ? 'md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6 items-start`}>
            {activeDashboardTab === 'recommended' && (
              (Array.isArray(projectsToDisplay.aiRecommendedProjects) && Array.isArray(projectsToDisplay.openForProposals) && projectsToDisplay.aiRecommendedProjects.length === 0 && projectsToDisplay.openForProposals.length === 0)
                ? <NoProjectsMessage />
                : <>
                    {Array.isArray(projectsToDisplay.aiRecommendedProjects) && projectsToDisplay.aiRecommendedProjects.length > 0 && renderProjectList(projectsToDisplay.aiRecommendedProjects, tCurrent.contractorAiRecommendedProjectsTitle, true)}
                    {Array.isArray(projectsToDisplay.openForProposals) && projectsToDisplay.openForProposals.length > 0 && renderProjectList(projectsToDisplay.openForProposals, tCurrent.contractorOpenForProposals)}
                  </>
            )}
            {activeDashboardTab === 'my_tasks' && (
              (Array.isArray(projectsToDisplay.activeContracts) && Array.isArray(projectsToDisplay.myPendingProposals) && projectsToDisplay.activeContracts.length === 0 && projectsToDisplay.myPendingProposals.length === 0)
                ? <NoProjectsMessage />
                : <>
                    {Array.isArray(projectsToDisplay.activeContracts) && projectsToDisplay.activeContracts.length > 0 && renderProjectList(projectsToDisplay.activeContracts, tCurrent.contractorActiveProjects)}
                    {Array.isArray(projectsToDisplay.myPendingProposals) && projectsToDisplay.myPendingProposals.length > 0 && renderProjectList(projectsToDisplay.myPendingProposals, tCurrent.contractorMyPendingProposals)}
                  </>
            )}
            {activeDashboardTab === 'completed_history' && (
              (Array.isArray(projectsToDisplay.completedContracts) && projectsToDisplay.completedContracts.length === 0)
                ? <NoProjectsMessage />
                : Array.isArray(projectsToDisplay.completedContracts) && projectsToDisplay.completedContracts.length > 0 && renderProjectList(projectsToDisplay.completedContracts, tCurrent.contractorCompletedProjects)
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
};

export default DashboardPage;
