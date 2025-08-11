import React, { useState } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Page Components
import DashboardPage from './pages/DashboardPage';
import NewProjectPage from './pages/NewProjectPage';
import ContractReviewPage from './pages/ContractReviewPage';
import PlaceholderPage from './components/common/PlaceholderPage';

// Modals
import ProposalModal from './components/modals/ProposalModal';
import ProposalDetailsModal from './components/modals/ProposalDetailsModal';
import DepositFundsModal from './components/modals/DepositFundsModal';

// Data and Utilities
import { useTranslation } from 'react-i18next';
import { initialProjects, loggedInUserDataGlobal } from './utils/initialData';
import { callGeminiAPI } from './utils/api';

// Icons
import { MessageSquare, AlertTriangle, Settings } from 'lucide-react';

export default function App() {
  const [loggedInUser] = useState({ id: loggedInUserDataGlobal.id, name: loggedInUserDataGlobal.name });
  const [projects, setProjects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation(); // この行を追加
  const navigate = useNavigate(); // この行を追加
  const activePage = location.pathname.replace('/', '') || 'dashboard'; // この行を追加 (activePage state は削除)

  const [activeProjectDetailTab, setActiveProjectDetailTab] = useState('details');
  // i18nのuseTranslationフックを利用
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [currentViewMode, setCurrentViewMode] = useState('client');
  // const [disputeSummary, setDisputeSummary] = useState(''); // Unused, commented out
  const [milestoneSuggestions, setMilestoneSuggestions] = useState('');
  const [contractCheckSuggestions, setContractCheckSuggestions] = useState('');
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    title: '', category: '', description: '', deliverables: '',
    acceptanceCriteria: '', deliverableDetails: '', acceptanceCriteriaDetails: '',
    scopeOfWork_included: '', scopeOfWork_excluded: '', additionalWorkTerms: '',
    budget: '', paymentType: 'milestone',
    milestones: [{ id: Date.now(), name: '', amount: '', dueDate: '' }],
    attachments: [], allowSubcontracting: false,
  });

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [projectForProposal, setProjectForProposal] = useState(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [projectForDeposit, setProjectForDeposit] = useState(null);
  const [isProposalDetailsModalOpen, setIsProposalDetailsModalOpen] = useState(false);
  const [proposalForDetails, setProposalForDetails] = useState(null);

  const selectedProjectForReview = projects.find((p) => p.id === selectedProjectId);

  // const toggleLanguage = () => setCurrentLanguage((prev) => (prev === 'ja' ? 'en' : 'ja'));

  const resetNewProjectForm = () => {
    setNewProjectData({
      title: '', category: '', description: '', deliverables: '',
      acceptanceCriteria: '', deliverableDetails: '', acceptanceCriteriaDetails: '',
      scopeOfWork_included: '', scopeOfWork_excluded: '', additionalWorkTerms: '',
      budget: '', paymentType: 'milestone',
      milestones: [{ id: Date.now(), name: '', amount: '', dueDate: '' }],
      attachments: [], allowSubcontracting: false,
    });
    setMilestoneSuggestions('');
    setContractCheckSuggestions('');
  };

  const toggleViewMode = () => {
    setCurrentViewMode((prev) => (prev === 'client' ? 'contractor' : 'client'));
    navigate('dashboard');
    setSelectedProjectId(null);
    setSearchTerm('');
  // setDisputeSummary(''); // Not defined, commented out
    resetNewProjectForm();
  };

  const handleProjectClick = (project, forceSelect = false) => {
    const newSelectedId = selectedProjectId === project.id && !forceSelect ? null : project.id;
    setSelectedProjectId(newSelectedId);
    if (newSelectedId) {
        const isContractorViewingOpenProject = currentViewMode === 'contractor' && project.status === '募集中';
        const isClientViewingOwnOpenProject = currentViewMode === 'client' && project.clientId === loggedInUser.id && (project.status === '募集中' || project.status === t.agreementPending);
        if (isContractorViewingOpenProject) setActiveProjectDetailTab('details');
        else if (isClientViewingOwnOpenProject) setActiveProjectDetailTab('proposals');
        else setActiveProjectDetailTab('milestones');
    }
  };

  const navigateToContractReview = (project) => {
    if (project?.id) {
      setSelectedProjectId(project.id);
      navigate('contractReview');
    }
  };

  const handleContractCheck = async () => {
    setIsLoadingGemini(true);
    setContractCheckSuggestions('');
    const prompt = `...`; // Prompt logic here
    const suggestions = await callGeminiAPI(prompt, currentLanguage);
    setContractCheckSuggestions(suggestions);
    setIsLoadingGemini(false);
  };

  const openProposalModal = (project) => { setProjectForProposal(project); setIsProposalModalOpen(true); };
  const closeProposalModal = () => setIsProposalModalOpen(false);
  const openDepositModal = (project) => { setProjectForDeposit(project); setIsDepositModalOpen(true); };
  const closeDepositModal = () => setIsDepositModalOpen(false);
  const openProposalDetailsModal = (proposal) => { setProposalForDetails(proposal); setIsProposalDetailsModalOpen(true); };
  const closeProposalDetailsModal = () => setIsProposalDetailsModalOpen(false);

  const handleProposalSubmit = (proposalData) => {
    setProjects(prev => prev.map(p => p.id === proposalData.projectId ? { ...p, proposals: [...(p.proposals || []), { id: `prop${Date.now()}`, ...proposalData, status: 'pending_review' }] } : p));
    alert(t.applicationSubmitted);
    closeProposalModal();
  };

  const handleSelectProposal = (proposal) => {
    let projectToNavigate;
    setProjects(prev => prev.map(p => {
      if (p.id === proposal.projectId) {
        const updated = { ...p, status: t.agreementPending, contractorId: proposal.contractorId, contractorName: proposal.contractorName, proposals: p.proposals.map(prop => prop.id === proposal.id ? { ...prop, status: 'accepted' } : { ...prop, status: 'archived' }) };
        projectToNavigate = updated;
        return updated;
      }
      return p;
    }));
    if (projectToNavigate) {
      setSelectedProjectId(projectToNavigate.id);
      alert(t.proposalSelectedMsg.replace('{contractorName}', proposal.contractorName));
      navigateToContractReview(projectToNavigate);
      closeProposalDetailsModal();
    }
  };

  const handleCancelProposalSelection = (project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: '募集中', contractorId: null, contractorName: null, proposals: p.proposals.map(prop => ({ ...prop, status: 'pending_review' })) } : p));
    setActiveProjectDetailTab('proposals');
  };

  const handleFinalizeContract = (projectId) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: t.statusWorkReady } : p));
    alert(t.contractFinalizedMessage);
    navigate('dashboard');
  };

  const handleExecuteDeposit = (projectId, amount) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: t.statusInProgress, fundsDeposited: p.fundsDeposited + amount } : p));
    alert(t.depositCompletedMessage);
    closeDepositModal();
  };

  const handleUpdateMilestoneStatus = (projectId, milestoneId, newStatus, details = {}) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      let updatedFundsReleased = p.fundsReleased;
      const updatedMilestones = p.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        const newMilestone = { ...m, status: newStatus };
        if (newStatus === 'paid') {
          updatedFundsReleased += m.amount;
          newMilestone.paidDate = new Date().toISOString().split('T')[0];
        }
        return newMilestone;
      });
      const allMilestonesPaid = updatedMilestones.every(m => m.status === 'paid');
      return { ...p, milestones: updatedMilestones, fundsReleased: updatedFundsReleased, status: allMilestonesPaid ? '完了' : p.status };
    }));
  };

  const handleSubmitNewProject = (data) => {
    if (!data.title || !data.description || !data.budget) { alert(t.fillRequiredFieldsError); return; }
    const newProject = { id: `job${Date.now()}`, name: data.title, clientName: loggedInUser.name, clientId: loggedInUser.id, totalAmount: Number(data.budget), status: '募集中', description: data.description, fundsDeposited: 0, fundsReleased: 0, milestones: data.milestones.map(ms => ({...ms, status: 'pending'})), proposals: [], dueDate: new Date().toISOString().split('T')[0] };
    setProjects(prev => [newProject, ...prev]);
    alert(t.registerProjectSuccess);
    resetNewProjectForm();
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar t={t} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} loggedInUser={loggedInUser} currentViewMode={currentViewMode} activePage={activePage} setActivePage={(page) => navigate(page.startsWith('/') ? page : `/${page}`)} />
      <div className={`flex-1 flex flex-col transition-all duration-300`} style={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}>
  <Header t={t} isSidebarOpen={isSidebarOpen} activePage={activePage} currentViewMode={currentViewMode} toggleViewMode={toggleViewMode} currentLanguage={currentLanguage} />
        <main className="flex-1 p-6 pt-20 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage projects={projects} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleProjectClick={handleProjectClick} selectedProjectId={selectedProjectId} loggedInUser={loggedInUser} openProposalModalFunc={openProposalModal} openDepositModalFunc={openDepositModal} t={t} currentLanguage={currentLanguage} currentViewMode={currentViewMode} setActiveProjectDetailTab={setActiveProjectDetailTab} activeProjectDetailTab={activeProjectDetailTab} isLoadingGemini={isLoadingGemini} handleUpdateMilestoneStatus={handleUpdateMilestoneStatus} handleSelectProposal={handleSelectProposal} handleCancelProposalSelection={handleCancelProposalSelection} onNavigateToContractReview={navigateToContractReview} openProposalDetailsModal={openProposalDetailsModal} />} />
            <Route path="/dashboard" element={<DashboardPage projects={projects} searchTerm={searchTerm} setSearchTerm={searchTerm} handleProjectClick={handleProjectClick} selectedProjectId={selectedProjectId} loggedInUser={loggedInUser} openProposalModalFunc={openProposalModal} openDepositModalFunc={openDepositModal} t={t} currentLanguage={currentLanguage} currentViewMode={currentViewMode} setActiveProjectDetailTab={setActiveProjectDetailTab} activeProjectDetailTab={activeProjectDetailTab} isLoadingGemini={isLoadingGemini} handleUpdateMilestoneStatus={handleUpdateMilestoneStatus} handleSelectProposal={handleSelectProposal} handleCancelProposalSelection={handleCancelProposalSelection} onNavigateToContractReview={navigateToContractReview} openProposalDetailsModal={openProposalDetailsModal} />} />
            <Route path="/newProject" element={<NewProjectPage newProjectData={newProjectData} setNewProjectData={setNewProjectData} t={t} currentLanguage={currentLanguage} isLoadingGemini={isLoadingGemini} milestoneSuggestions={milestoneSuggestions} contractCheckSuggestions={contractCheckSuggestions} onContractCheck={handleContractCheck} onSubmitProject={handleSubmitNewProject} onCancelProject={resetNewProjectForm} />} />
            <Route path="/contractReview" element={<ContractReviewPage selectedProjectForReview={selectedProjectForReview} t={t} handleFinalizeContract={handleFinalizeContract} currentLanguage={currentLanguage} handleCancelProposalSelection={handleCancelProposalSelection} setActiveProjectDetailTab={setActiveProjectDetailTab} />} />
            <Route path="/messages" element={<PlaceholderPage t={t} title={t.messages} icon={<MessageSquare />} />} />
            <Route path="/disputes" element={<PlaceholderPage t={t} title={t.disputes} icon={<AlertTriangle />} />} />
            <Route path="/settings" element={<PlaceholderPage t={t} title={t.settings} icon={<Settings />} />} />
          </Routes>
        </main>
        <ProposalModal isOpen={isProposalModalOpen} onClose={closeProposalModal} onSubmit={handleProposalSubmit} project={projectForProposal} lang={currentLanguage} t={t} currentUser={loggedInUser} />
        <ProposalDetailsModal isOpen={isProposalDetailsModalOpen} onClose={closeProposalDetailsModal} proposal={proposalForDetails} lang={currentLanguage} t={t} onSelectProposal={handleSelectProposal} />
        <DepositFundsModal isOpen={isDepositModalOpen} onClose={closeDepositModal} project={projectForDeposit} lang={currentLanguage} t={t} onSubmitDeposit={handleExecuteDeposit} />
      </div>
    </div>

  );
}