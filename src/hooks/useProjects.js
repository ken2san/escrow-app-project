// src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import { dashboardProjects } from '../utils/initialData';
import { translations } from '../utils/translations';

// LocalStorage用のキー
const STORAGE_KEY = 'escrow_app_projects';

// プロジェクトデータをLocalStorageから取得
const getStoredProjects = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : dashboardProjects;
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
  return dashboardProjects;
  }
};

// プロジェクトデータをLocalStorageに保存
const storeProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};

const useProjects = (navigate, currentViewMode, loggedInUser, setActiveProjectDetailTab, currentLanguage) => {
  const [projects, setProjects] = useState(getStoredProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [error, setError] = useState(null);

  const t = translations[currentLanguage];

  // projectsが更新されたらLocalStorageに保存
  useEffect(() => {
    storeProjects(projects);
  }, [projects]);

  // エラーがセットされたら3秒後にクリア
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleProjectClick = (project, forceSelect = false) => {
    try {
      const newSelectedId = selectedProjectId === project.id && !forceSelect ? null : project.id;
      setSelectedProjectId(newSelectedId);
      if (newSelectedId) {
        const isContractorViewingOpenProject = currentViewMode === 'contractor' && project.status === t.statusOpen;
        const isClientViewingOwnOpenProject = currentViewMode === 'client' && project.clientId === loggedInUser.id &&
          (project.status === t.statusOpen || project.status === t.agreementPending);

        if (isContractorViewingOpenProject) setActiveProjectDetailTab('details');
        else if (isClientViewingOwnOpenProject) setActiveProjectDetailTab('proposals');
        else setActiveProjectDetailTab('milestones');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in handleProjectClick:', error);
      setError(t.errorGeneric);
    }
  };

  const handleUpdateMilestoneStatus = (projectId, milestoneId, newStatus, details = {}) => {
    try {
      setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id !== projectId) return p;
          let updatedFundsReleased = p.fundsReleased;
          const updatedMilestones = p.milestones.map(m => {
            if (m.id !== milestoneId) return m;
            const newMilestone = { ...m, status: newStatus };
            if (details.submittedFile) {
              newMilestone.submittedFiles = [
                ...(m.submittedFiles || []),
                {
                  name: details.submittedFile,
                  date: new Date().toISOString().split('T')[0],
                },
              ];
              newMilestone.feedbackHistory = [
                ...(m.feedbackHistory || []),
                {
                  type: 'submission',
                  date: new Date().toISOString().split('T')[0],
                  comment: t.milestoneSubmissionComment.replace('{name}', loggedInUser.name),
                },
              ];
            }
            if (details.rejectionReason) {
              newMilestone.rejectionReason = details.rejectionReason;
              newMilestone.feedbackHistory = [
                ...(m.feedbackHistory || []),
                {
                  type: 'rejection',
                  date: new Date().toISOString().split('T')[0],
                  comment: details.rejectionReason,
                },
              ];
            }
            if (newStatus === 'approved') {
              newMilestone.feedbackHistory = [
                ...(m.feedbackHistory || []),
                {
                  type: 'approval',
                  date: new Date().toISOString().split('T')[0],
                  comment: t.milestoneApprovalComment.replace('{name}', loggedInUser.name),
                },
              ];
            }
            if (newStatus === 'paid') {
              updatedFundsReleased += Number(m.amount) || 0;
              newMilestone.paidDate = new Date().toISOString().split('T')[0];
            }
            return newMilestone;
          });
          const allMilestonesPaid = updatedMilestones.every(m => m.status === 'paid');
          return {
            ...p,
            milestones: updatedMilestones,
            fundsReleased: updatedFundsReleased,
            status: allMilestonesPaid ? t.statusCompleted : p.status,
          };
        })
      );
    } catch (error) {
      console.error('Error in handleUpdateMilestoneStatus:', error);
      setError(t.errorUpdateMilestone);
    }
  };

  const handleSubmitNewProject = (data, resetNewProjectForm) => {
    try {
      if (!data.title || !data.description || !data.budget) {
        setError(t.fillRequiredFieldsError);
        return;
      }

      if (data.paymentType === 'milestone') {
        for (const ms of data.milestones) {
          if (!ms.name || !ms.amount || !ms.dueDate) {
            setError(t.fillAllMilestoneInfoError);
            return;
          }
        }

        const totalMilestoneAmount = data.milestones.reduce(
          (sum, ms) => sum + Number(ms.amount || 0),
          0
        );

        if (Math.abs(totalMilestoneAmount - Number(data.budget)) > 0.01) {
          setError(t.milestoneBudgetMismatchError);
          return;
        }
      }

      const newProjectEntry = {
        id: `job${Date.now()}`,
        name: data.title,
        clientName: loggedInUser.name,
        clientId: loggedInUser.id,
        contractorName: null,
        contractorId: null,
        contractorResellingRisk: 0,
        clientResellingRisk: Math.floor(Math.random() * 25),
        totalAmount: Number(data.budget),
        fundsDeposited: 0,
        fundsReleased: 0,
        status: t.statusOpen,
        dueDate: data.milestones[data.milestones.length - 1]?.dueDate ||
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: data.description,
        deliverables: data.deliverables,
        deliverableDetails: data.deliverableDetails,
        acceptanceCriteria: data.acceptanceCriteria,
        acceptanceCriteriaDetails: data.acceptanceCriteriaDetails,
        scopeOfWork_included: data.scopeOfWork_included,
        scopeOfWork_excluded: data.scopeOfWork_excluded,
        additionalWorkTerms: data.additionalWorkTerms,
        allowSubcontracting: data.allowSubcontracting || false,
        agreementDocLink: null,
        changeOrders: [],
        communicationLogCount: 0,
        lastUpdate: new Date().toISOString(),
        hasDispute: false,
        milestones: data.paymentType === 'milestone'
          ? data.milestones.map((ms) => ({
              ...ms,
              amount: Number(ms.amount),
              status: 'pending',
            }))
          : [],
        requiredSkills: data.category ? [data.category] : [],
        clientRating: { averageScore: null, totalReviews: 0 },
        proposals: [],
      };

      setProjects((prevProjects) => [newProjectEntry, ...prevProjects]);
      resetNewProjectForm();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleSubmitNewProject:', error);
      setError(t.errorCreateProject);
    }
  };

  return {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    handleProjectClick,
    handleUpdateMilestoneStatus,
    handleSubmitNewProject,
    error,
  };
};

export default useProjects;
