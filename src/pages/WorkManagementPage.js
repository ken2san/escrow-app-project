import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './workmanagement.css';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Menu, X } from 'lucide-react';
import { Mail, PlayCircle, CheckCircle, Inbox, Pencil, BarChart, Clipboard, Star, Coins } from 'lucide-react';
import NewProjectModal from '../components/modals/NewProjectModal';
import ReviewModal from '../components/modals/ReviewModal';
import StarRatingDisplay from '../components/common/StarRatingDisplay';
import { getWorkManagementProjectsView, getProjectPaymentStatus, loggedInUserDataGlobal, needsReview, submitReview, getUserReview } from '../utils/initialData';
import CardHistoryTimeline from '../components/common/CardHistoryTimeline';
import ProjectPaymentSummary from '../components/common/ProjectPaymentSummary';

// --- Card history management ---
// Store card history in-memory by cardId (should be managed by DB/API in production)
const cardHistoryMapRef = typeof window !== 'undefined' ? (window.__cardHistoryMapRef = window.__cardHistoryMapRef || {}) : {};
function getCardHistory(cardId) {
    return cardHistoryMapRef[cardId] || [];
}
function addCardHistory(cardId, entry) {
    if (!cardHistoryMapRef[cardId]) cardHistoryMapRef[cardId] = [];
    cardHistoryMapRef[cardId].push(entry);
}
function initCardHistoryIfNeeded(card) {
    if (!cardHistoryMapRef[card.id]) {
        // Initial history (on creation)
        cardHistoryMapRef[card.id] = [{
            type: 'created',
            text: 'Card created',
            date: card.startDate || new Date().toISOString(),
            userName: loggedInUserDataGlobal.name,
            userIcon: <Pencil size={16} className="text-slate-400" />,
        }];
    }
}

// --- Based on logic/UI from two versions ago ---
function getInitialProjects() {
    const { getPendingApplicationJobsForUser, getReceivedApplicationsForProject, dashboardAllProjects, getCompletedMilestonesForJob } = require('../utils/initialData');

    const pendingApplications = getPendingApplicationJobsForUser(loggedInUserDataGlobal.id);
    const pendingJobs = pendingApplications.filter(j => j.status === 'pending' || j.status === 'offered').map(j => j.jobId);
    const acceptedJobs = pendingApplications.filter(j => j.status === 'accepted').map(j => j.jobId);

    // Get completed jobs (contractor projects with status '完了')
    const completedJobs = dashboardAllProjects
        .filter(p => p.contractorId === loggedInUserDataGlobal.id && p.status === '完了')
        .map(p => p.id);

    // Map to get selectedMilestones for each job
    const selectedMilestonesMap = {};
    pendingApplications.forEach(app => {
        if (app.selectedMilestones && Array.isArray(app.selectedMilestones) && app.selectedMilestones.length > 0) {
            selectedMilestonesMap[app.jobId] = app.selectedMilestones;
        }
    });

    // Map to get acceptedMilestones for each job
    const acceptedMilestonesMap = {};
    pendingApplications.forEach(app => {
        if (app.acceptedMilestones && Array.isArray(app.acceptedMilestones) && app.acceptedMilestones.length > 0) {
            acceptedMilestonesMap[app.jobId] = app.acceptedMilestones;
        }
    });

    // Map to get completedMilestones for each job
    const completedMilestonesMap = {};
    pendingApplications.forEach(app => {
        const completed = getCompletedMilestonesForJob(app.jobId);
        if (completed.length > 0) {
            completedMilestonesMap[app.jobId] = completed;
        }
    });
    // Add all milestones from completed jobs as completed
    completedJobs.forEach(jobId => {
        const job = dashboardAllProjects.find(j => j.id === jobId);
        if (job && job.milestones) {
            completedMilestonesMap[jobId] = job.milestones.map(m => m.id || `${jobId}-m${job.milestones.indexOf(m) + 1}`);
        }
    });

    // Collect projects with received applications (client side)
    const projectsWithReceivedApps = new Set();
    dashboardAllProjects.forEach(project => {
        const received = getReceivedApplicationsForProject(project.id);
        if (received.length > 0) {
            projectsWithReceivedApps.add(project.id);
        }
    });

    // Phase 2.5: Switch to new data source
    // Get projects from unified data model (dashboardAllProjects)
    const projectsFromView = getWorkManagementProjectsView(loggedInUserDataGlobal.id);

    // Existing projects (initial data)
    // Include all projects from projectsFromView, mark application-based ones with _pendingStatus
    let base = projectsFromView.map(project => {
            let _pendingStatus = '';
            if (pendingJobs.includes(project.id)) _pendingStatus = 'pending';
            if (acceptedJobs.includes(project.id)) _pendingStatus = 'accepted';
            // If project has explicit _pendingStatus (like job2), use it for filtering but respect accepted milestones
            if (project._pendingStatus && !_pendingStatus) {
                _pendingStatus = project._pendingStatus;
            }
            let proj = { ...project, _pendingStatus };
            if (project.cards && Array.isArray(project.cards)) {
                const cardsWithStatus = project.cards.map(card => ({
                    ...card,
                    _pendingStatus: acceptedMilestonesMap[project.id]?.includes(card.id) ? 'accepted' : (_pendingStatus || card._pendingStatus || 'accepted'),
                    _completedStatus: completedMilestonesMap[project.id]?.includes(card.id) ? 'completed' : undefined,
                }));
                return { ...proj, cards: cardsWithStatus };
            }
            if (project.milestones && Array.isArray(project.milestones)) {
                let allCards = project.milestones.map((m, idx) => ({
                    id: m.id || `${project.id}-m${idx+1}`,
                    projectId: project.id,
                    title: m.name || m.title,
                    status: m.status || 'unsent',
                    reward: m.amount || 0,
                    startDate: m.dueDate || '',
                    duration: '',
                    order: idx+1,
                    _pendingStatus: acceptedMilestonesMap[project.id]?.includes(m.id || `${project.id}-m${idx+1}`) ? 'accepted' : (_pendingStatus || 'accepted'),
                    _completedStatus: completedMilestonesMap[project.id]?.includes(m.id || `${project.id}-m${idx+1}`) ? 'completed' : undefined,
                }));
                // Filter cards based on selectedMilestones if in pending status (use milestone id)
                if (_pendingStatus === 'pending' && selectedMilestonesMap[project.id]) {
                    allCards = allCards.filter((m, idx) => {
                        const milestoneId = m.id || `${project.id}-m${idx+1}`;
                        return selectedMilestonesMap[project.id].includes(milestoneId);
                    });
                }
                return {
                    ...proj,
                    cards: allCards,
                };
            }
            return { ...proj, cards: [] };
        });

    // Generate missing jobIds from dashboardAllProjects that are not in initial data
    const existingIds = new Set(base.map(p => p.id));
    const missingPending = pendingJobs.filter(jid => !existingIds.has(jid));
    for (const jobId of missingPending) {
        const job = dashboardAllProjects.find(j => j.id === jobId);
        if (job) {
            let cards = (job.milestones && Array.isArray(job.milestones) && job.milestones.length > 0)
                ? job.milestones.map((m, idx) => ({
                    id: m.id || `${job.id}-m${idx+1}`,
                    projectId: job.id,
                    title: m.name || m.title || `マイルストーン ${idx+1}`,
                    status: 'unsent',
                    reward: m.amount || 0,
                    startDate: m.dueDate || '',
                    duration: '',
                    order: idx+1,
                    _pendingStatus: acceptedMilestonesMap[job.id]?.includes(m.id || `${job.id}-m${idx+1}`) ? 'accepted' : 'pending',
                    _completedStatus: completedMilestonesMap[job.id]?.includes(m.id || `${job.id}-m${idx+1}`) ? 'completed' : undefined,
                }))
                : [{ id: `${job.id}-m1`, projectId: job.id, title: job.name || job.title || '作業', status: 'unsent', reward: job.totalAmount || 0, startDate: job.dueDate || '', duration: '', order: 1, _pendingStatus: acceptedMilestonesMap[job.id]?.includes(`${job.id}-m1`) ? 'accepted' : 'pending', _completedStatus: completedMilestonesMap[job.id]?.includes(`${job.id}-m1`) ? 'completed' : undefined }];

            // Filter cards based on selectedMilestones
            if (selectedMilestonesMap[jobId]) {
                cards = cards.filter((m, idx) => {
                    const milestoneId = m.id || `${jobId}-m${idx+1}`;
                    return selectedMilestonesMap[jobId].includes(milestoneId);
                });
            }

            base.push({
                id: job.id,
                name: job.name || job.title || '新規案件',
                client: job.clientName || job.client || 'クライアント',
                totalBudget: job.totalAmount || job.budget || 0,
                deadline: job.dueDate || '',
                duration: '',
                description: job.description || '',
                cards,
                _pendingStatus: 'pending',
            });
            existingIds.add(jobId); // Add to existingIds to prevent duplicates
        }
    }
    // Same for accepted (only when promoted from pending to accepted)
    const missingAccepted = acceptedJobs.filter(jid => !existingIds.has(jid) && !missingPending.includes(jid));
    for (const jobId of missingAccepted) {
        const job = dashboardAllProjects.find(j => j.id === jobId);
        if (job) {
            let cards = (job.milestones && Array.isArray(job.milestones) && job.milestones.length > 0)
                ? job.milestones.map((m, idx) => ({
                    id: m.id || `${job.id}-m${idx+1}`,
                    projectId: job.id,
                    title: m.name || m.title || `マイルストーン ${idx+1}`,
                    status: 'unsent',
                    reward: m.amount || 0,
                    startDate: m.dueDate || '',
                    duration: '',
                    order: idx+1,
                    _pendingStatus: 'accepted',
                    _completedStatus: completedMilestonesMap[job.id]?.includes(m.id || `${job.id}-m${idx+1}`) ? 'completed' : undefined,
                }))
                : [{ id: `${job.id}-m1`, projectId: job.id, title: job.name || job.title || '作業', status: 'unsent', reward: job.totalAmount || 0, startDate: job.dueDate || '', duration: '', order: 1, _pendingStatus: 'accepted', _completedStatus: completedMilestonesMap[job.id]?.includes(`${job.id}-m1`) ? 'completed' : undefined }];
            base.push({
                id: job.id,
                name: job.name || job.title || '新規案件',
                client: job.clientName || job.client || 'クライアント',
                totalBudget: job.totalAmount || job.budget || 0,
                deadline: job.dueDate || '',
                duration: '',
                description: job.description || '',
                cards,
                _pendingStatus: 'accepted',
            });
            existingIds.add(jobId); // Add to existingIds to prevent duplicates
        }
    }

    // Add projects with received applications (client side projects)
    const receivedAppsIds = new Set();
    projectsWithReceivedApps.forEach(projectId => {
        if (!existingIds.has(projectId)) {
            const job = dashboardAllProjects.find(j => j.id === projectId);
            if (job) {
                let cards = (job.milestones && Array.isArray(job.milestones) && job.milestones.length > 0)
                    ? job.milestones.map((m, idx) => ({
                        id: m.id || `${job.id}-m${idx+1}`,
                        projectId: job.id,
                        title: m.name || m.title || `マイルストーン ${idx+1}`,
                        status: 'unsent',
                        reward: m.amount || 0,
                        startDate: m.dueDate || '',
                        duration: '',
                        order: idx+1,
                        _pendingStatus: 'pending',
                        _completedStatus: completedMilestonesMap[job.id]?.includes(m.id || `${job.id}-m${idx+1}`) ? 'completed' : undefined,
                    }))
                    : [{ id: `${job.id}-m1`, projectId: job.id, title: job.name || job.title || '作業', status: 'unsent', reward: job.totalAmount || 0, startDate: job.dueDate || '', duration: '', order: 1, _pendingStatus: 'pending', _completedStatus: completedMilestonesMap[job.id]?.includes(`${job.id}-m1`) ? 'completed' : undefined }];
                base.push({
                    id: job.id,
                    name: job.name || job.title || '新規案件',
                    client: job.clientName || job.client || 'クライアント',
                    totalBudget: job.totalAmount || job.budget || 0,
                    deadline: job.dueDate || '',
                    duration: '',
                    description: job.description || '',
                    cards,
                    _pendingStatus: 'received', // Special status for client-side projects
                });
                receivedAppsIds.add(projectId);
            }
        }
    });

    // Add completed jobs (contractor completed projects)
    completedJobs.forEach(jobId => {
        if (!existingIds.has(jobId) && !receivedAppsIds.has(jobId)) {
            const job = dashboardAllProjects.find(j => j.id === jobId);
            if (job) {
                let cards = (job.milestones && Array.isArray(job.milestones) && job.milestones.length > 0)
                    ? job.milestones.map((m, idx) => ({
                        id: m.id || `${job.id}-m${idx+1}`,
                        projectId: job.id,
                        title: m.name || m.title || `マイルストーン ${idx+1}`,
                        status: 'unsent',
                        reward: m.amount || 0,
                        startDate: m.dueDate || '',
                        duration: '',
                        order: idx+1,
                        _pendingStatus: 'accepted',
                        _completedStatus: 'completed', // All milestones in completed projects are completed
                    }))
                    : [{ id: `${job.id}-m1`, projectId: job.id, title: job.name || job.title || '作業', status: 'unsent', reward: job.totalAmount || 0, startDate: job.dueDate || '', duration: '', order: 1, _pendingStatus: 'accepted', _completedStatus: 'completed' }];
                base.push({
                    id: job.id,
                    name: job.name || job.title || '完了した案件',
                    client: job.clientName || job.client || 'クライアント',
                    totalBudget: job.totalAmount || job.budget || 0,
                    deadline: job.dueDate || '',
                    duration: '',
                    description: job.description || '',
                    cards,
                    _pendingStatus: 'accepted',
                    status: '完了', // Mark as completed
                });
                existingIds.add(jobId); // Add to existingIds to prevent duplicates
            }
        }
    });

    return base;
}

export default function WorkManagementPage({ openProposalDetailsModal, onSelectProposal }) {
            // Reflect changes if application status changes globally
            useEffect(() => {
                const handler = () => setProjects(getInitialProjects());
                window.addEventListener('updatePendingApplications', handler);
                return () => window.removeEventListener('updatePendingApplications', handler);
            }, []);
        // Demo: Accept job (move from pending to inprogress)
        const handleAcceptJob = React.useCallback((jobId) => {
            // Also update global application status
            const { updateApplicationJobStatus } = require('../utils/initialData');
            updateApplicationJobStatus(jobId, 'accepted', loggedInUserDataGlobal.id);
            setProjects(getInitialProjects());
            // Dispatch event to trigger UI sync across all listeners
            window.dispatchEvent(new CustomEvent('updatePendingApplications'));
        }, []);

        // Complete milestone and release payment
        const handleCompleteMilestone = React.useCallback((cardId, projectId) => {
            const { completeMilestone, loggedInUserDataGlobal } = require('../utils/initialData');
            // Try to complete the milestone in global data (for application-based projects)
            completeMilestone(projectId, cardId, loggedInUserDataGlobal.id);

            // Update projects state directly to mark milestone as completed
            setProjects(prev => prev.map(project => {
                if (project.id === projectId || String(project.id) === String(projectId)) {
                    return {
                        ...project,
                        cards: (project.cards || []).map(card =>
                            card.id === cardId || String(card.id) === String(cardId)
                                ? { ...card, _completedStatus: 'completed' }
                                : card
                        )
                    };
                }
                return project;
            }));

            // Add history entry
            addCardHistory(cardId, {
                type: 'completed',
                text: 'マイルストーン完了・支払い処理済み',
                date: new Date().toISOString(),
                userName: loggedInUserDataGlobal.name,
                userIcon: <CheckCircle size={16} className="text-slate-400" />,
            });

            // Show toast notification
            setUndoToast({ open: true, message: 'マイルストーンが完了し、支払いが処理されました', id: Date.now() });
        }, []);

        // Expose handleAcceptJob and handleCompleteMilestone via window for SortableCard (demo)
        React.useEffect(() => {
            window.handleAcceptJob = handleAcceptJob;
            window.handleCompleteMilestone = handleCompleteMilestone;
            return () => {
                delete window.handleAcceptJob;
                delete window.handleCompleteMilestone;
            };
        }, [handleAcceptJob, handleCompleteMilestone]);
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Expose navigate to window for SortableCard
    useEffect(() => {
        window.__workManagementNavigate = navigate;
        return () => {
            delete window.__workManagementNavigate;
        };
    }, [navigate]);

    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewingProject, setReviewingProject] = useState(null);
    const [reviewerRole, setReviewerRole] = useState(null); // 'client' or 'contractor'

    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;
        const handler = () => setShowNewProjectModal(true);
        main.addEventListener('openNewProjectModal', handler);
        return () => main.removeEventListener('openNewProjectModal', handler);
    }, []);
    // const initialProjects = useMemo(() => getInitialProjects(), []);
    // Above is unnecessary; use useState(getInitialProjects()) below.
    const handleCloseNewProject = () => setShowNewProjectModal(false);
    const handleConfirmNewProject = (newProject) => {
        // newProject already has _pendingStatus set from NewProjectModal
        // 'pending' = 募集中, 'accepted' = 進行中
        const projectWithStatus = {
            ...newProject,
            status: ''
        };
        setProjects(prev => [...prev, projectWithStatus]);
        if (newProject.cards && newProject.cards.length > 0) {
            setCards(prev => [...prev, ...newProject.cards]);
        }
        setShowNewProjectModal(false);
    };

    // Review handling functions
    const handleOpenReview = (project) => {
        const { dashboardAllProjects } = require('../utils/initialData');
        const fullProject = dashboardAllProjects.find(p => p.id === project.id);
        if (!fullProject) return;

        // Determine reviewer role
        const role = fullProject.clientId === loggedInUserDataGlobal.id ? 'client' : 'contractor';
        setReviewingProject(fullProject);
        setReviewerRole(role);
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = (reviewData) => {
        if (!reviewingProject) return;

        const success = submitReview(reviewingProject.id, {
            reviewerId: loggedInUserDataGlobal.id,
            reviewerRole,
            ...reviewData,
        });

        if (success) {
            // Refresh projects to show updated review status
            setProjects(getInitialProjects());
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('reviewSubmitted', {
                detail: { projectId: reviewingProject.id }
            }));
            alert('評価を投稿しました');
        } else {
            alert('評価の投稿に失敗しました');
        }

        setIsReviewModalOpen(false);
        setReviewingProject(null);
        setReviewerRole(null);
    };

    // --- Based on logic/UI from two versions ago ---
    // --- Hybrid logic/UI, all inside WorkManagementPage function ---
    // --- State for tab switching ---
    const [projectTab, setProjectTab] = useState('inprogress');
    // --- Always display dummy projects initially ---
    // Use return value from getInitialProjects() directly
    // localStorage key
    const PROJECTS_STORAGE_KEY = 'workManagementProjects_v2';
    // Initialize: localStorage → if empty, use getInitialProjects()
    const [projects, setProjects] = useState(getInitialProjects());

    // Persist to localStorage whenever projects changes
    useEffect(() => {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }, [projects]);
    const getCardStatusInfo = (project) => {
        const cards = project.cards || [];
        const hasAccepted = cards.some(card => card._pendingStatus === 'accepted' && !card._completedStatus);
        const hasPending = cards.some(card => card._pendingStatus !== 'accepted');
        const hasCompleted = cards.some(card => card._completedStatus === 'completed');
        return { hasAccepted, hasPending, hasCompleted };
    };

    // Restore filter logic that classifies projects by tab
    const filteredProjects = useMemo(() => {
        // "received" tab: Show projects that have received applications
        if (projectTab === 'received') {
            const { getReceivedApplicationsForProject } = require('../utils/initialData');
            return projects.filter(p => getReceivedApplicationsForProject(p.id).length > 0);
        }
        // "pending" tab: show projects with any pending cards
        if (projectTab === 'pending') {
            return projects.filter(p => {
                const { hasPending } = getCardStatusInfo(p);
                return hasPending && p.status !== '完了';
            });
        }
        // "completed" tab: show projects with any completed cards
        if (projectTab === 'completed') {
            return projects.filter(p => {
                const { hasCompleted } = getCardStatusInfo(p);
                return hasCompleted;
            });
        }
        // "inprogress" tab: show projects with any accepted cards (not completed)
        return projects.filter(p => {
            const { hasAccepted } = getCardStatusInfo(p);
            return hasAccepted && p.status !== '完了';
        });
    }, [projects, projectTab]);

    // --- Message when pending tab is empty ---
    const showNoPendingMessage = projectTab === 'pending' && filteredProjects.length === 0;

    // Cards are derived from filteredProjects
    const [cards, setCards] = useState(filteredProjects.flatMap(p => p.cards || []));
    useEffect(() => {
        const allCards = filteredProjects.flatMap(p => p.cards || []);
        if (projectTab === 'inprogress') {
            // Show only accepted cards that are NOT completed
            setCards(allCards.filter(card => card._pendingStatus === 'accepted' && !card._completedStatus));
            return;
        }
        if (projectTab === 'pending') {
            // Show cards that are not yet accepted
            setCards(allCards.filter(card => card._pendingStatus !== 'accepted'));
            return;
        }
        if (projectTab === 'completed') {
            // Show only completed cards
            setCards(allCards.filter(card => card._completedStatus === 'completed'));
            return;
        }
        setCards(allCards);
    }, [filteredProjects, projectTab]);

    // Listen for payment status updates
    useEffect(() => {
        const handlePaymentUpdate = (event) => {
            // Re-fetch projects to get updated milestone status
            setProjects(getInitialProjects());
        };

        window.addEventListener('paymentStatusUpdated', handlePaymentUpdate);
        return () => window.removeEventListener('paymentStatusUpdated', handlePaymentUpdate);
    }, []);

    // Listen for contract status updates
    useEffect(() => {
        const handleContractUpdate = (event) => {
            // Re-fetch projects after contract acceptance/rejection
            setProjects(getInitialProjects());
        };

        window.addEventListener('contractStatusUpdated', handleContractUpdate);
        return () => window.removeEventListener('contractStatusUpdated', handleContractUpdate);
    }, []);

    // Listen for received applications updates (from proposal selection)
    useEffect(() => {
        const handleReceivedAppsUpdate = (event) => {
            // Re-fetch projects after proposal selection
            setProjects(getInitialProjects());
        };

        window.addEventListener('receivedApplicationsUpdated', handleReceivedAppsUpdate);
        return () => window.removeEventListener('receivedApplicationsUpdated', handleReceivedAppsUpdate);
    }, []);

    const cardRefs = useRef({});
    // DnD: Manage drag/over state
    const [dragOverInfo, setDragOverInfo] = useState({ groupKey: null, overIndex: null });
    const [viewSettings, setViewSettings] = useState({ layout: 'list', groupBy: 'project', sortBy: 'startDate' });
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    // Configure sensors: Mouse uses distance; Touch uses press delay for mobile
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );
    // Handlers for grouping, sorting, and layout switching
    const handleGroupByChange = (e) => {
        setViewSettings(v => ({ ...v, groupBy: e.target.value }));
    };
    const handleSortByChange = (e) => {
        setViewSettings(v => ({ ...v, sortBy: e.target.value }));
    };
    const handleLayoutChange = (layout) => {
        setViewSettings(v => ({ ...v, layout }));
    };
    // Use shared util for grouping/sorting for testability and reuse
    const groupedCards = useMemo(() => {
        const { default: groupUtil } = require('../utils/groupCards');
        return groupUtil(cards, viewSettings, filteredProjects);
    }, [cards, viewSettings, filteredProjects]);
    // --- Restore edit, undo, toast, etc. ---
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const [undoStack, setUndoStack] = useState([]); // {prevCards, message, id}
    const [undoToast, setUndoToast] = useState({ open: false, message: '', id: null });
    // ID of the card being dragged
    const [activeId, setActiveId] = useState(null);
    // Get info of the card being dragged
    const activeCard = activeId != null ? cards.find(card => Number(card.id) === Number(activeId)) : null;
    const handleEditClick = (card) => {
        setEditingCard({ ...card }); // Copy for editing
        setEditErrors({});
        initCardHistoryIfNeeded(card);
        setEditModalOpen(true);
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingCard((prev) => ({ ...prev, [name]: value }));
        validateEdit({ ...editingCard, [name]: value });
    };
    const validateEdit = (card) => {
        const errors = {};
        if (!card.title || card.title.trim() === "") errors.title = "タイトルは必須です";
        if (!card.startDate) errors.startDate = "開始日は必須です";
        if (!card.duration || isNaN(card.duration) || Number(card.duration) < 1) errors.duration = "作業日数は1以上の数字で入力してください";
        if (!card.reward || isNaN(card.reward) || Number(card.reward) < 0) errors.reward = "報酬額は0以上の数字で入力してください";
        if (!card.status) errors.status = "ステータスを選択してください";
        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSaveEdit = () => {
        if (!validateEdit(editingCard)) return;
        setUndoStack(prev => [...prev, { prevCards: cards.map(c => ({ ...c })), message: 'カードを編集しました', id: Date.now() }]);
        setUndoToast({ open: true, message: 'カードを編集しました', id: Date.now() });

        // Update milestone progress status if it changed
        if (editingCard.progressStatus) {
            const { updateMilestoneStatus } = require('../utils/initialData');
            const statusMap = { 'notStarted': 'notStarted', 'inProgress': 'inProgress', 'completed': 'completed' };
            updateMilestoneStatus(editingCard.id, statusMap[editingCard.progressStatus], '進捗ステータスを更新');
        }

        setCards(prev => prev.map(card => card.id === editingCard.id ? { ...editingCard, status: 'edited' } : card));
        // Add history entry
        addCardHistory(editingCard.id, {
          type: 'edited',
          text: 'カード内容を編集',
          date: new Date().toISOString(),
          userName: loggedInUserDataGlobal.name,
          userIcon: <Pencil size={16} className="text-slate-400" />,
        });
        setEditModalOpen(false);
    };
    const handleCloseModal = () => {
        setEditModalOpen(false);
        setEditingCard(null);
        setEditErrors({});
    };
    const handleUndo = (undoId) => {
        const undoItem = undoStack.find(u => u.id === undoId);
        if (undoItem) {
            setCards(undoItem.prevCards.map(c => ({ ...c })));
            setUndoStack(stack => stack.filter(u => u.id !== undoId));
            setUndoToast({ open: false, message: '', id: null });
        }
    };
    // --- Tab switch UI ---
    const tabDefs = [
        { key: 'inprogress', label: '進行中', icon: PlayCircle },
        { key: 'pending', label: '応募中', icon: Mail },
        { key: 'completed', label: '完了', icon: CheckCircle },
        { key: 'received', label: '受信応募', icon: Inbox },
    ];
    const normalizeProjectId = (value) => {
        if (!value) return value;
        if (typeof value === 'string' && value.startsWith('project-')) {
            return value.replace('project-', '');
        }
        return value;
    };

    const formatDateForDisplay = (isoString) => {
        if (!isoString) return '未設定';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        } catch {
            return isoString;
        }
    };

    const renderReceivedApplications = (projectId) => {
        const normalizedProjectId = normalizeProjectId(projectId);
        const { getReceivedApplicationsForProject } = require('../utils/initialData');
        const receivedApps = getReceivedApplicationsForProject(normalizedProjectId);

        if (!receivedApps.length) {
            return (
                <div className="bg-white rounded-lg shadow-lg p-4 mb-2 text-sm text-slate-500">
                    受け取った応募はありません
                </div>
            );
        }

        return receivedApps.map(app => {
            // Find proposal data for this applicant
            const { dashboardAllProjects } = require('../utils/initialData');
            const project = dashboardAllProjects.find(p => String(p.id) === String(normalizedProjectId));
            const proposal = project?.proposals?.find(p => p.contractorId === app.applicantId);

        return (
            <div key={`${normalizedProjectId}-${app.applicantId}`} className="bg-white rounded-lg shadow-lg p-4 mb-3 flex flex-col hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800">{app.applicantName}</span>
                    <span className={
                        `text-xs font-semibold rounded-full px-2 py-0.5 bg-slate-200 text-slate-600`
                    }>
                        {app.status === 'pending' ? '検討中' : app.status === 'offered' ? '採用提示済' : app.status === 'accepted' ? '採用' : '不採用'}
                    </span>
                </div>

                {/* Portfolio Summary */}
                {proposal?.contractorPortfolio && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <div className="text-center">
                                <div className="text-xs text-slate-600">完了数</div>
                                <div className="text-lg font-bold text-indigo-600">{proposal.contractorPortfolio.totalProjects}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-600">完了率</div>
                                <div className="text-lg font-bold text-green-600">{proposal.contractorPortfolio.completionRate}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-600">リピート率</div>
                                <div className="text-lg font-bold text-blue-600">{proposal.contractorPortfolio.repeatClientRate}%</div>
                            </div>
                        </div>
                        {proposal.contractorPortfolio.specialties && proposal.contractorPortfolio.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {proposal.contractorPortfolio.specialties.slice(0, 4).map((specialty, idx) => (
                                    <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                        {specialty}
                                    </span>
                                ))}
                                {proposal.contractorPortfolio.specialties.length > 4 && (
                                    <span className="text-xs text-slate-500 px-2 py-0.5">
                                        +{proposal.contractorPortfolio.specialties.length - 4}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Proposal Preview */}
                {proposal?.proposalText && (
                    <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                        {proposal.proposalText}
                    </p>
                )}

                <div className="text-xs text-slate-500 mb-3">
                    応募日: {formatDateForDisplay(app.appliedAt)}
                </div>

                {proposal && openProposalDetailsModal && app.status === 'pending' && (
                    <button
                        onClick={() => {
                            // Determine navigation context
                            const from = window.location.pathname.includes('progress-dashboard') ? 'progress-dashboard' : 'work-management';
                            const proposalWithProject = { ...proposal, projectId: normalizedProjectId, applicationStatus: app.status, from };
                            openProposalDetailsModal(proposalWithProject);
                        }}
                        className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Inbox size={18} className="text-slate-200 mr-1" /> 詳細を見る
                    </button>
                )}
            </div>
        );
    });
    };

    // --- Main return block ---
    return (
        <div className="flex h-screen overflow-hidden">
            {showNoPendingMessage && (
                <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-white border border-yellow-300 rounded-lg shadow-lg px-8 py-6 text-center">
                    <div className="text-2xl mb-2">🕒</div>
                    <div className="text-lg font-bold text-yellow-700 mb-1">応募済みの仕事はまだクライアントの審査中です</div>
                    <div className="text-sm text-slate-600">採用されると「進行中」タブに自動で表示されます。<br/>しばらくお待ちください。</div>
                </div>
            )}
            {/* Remove manual add button for pending tab */}
            {/* New Project Modal (ProjectFlowDemo style) */}
            <NewProjectModal
                open={showNewProjectModal}
                onClose={handleCloseNewProject}
                onConfirm={handleConfirmNewProject}
                nextProjectId={`project-${projects.length + 1}`}
                nextCardId={`card-${cards.length + 1}`}
            />
            {/* Review Modal */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false);
                    setReviewingProject(null);
                    setReviewerRole(null);
                }}
                onSubmit={handleSubmitReview}
                project={reviewingProject}
                reviewerRole={reviewerRole}
                t={t}
            />
            {/* Undo Toast Notification */}
            {undoToast.open && (
                <div className="fixed bottom-8 right-8 bg-slate-800 text-white py-3 px-5 rounded-lg shadow-lg flex items-center gap-4 z-50">
                    <p className="text-sm font-medium">{undoToast.message}</p>
                    <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300" onClick={() => handleUndo(undoToast.id)}>元に戻す</button>
                </div>
            )}
            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-8 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b">
                            <h3 className="text-2xl font-bold">仕事の編集</h3>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <input type="hidden" name="edit-card-id" value={editingCard.id} />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">タイトル</label>
                                    <p className="mt-1 text-lg font-semibold text-slate-800">{editingCard.title}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">開始日</label>
                                        <input type="date" name="startDate" value={editingCard.startDate} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                                        {editErrors.startDate && <p className="text-xs text-red-500 mt-1">{editErrors.startDate}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">作業日数</label>
                                        <input type="number" name="duration" min="1" value={editingCard.duration} onChange={handleEditInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                                        {editErrors.duration && <p className="text-xs text-red-500 mt-1">{editErrors.duration}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mt-4">進捗ステータス</label>
                                    <select name="progressStatus" value={editingCard.progressStatus || 'notStarted'} onChange={(e) => {
                                        setEditingCard(prev => ({ ...prev, progressStatus: e.target.value }));
                                    }} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="notStarted">未開始</option>
                                        <option value="inProgress">進捗中</option>
                                        <option value="completed">完了</option>
                                    </select>
                                </div>
                                {/* --- History timeline --- */}
                                <div className="mt-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">アクション履歴</label>
                                    <CardHistoryTimeline history={getCardHistory(editingCard.id)} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
                            <button className="bg-white border border-slate-300 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50" onClick={handleCloseModal}>キャンセル</button>
                            <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700" onClick={handleSaveEdit}>保存</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <div className="w-full max-w-4xl mx-auto mt-4 mb-2 flex gap-2">
                    {tabDefs.map(tab => {
                        let tabCount = 0;
                        if (tab.key === 'pending') {
                            tabCount = projects.filter(p => {
                                const cards = p.cards || [];
                                return cards.some(card => card._pendingStatus !== 'accepted') && p.status !== '完了';
                            }).length;
                        } else if (tab.key === 'inprogress') {
                            tabCount = projects.filter(p => {
                                const cards = p.cards || [];
                                return cards.some(card => card._pendingStatus === 'accepted' && !card._completedStatus) && p.status !== '完了';
                            }).length;
                        } else if (tab.key === 'completed') {
                            tabCount = projects.filter(p => {
                                const cards = p.cards || [];
                                return cards.some(card => card._completedStatus === 'completed');
                            }).length;
                        } else if (tab.key === 'received') {
                            const { getReceivedApplicationsForProject } = require('../utils/initialData');
                            tabCount = projects.filter(p => getReceivedApplicationsForProject(p.id).length > 0).length;
                        }
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all flex flex-col md:flex-row md:items-center md:justify-center items-center justify-center ${projectTab === tab.key ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
                                onClick={() => setProjectTab(tab.key)}
                                style={{minWidth: '56px'}}
                            >
                                {/* Mobile: icon only, PC: icon + label */}
                                <span className="block md:hidden">
                                    <Icon size={22} strokeWidth={2.2} className="text-slate-500" />
                                </span>
                                <span className="hidden md:flex md:items-center">
                                    <Icon size={20} strokeWidth={2.1} className="mr-1 text-slate-500" />
                                    <span>{tab.label}</span>
                                </span>
                                <span className="text-xs text-slate-500 ml-0 md:ml-1 mt-1 md:mt-0">({tabCount})</span>
                            </button>
                        );
                    })}
                </div>
                {projectTab === 'pending' && (
                    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 -mt-1 mb-3">
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <div className="font-semibold text-slate-700">応募後の流れ</div>
                            <div className="mt-1">クライアント確認後、採用されると「進行中」へ自動で移動します。</div>
                            <div className="mt-2 text-xs text-slate-500">応募中: {filteredProjects.length}件</div>
                        </div>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {/* View Settings Panel - Mobile optimized with hamburger menu */}
                        <div className="sticky top-12 z-20 bg-slate-100 py-1 mb-0" style={{marginLeft: window.innerWidth < 768 ? 0 : '-2rem', marginRight: window.innerWidth < 768 ? 0 : '-2rem', paddingLeft: window.innerWidth < 768 ? '1rem' : '2rem', paddingRight: window.innerWidth < 768 ? '1rem' : '2rem'}}>
                          {/* Mobile: Hamburger Menu */}
                          <div className="md:hidden flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-700">表示設定</span>
                            <button
                              onClick={() => setShowMobileMenu(!showMobileMenu)}
                              className="p-2 hover:bg-slate-200 rounded-lg transition"
                            >
                              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                            </button>
                          </div>

                          {/* Desktop: Full Controls */}
                          <div className="hidden md:flex flex-row justify-between items-center gap-3">
                            <div className="flex flex-row flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold text-slate-500">レイアウト:</span>
                                    <div className="inline-flex rounded-md shadow-sm bg-transparent p-1">
                                        <button
                                            className={`view-control-btn px-2 py-1 text-sm font-semibold text-slate-600 rounded-md ${viewSettings.layout === 'list' ? 'bg-indigo-100' : ''}`}
                                            onClick={() => handleLayoutChange('list')}
                                        >リスト</button>
                                        <button
                                            className={`view-control-btn px-2 py-1 text-sm font-semibold text-slate-600 rounded-md ${viewSettings.layout === 'board' ? 'bg-indigo-100' : ''}`}
                                            onClick={() => handleLayoutChange('board')}
                                        >ボード</button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold text-slate-500">グループ化:</span>
                                    <select id="group-by-select" value={viewSettings.groupBy} onChange={handleGroupByChange} className="bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="project">プロジェクト</option>
                                        <option value="status">ステータス</option>
                                        <option value="dueDate">期日</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold text-slate-500">並べ替え:</span>
                                    <select id="sort-by-select" value={viewSettings.sortBy} onChange={handleSortByChange} className="bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="startDate">開始日 (昇順)</option>
                                        <option value="reward">報酬額 (降順)</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
                                onClick={() => setShowNewProjectModal(true)}
                            >
                                ＋ 新規案件登録
                            </button>
                          </div>

                          {/* Mobile: Expanded Menu */}
                          {showMobileMenu && (
                            <div className="md:hidden mt-3 pt-3 border-t border-slate-300 space-y-3">
                              <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-slate-600">レイアウト:</span>
                                <div className="flex gap-2">
                                  <button
                                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition ${viewSettings.layout === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
                                    onClick={() => {
                                      handleLayoutChange('list');
                                      setShowMobileMenu(false);
                                    }}
                                  >リスト</button>
                                  <button
                                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition ${viewSettings.layout === 'board' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
                                    onClick={() => {
                                      handleLayoutChange('board');
                                      setShowMobileMenu(false);
                                    }}
                                  >ボード</button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-600">グループ化:</label>
                                <select id="group-by-select-mobile" value={viewSettings.groupBy} onChange={(e) => {
                                  handleGroupByChange(e);
                                  setShowMobileMenu(false);
                                }} className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700">
                                  <option value="project">プロジェクト</option>
                                  <option value="status">ステータス</option>
                                  <option value="dueDate">期日</option>
                                </select>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-slate-600">並べ替え:</label>
                                <select id="sort-by-select-mobile" value={viewSettings.sortBy} onChange={(e) => {
                                  handleSortByChange(e);
                                  setShowMobileMenu(false);
                                }} className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-700">
                                  <option value="startDate">開始日 (昇順)</option>
                                  <option value="reward">報酬額 (降順)</option>
                                </select>
                              </div>

                              <button
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
                                onClick={() => {
                                  setShowNewProjectModal(true);
                                  setShowMobileMenu(false);
                                }}
                              >
                                ＋ 新規案件登録
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="h-16"></div>
                        {/* View Area: layout switch */}
                        {viewSettings.layout === 'list' ? (
                            <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={e => setActiveId(e.active.id)}
                                onDragOver={e => {
                                    // Record column/list index on drag over
                                    const { over } = e;
                                    if (!over) return setDragOverInfo({ groupKey: null, overIndex: null });
                                    let targetGroupKey = null;
                                    let overIndex = null;
                                    for (const [groupKey, groupCards] of Object.entries(groupedCards)) {
                                        const ids = groupCards.map(card => card.id.toString());
                                        const idx = ids.indexOf(over.id.toString());
                                        if (idx !== -1) {
                                            targetGroupKey = groupKey;
                                            overIndex = idx;
                                            break;
                                        }
                                    }
                                    setDragOverInfo({ groupKey: targetGroupKey, overIndex });
                                }}
                                onDragEnd={e => {
                                    setActiveId(null);
                                    setDragOverInfo({ groupKey: null, overIndex: null });
                                    const { active, over } = e;
                                    if (!over || active.id === over.id) return;
                                    let targetGroupKey = null;
                                    let overIndex = null;
                                    // Handle empty list DnD
                                    if (typeof over.id === 'string' && over.id.startsWith('empty-dropzone-')) {
                                        targetGroupKey = over.id.replace('empty-dropzone-', '');
                                        overIndex = 0;
                                    } else {
                                        for (const [groupKey, groupCards] of Object.entries(groupedCards)) {
                                            const ids = groupCards.map(card => card.id.toString());
                                            const idx = ids.indexOf(over.id.toString());
                                            if (idx !== -1) {
                                                targetGroupKey = groupKey;
                                                overIndex = idx;
                                                break;
                                            }
                                        }
                                    }
                                    if (!targetGroupKey) return;
                                    const movingCard = cards.find(card => card.id === active.id);
                                    if (!movingCard) return;
                                    // If groupBy is dueDate, disallow cross-group moves
                                    if (viewSettings.groupBy === 'dueDate') {
                                        // Do nothing if source and target groups differ
                                        let fromGroupKey = null;
                                        for (const [groupKey, groupCards] of Object.entries(groupedCards)) {
                                            if (groupCards.some(card => card.id === movingCard.id)) {
                                                fromGroupKey = groupKey;
                                                break;
                                            }
                                        }
                                        if (fromGroupKey !== targetGroupKey) return;
                                    }
                                    // const targetCards = groupedCards[targetGroupKey];
                                    // overIndex: 0 for empty list DnD, otherwise index of existing card
                                    setCards(prev => {
                                        let updated = [...prev];
                                        if (viewSettings.groupBy === 'project') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, projectId: targetGroupKey } : card
                                            );
                                        } else if (viewSettings.groupBy === 'status') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, status: targetGroupKey } : card
                                            );
                                        } else if (viewSettings.groupBy === 'dueDate') {
                                            // Cross-group moves are already blocked; only same-group DnD here
                                            // Keep empty startDate for "no due date" group; otherwise recalc startDate in new order
                                            if (targetGroupKey === '期日未設定') {
                                                // Do nothing (updated = prev)
                                                return updated;
                                            } else {
                                                // Recalculate startDate in new order
                                                // targetGroupKey is a date string
                                                // First item uses targetGroupKey date, then add duration sequentially
                                                // Use the group card array directly
                                                const groupCardsArr = groupedCards[targetGroupKey] || [];
                                                let movingIdx = groupCardsArr.findIndex(card => card.id === movingCard.id);
                                                let overIdx = groupCardsArr.findIndex(card => card.id === over.id);
                                                if (movingIdx === -1 || overIdx === -1) return updated;
                                                let reordered = arrayMove(groupCardsArr, movingIdx, overIdx);
                                                let baseDate = new Date(targetGroupKey);
                                                if (isNaN(baseDate.getTime())) baseDate = new Date();
                                                for (let i = 0; i < reordered.length; i++) {
                                                    let card = reordered[i];
                                                    if (!card) continue;
                                                    let duration = Number(card.duration) || 1;
                                                    card = { ...card, startDate: baseDate.toISOString().split('T')[0] };
                                                    baseDate.setDate(baseDate.getDate() + duration);
                                                    reordered[i] = card;
                                                }
                                                // Keep overall card order, replace only target group with reordered
                                                let result = [];
                                                let usedIds = new Set(reordered.map(c => c.id));
                                                for (let card of updated) {
                                                    if (usedIds.has(card.id)) {
                                                        if (reordered.length) {
                                                            result.push(reordered.shift());
                                                        }
                                                    } else {
                                                        result.push(card);
                                                    }
                                                }
                                                return result;
                                            }
                                        } else {
                                        }
                                        // Apply new in-group order to the full cards list
                                        let newTargetCards = updated.filter(card =>
                                            viewSettings.groupBy === 'project' ? card.projectId === targetGroupKey :
                                            viewSettings.groupBy === 'status' ? card.status === targetGroupKey :
                                            viewSettings.groupBy === 'dueDate' ? card.startDate === targetGroupKey :
                                            false
                                        );
                                        const movingIdx = newTargetCards.findIndex(card => card.id === movingCard.id);
                                        let reordered = arrayMove(newTargetCards, movingIdx, overIndex);
                                        if (viewSettings.groupBy === 'project') {
                                            // For project group, recalc dates based on earliest start date in group
                                            let baseDate = null;
                                            for (const card of newTargetCards) {
                                                if (card.startDate) {
                                                    const cardDate = new Date(card.startDate);
                                                    if (baseDate === null || cardDate < baseDate) {
                                                        baseDate = cardDate;
                                                    }
                                                }
                                            }
                                            if (baseDate === null) baseDate = new Date();

                                            for (let i = 0; i < reordered.length; i++) {
                                                let card = reordered[i];
                                                let duration = Number(card.duration) || 1;
                                                card = { ...card, startDate: baseDate.toISOString().split('T')[0] };
                                                baseDate.setDate(baseDate.getDate() + duration);
                                                reordered[i] = card;
                                            }
                                        }
                                        let result = [];
                                        let usedIds = new Set(reordered.map(c => c.id));
                                        for (let card of updated) {
                                            if (usedIds.has(card.id)) {
                                                if (reordered.length) {
                                                    result.push(reordered.shift());
                                                }
                                            } else {
                                                result.push(card);
                                            }
                                        }
                                        return result;
                                    });
                                }}
                            >
                                {/* DragOverlay: render dragging card at body root so it stays visible */}
                                <DragOverlay dropAnimation={null}>
                                    {activeCard && (
                                        <SortableCard card={activeCard} activeId={activeId} projects={projects} layout={viewSettings.layout} />
                                    )}
                                </DragOverlay>
                                <div id="view-area" className="flex flex-col gap-8">
                                    {Object.entries(groupedCards).map(([groupKey, groupCards]) => {
                                        // Use groupKey as-is
                                        // --- Group title, subtitle, warning ---
                                        let groupTitle = groupKey;
                                        let subTitle = '';
                                        let warning = '';
                                        let budgetDisplay = '';
                                        let deadlineDisplay = '';
                                        let durationDisplay = '';
                                        if (viewSettings.groupBy === 'project') {
                                            const project = projects.find(p => String(p.id) === String(groupKey));
                                            groupTitle = project?.name || groupKey;
                                            subTitle = project?.client ? `（${project.client}）` : '';
                                            if (project) {
                                                if (project.totalBudget && Number(project.totalBudget) > 0) {
                                                    budgetDisplay = `予算: ¥${Number(project.totalBudget).toLocaleString()}`;
                                                } else {
                                                    budgetDisplay = '予算未設定';
                                                }
                                                if (project.deadline) {
                                                    deadlineDisplay = `期日: ${project.deadline}`;
                                                } else {
                                                    deadlineDisplay = '期日未設定';
                                                }
                                                if (project.duration && Number(project.duration) > 0) {
                                                    durationDisplay = `期間: ${project.duration}日`;
                                                } else {
                                                    durationDisplay = '期間未設定';
                                                }
                                                const lastDueDate = groupCards.map(card => {
                                                    if (!card.startDate || !card.duration) return '';
                                                    const d = new Date(card.startDate);
                                                    d.setDate(d.getDate() + Number(card.duration));
                                                    return d.toISOString().split('T')[0];
                                                }).reduce((max, d) => (d && d > max ? d : max), '');
                                                if (lastDueDate && project.deadline && lastDueDate > project.deadline) {
                                                    warning = '警告: プロジェクトの期日を超過しています！';
                                                }
                                            }
                                        } else if (viewSettings.groupBy === 'status') {
                                            const statusLabels = {
                                                unsent: t('statusUnsent', '未編集'),
                                                edited: t('statusEdited', '編集済'),
                                                awaiting_approval: t('statusAwaitingApproval', '承認待ち'),
                                                revision_needed: t('statusRevisionNeeded', '要修正'),
                                                approved: t('statusApproved', '承認済'),
                                                completed: t('statusCompleted', '完了'),
                                                pending: t('statusPending', '応募中'),
                                                inprogress: t('statusInProgress', '進行中'),
                                            };
                                            groupTitle = statusLabels[groupKey] || t(groupKey, groupKey);
                                        } else if (viewSettings.groupBy === 'dueDate') {
                                            const dueLabels = {
                                                '期限切れ': '期限切れ',
                                                '今日が期日': '今日が期日',
                                                '今後': '今後',
                                                '期日未設定': '期日未設定',
                                            };
                                            groupTitle = dueLabels[groupKey] || groupKey;
                                        }
                                        const isEmpty = groupCards.length === 0;
                                        return (
                                            <div key={groupKey} className={`mb-8 ${dragOverInfo.groupKey === groupKey ? 'drag-over' : ''}`}>
                                                <div className="w-full p-6 pb-3 bg-slate-50 border-b border-slate-200">
                                                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                                        {groupTitle}
                                                        {subTitle && <span className="text-xs text-slate-400 ml-2">{subTitle}</span>}
                                                    </h3>
                                                    {/* Project attributes */}
                                                    {viewSettings.groupBy === 'project' && (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <span className="text-xs text-green-700 bg-green-100 rounded px-2 py-0.5">{budgetDisplay}</span>
                                                            <span className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-0.5">{deadlineDisplay}</span>
                                                            <span className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-0.5">{durationDisplay}</span>
                                                        </div>
                                                    )}
                                                    {viewSettings.groupBy === 'project' && projects.find(p => String(p.id) === String(groupKey))?.deadline && (
                                                        <p className="text-sm text-slate-500">プロジェクト期日: {projects.find(p => String(p.id) === String(groupKey))?.deadline}</p>
                                                    )}
                                                    {warning && <p className="text-sm font-bold text-red-500 mt-1">{warning}</p>}
                                                    {/* Project Detail Link */}
                                                    {viewSettings.groupBy === 'project' && projectTab !== 'pending' && (
                                                        <button
                                                            onClick={() => navigate(`/project-detail?projectId=${groupKey}`)}
                                                            className="mt-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
                                                        >
                                                            <BarChart size={16} className="text-slate-400" />
                                                            <span>詳細を見る</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Payment Summary for project view in inprogress tab */}
                                                {viewSettings.groupBy === 'project' && projectTab === 'inprogress' && (() => {
                                                    const project = projects.find(p => String(p.id) === String(groupKey));
                                                    if (!project) return null;

                                                    // Get full project data from dashboardAllProjects for payment info
                                                    const { dashboardAllProjects } = require('../utils/initialData');
                                                    const fullProject = dashboardAllProjects.find(p => String(p.id) === String(groupKey));
                                                    if (!fullProject) return null;

                                                    const paymentStatus = getProjectPaymentStatus(fullProject);
                                                    return (
                                                        <ProjectPaymentSummary project={fullProject} paymentStatus={paymentStatus} />
                                                    );
                                                })()}

                                                {/* Review Button for completed tab */}
                                                {viewSettings.groupBy === 'project' && projectTab === 'completed' && (() => {
                                                    const project = projects.find(p => String(p.id) === String(groupKey));
                                                    if (!project) return null;

                                                    const { dashboardAllProjects } = require('../utils/initialData');
                                                    const fullProject = dashboardAllProjects.find(p => String(p.id) === String(groupKey));
                                                    if (!fullProject || fullProject.status !== '完了') return null;

                                                    const needsUserReview = needsReview(fullProject.id, loggedInUserDataGlobal.id);
                                                    const isClient = fullProject.clientId === loggedInUserDataGlobal.id;
                                                    const partnerName = isClient ? fullProject.contractorName : fullProject.clientName;
                                                    const userReview = getUserReview(fullProject.id, loggedInUserDataGlobal.id);

                                                    // Determine which rating to show (user gave or user received)
                                                    const partnerRating = isClient ? fullProject.clientRating : fullProject.contractorRating;

                                                    return (
                                                        <div className="w-full pb-3 space-y-2">
                                                            {/* Display user's submitted review */}
                                                            {userReview && (
                                                                <div className="bg-white border border-slate-200 rounded-lg p-4 mb-2 flex flex-col w-full">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-xs font-semibold text-gray-700">
                                                                            {partnerName} さんへの評価
                                                                        </span>
                                                                        <StarRatingDisplay
                                                                            score={userReview.rating}
                                                                            size="sm"
                                                                            lang="ja"
                                                                        />
                                                                    </div>
                                                                    {userReview.comment && (
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {userReview.comment}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Display partner's rating if exists */}
                                                            {partnerRating && partnerRating.averageScore > 0 && (
                                                                <div className="bg-white border border-slate-200 rounded-lg p-4 mb-2 flex flex-col w-full">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-semibold text-blue-900">
                                                                            {partnerName} さんから受け取った評価
                                                                        </span>
                                                                        <StarRatingDisplay
                                                                            score={partnerRating.averageScore}
                                                                            totalReviews={partnerRating.totalReviews}
                                                                            size="sm"
                                                                            lang="ja"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Review action button */}
                                                            {needsUserReview ? (
                                                                <button
                                                                    onClick={() => handleOpenReview(fullProject)}
                                                                    className="bg-white border border-slate-200 rounded-lg p-4 mb-2 flex flex-col w-full px-0 py-0 text-yellow-700 hover:bg-yellow-50 transition text-sm font-semibold items-center justify-center gap-2"
                                                                >
                                                                    <span className="w-full px-4 py-2 bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg flex items-center justify-center gap-2"><Star size={16} className="text-slate-400" /> {partnerName} さんを評価する</span>
                                                                </button>
                                                            ) : (
                                                                <div className="bg-white border border-slate-200 rounded-lg p-4 mb-2 flex flex-col w-full">
                                                                    <span className="w-full px-4 py-2 bg-slate-100 text-slate-400 text-sm rounded-lg flex items-center justify-center gap-2"><CheckCircle size={16} className="text-slate-400" /> 評価済み</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                    <SortableContext
                                                        items={isEmpty ? [`empty-dropzone-${groupKey}`] : groupCards.map(card => card.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                    <div className="space-y-0">
                                                        {isEmpty
                                                            ? null
                                                            : projectTab === 'pending'
                                                                ? groupCards.map((card, idx) => {
                                                                    const project = projects.find(p => String(p.id) === String(card.projectId));
                                                                    const jobId = project?.id;
                                                                    const { getPendingApplicationJobsForUser } = require('../utils/initialData');
                                                                    const currentPendingApps = getPendingApplicationJobsForUser(loggedInUserDataGlobal.id);
                                                                    const applicationData = currentPendingApps.find(app => app.jobId === jobId);

                                                                    // Format dates from ISO strings
                                                                    const formatDate = (isoString) => {
                                                                        if (!isoString) return '未設定';
                                                                        try {
                                                                            const date = new Date(isoString);
                                                                            return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
                                                                        } catch {
                                                                            return isoString;
                                                                        }
                                                                    };

                                                                    const appliedDate = formatDate(applicationData?.appliedAt) || card.appliedDate || card.startDate || project?.appliedDate || '未設定';
                                                                    const deadline = formatDate(applicationData?.responseDeadline);
                                                                    const clientName = project?.client || project?.clientName || 'クライアント';
                                                                    const appStatus = applicationData?.status || 'pending';

                                                                    // Status display
                                                                    let statusDisplay = '確認中';
                                                                    let statusBg = 'bg-slate-100';
                                                                    let statusText = 'text-slate-600';
                                                                    let statusMessage = 'クライアントが確認中です。次の操作は不要です。';

                                                                    if (appStatus === 'offered') {
                                                                        statusDisplay = '採用提示';
                                                                        statusBg = 'bg-blue-100';
                                                                        statusText = 'text-blue-700';
                                                                        statusMessage = 'クライアントから採用の提示を受けています。受け入れるかどうか選択してください。';
                                                                    } else if (appStatus === 'accepted') {
                                                                        statusDisplay = '採用';
                                                                        statusBg = 'bg-green-100';
                                                                        statusText = 'text-green-700';
                                                                        statusMessage = '採用を受け入れました。進行中タブに移動しています。';
                                                                    } else if (appStatus === 'rejected') {
                                                                        statusDisplay = '不採用';
                                                                        statusBg = 'bg-red-100';
                                                                        statusText = 'text-red-700';
                                                                        statusMessage = '申し訳ございません。今回は選考に進みませんでした。';
                                                                    }

                                                                    return (
                                                                        <div key={card.id} className="bg-white border border-slate-200 rounded-lg p-4 mb-2 flex flex-col">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-semibold text-slate-800">{card.title}</span>
                                                                                <span className={`ml-2 text-xs font-semibold rounded px-2 py-0.5 ${statusBg} ${statusText}`}>{statusDisplay}</span>
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 mt-1">{statusMessage}</div>
                                                                            <div className="text-xs text-slate-500 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                                                                                <span>応募先: {clientName}</span>
                                                                                <span>応募日: {appliedDate}</span>
                                                                                <span>回答期限: {deadline}</span>
                                                                            </div>
                                                                            {appStatus === 'offered' && (
                                                                                <div className="mt-3">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            navigate(`/contractReview?projectId=${jobId}`);
                                                                                        }}
                                                                                        className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 transition flex items-center justify-center"
                                                                                    >
                                                                                        <Clipboard size={16} className="inline text-slate-400 mr-1" />契約内容を確認
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })
                                                                : projectTab === 'received'
                                                                    ? renderReceivedApplications(groupCards[0]?.projectId || groupKey)
                                                                    : projectTab === 'completed'
                                                                        ? groupCards.map((card, idx) => (
                                                                            <SortableCard key={card.id} card={card} onEdit={handleEditClick} activeId={activeId} projects={projects} layout={viewSettings.layout} projectTab={projectTab} />
                                                                        ))
                                                                        : groupCards.map((card, idx) => (
                                                                            <SortableCard key={card.id} card={card} onEdit={handleEditClick} activeId={activeId} projects={projects} layout={viewSettings.layout} projectTab={projectTab} />
                                                                        ))}
                                                    </div>
                                                </SortableContext>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DndContext>
                            </>
                        ) : (
                            // Board view: Kanban UI similar to HTML version
                            <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={e => setActiveId(e.active.id)}
                                onDragOver={e => {
                                    const { over } = e;
                                    if (!over) return setDragOverInfo({ groupKey: null, overIndex: null });
                                    let targetGroupKey = null;
                                    let overIndex = null;
                                    if (typeof over.id === 'string' && over.id.startsWith('column-dropzone-')) {
                                        targetGroupKey = over.id.replace('column-dropzone-', '');
                                        overIndex = groupedCards[targetGroupKey]?.length || 0;
                                    } else {
                                    for (const [groupKey, groupCards] of Object.entries(groupedCards)) {
                                        const ids = groupCards.map(card => card.id.toString());
                                        const idx = ids.indexOf(over.id.toString());
                                        if (idx !== -1) {
                                            targetGroupKey = groupKey;
                                            overIndex = idx;
                                            break;
                                        }
                                    }
                                    }
                                    setDragOverInfo({ groupKey: targetGroupKey, overIndex });
                                }}
                                onDragEnd={e => {
                                    const { active, over } = e;
                                    // Use last hovered group as fallback if over is null
                                    let fallbackOver = over;
                                    if (!fallbackOver && dragOverInfo.groupKey) {
                                        fallbackOver = { id: `column-dropzone-${dragOverInfo.groupKey}` };
                                    }
                                    setActiveId(null);
                                    setDragOverInfo({ groupKey: null, overIndex: null });
                                    if (!fallbackOver || active.id === fallbackOver.id) return;

                                    // Identify target column
                                    let targetGroupKey = null;
                                    // Handle empty column / end-of-column DnD
                                    if (typeof fallbackOver.id === 'string' && fallbackOver.id.startsWith('empty-dropzone-')) {
                                        targetGroupKey = fallbackOver.id.replace('empty-dropzone-', '');
                                    } else if (typeof fallbackOver.id === 'string' && fallbackOver.id.startsWith('column-dropzone-')) {
                                        targetGroupKey = fallbackOver.id.replace('column-dropzone-', '');
                                    } else {
                                        // If dropped on a card, resolve its column
                                        for (const [groupKey, groupCards] of Object.entries(groupedCards)) {
                                            if (groupCards.some(card => card.id.toString() === fallbackOver.id.toString())) {
                                                targetGroupKey = groupKey;
                                                break;
                                            }
                                        }
                                    }
                                    if (!targetGroupKey) return;
                                    const movingCard = cards.find(card => card.id === active.id);
                                    if (!movingCard) return;
                                    // Board view: update projectId or status only (no date recalculation)
                                    setCards(prev => {
                                        let updated = [...prev];
                                        if (viewSettings.groupBy === 'project') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, projectId: targetGroupKey } : card
                                            );
                                        } else if (viewSettings.groupBy === 'status') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, status: targetGroupKey } : card
                                            );
                                        }

                                        // Apply in-group ordering (no date recalculation)
                                        let newTargetCards = updated.filter(card =>
                                            viewSettings.groupBy === 'project' ? card.projectId === targetGroupKey :
                                            viewSettings.groupBy === 'status' ? card.status === targetGroupKey :
                                            false
                                        );
                                        const movingIdx = newTargetCards.findIndex(card => card.id === movingCard.id);
                                        if (movingIdx === -1) return updated;

                                        // If over is a card ID, use its index
                                        let targetOverIndex = 0;
                                        if (fallbackOver && !fallbackOver.id.toString().startsWith('empty-dropzone-') && !fallbackOver.id.toString().startsWith('column-dropzone-')) {
                                            targetOverIndex = newTargetCards.findIndex(card => card.id.toString() === fallbackOver.id.toString());
                                            if (targetOverIndex === -1) targetOverIndex = newTargetCards.length;
                                        }

                                        let reordered = arrayMove(newTargetCards, movingIdx, targetOverIndex);

                                        // For project group, recalc dates (same logic as list view)
                                        if (viewSettings.groupBy === 'project') {
                                            let baseDate = null;
                                            for (const card of newTargetCards) {
                                                if (card.startDate) {
                                                    const cardDate = new Date(card.startDate);
                                                    if (baseDate === null || cardDate < baseDate) {
                                                        baseDate = cardDate;
                                                    }
                                                }
                                            }
                                            if (baseDate === null) baseDate = new Date();

                                            for (let i = 0; i < reordered.length; i++) {
                                                let card = reordered[i];
                                                let duration = Number(card.duration) || 1;
                                                card = { ...card, startDate: baseDate.toISOString().split('T')[0] };
                                                baseDate.setDate(baseDate.getDate() + duration);
                                                reordered[i] = card;
                                            }
                                        }

                                        // Keep overall card order, replace only target group with reordered
                                        let result = [];
                                        let usedIds = new Set(reordered.map(c => c.id));
                                        for (let card of updated) {
                                            if (usedIds.has(card.id)) {
                                                if (reordered.length) {
                                                    result.push(reordered.shift());
                                                }
                                            } else {
                                                result.push(card);
                                            }
                                        }
                                        return result;
                                    });
                                }}
                            >
                                {/* DragOverlay: render dragging card at body root (board view) */}
                                <DragOverlay dropAnimation={null}>
                                    {activeCard && (
                                        <SortableCard card={activeCard} activeId={activeId} projects={projects} layout={viewSettings.layout} />
                                    )}
                                </DragOverlay>
                                <div id="board-area" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {Object.entries(groupedCards).map(([groupKey, groupCards]) => {
                                        // Use groupKey as-is
                                        // Column title and project attributes
                                        let groupTitle = groupKey;
                                        let subTitle = '';
                                        let budgetDisplay = '';
                                        let deadlineDisplay = '';
                                        let durationDisplay = '';
                                        if (viewSettings.groupBy === 'project') {
                                            const project = projects.find(p => String(p.id) === String(groupKey));
                                            groupTitle = project?.name || groupKey;
                                            subTitle = project?.client ? `（${project.client}）` : '';
                                            if (project) {
                                                if (project.totalBudget && Number(project.totalBudget) > 0) {
                                                    budgetDisplay = `予算: ¥${Number(project.totalBudget).toLocaleString()}`;
                                                } else {
                                                    budgetDisplay = '予算未設定';
                                                }
                                                if (project.deadline) {
                                                    deadlineDisplay = `期日: ${project.deadline}`;
                                                } else {
                                                    deadlineDisplay = '期日未設定';
                                                }
                                                if (project.duration && Number(project.duration) > 0) {
                                                    durationDisplay = `期間: ${project.duration}日`;
                                                } else {
                                                    durationDisplay = '期間未設定';
                                                }
                                            }
                                        } else if (viewSettings.groupBy === 'status') {
                                            const statusLabels = {
                                                unsent: '未編集',
                                                edited: '編集済',
                                                awaiting_approval: '承認待ち',
                                                revision_needed: '要修正',
                                                approved: '承認済',
                                            };
                                            groupTitle = statusLabels[groupKey] || groupKey;
                                        } else if (viewSettings.groupBy === 'dueDate') {
                                            const dueLabels = {
                                                '期限切れ': '期限切れ',
                                                '今日が期日': '今日が期日',
                                                '今後': '今後',
                                                '期日未設定': '期日未設定',
                                            };
                                            groupTitle = dueLabels[groupKey] || groupKey;
                                        }
                                        // Use original startDate when rendering (no recalc in board view)
                                        const displayCards = groupCards;
                                        const isEmpty = displayCards.length === 0;
                                        return (
                                            <div
                                                key={groupKey}
                                                className={`bg-slate-200 rounded-xl p-3 kanban-column flex flex-col min-h-[400px] ${dragOverInfo.groupKey === groupKey ? 'drag-over' : ''}`}
                                            >
                                                <div className="flex flex-col gap-1 mb-4 px-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-bold text-slate-700 text-base tracking-wide">{groupTitle} <span className="text-xs text-slate-400 font-normal">{subTitle}</span></h3>
                                                        <span className="text-sm font-semibold text-slate-500 bg-slate-300 px-2 py-1 rounded-md">{groupCards.length}</span>
                                                    </div>
                                                    {viewSettings.groupBy === 'project' && (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <span className="text-xs text-green-700 bg-green-100 rounded px-2 py-0.5">{budgetDisplay}</span>
                                                            <span className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-0.5">{deadlineDisplay}</span>
                                                            <span className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-0.5">{durationDisplay}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <SortableContext
                                                    items={isEmpty ? [`empty-dropzone-${groupKey}`] : displayCards.map(card => card.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="space-y-3 card-list-container flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-1">
                                                        {isEmpty
                                                            ? null
                                                            : displayCards.map((card) => (
                                                                <SortableCard
                                                                    key={card.id}
                                                                    card={card}
                                                                    activeId={activeId}
                                                                    onEdit={handleEditClick}
                                                                    projects={projects}
                                                                    layout="board"
                                                                    projectTab={projectTab}
                                                                    setNodeRef={el => { cardRefs.current[card.id] = el; }}
                                                                />
                                                            ))}
                                                    </div>
                                                </SortableContext>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DndContext>
                            </>
                        )}
                    </div>
                {/* Editing/Undo/Toasts temporarily disabled (for DnD stability) */}
            </main>
        </div>
    );
}


// --- Moved to end of file ---

function SortableCard({ card, onEdit, activeId, projects, layout, setNodeRef: externalSetNodeRef, projectTab }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
    // Allow external ref passthrough
    const combinedRef = node => {
        setNodeRef(node);
        if (externalSetNodeRef) externalSetNodeRef(node);
    };
    // Incorporate KanbanCard.js DnD stability logic, keep current appearance
    const style = {
        background: '#fff',
        borderRadius: '0.75rem',
        boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
        padding: layout === 'board' ? '1rem' : '0.75rem',
        margin: '2px 0',
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` + (isDragging ? ' scale(1.05)' : '') : undefined,
        transition,
        zIndex: isDragging ? 10 : 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        border: '1.5px solid #e5e7eb',
        minHeight: '48px',
        willChange: 'transform',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
    };

    // Get milestone progress status
    const { getMilestoneProgress } = require('../utils/initialData');
    const milestoneProgress = getMilestoneProgress(card.id);
    const progressStatusMap = {
        'notStarted': { label: '未開始', bg: 'bg-gray-100', text: 'text-gray-600' },
        'inProgress': { label: '進捗中', bg: 'bg-blue-100', text: 'text-blue-700' },
        'completed': { label: '完了', bg: 'bg-green-100', text: 'text-green-700' }
    };
    const progressStatusInfo = progressStatusMap[milestoneProgress?.status] || progressStatusMap['notStarted'];
    // --- Align status badge and action icons at top-right ---
    const { t } = require('react-i18next').useTranslation();
    const statusInfo = {
        unsent: { label: t('statusUnsent', '未編集'), bg: 'bg-slate-200', text: 'text-slate-600' },
        edited: { label: t('statusEdited', '編集済'), bg: 'bg-blue-100', text: 'text-blue-700' },
        awaiting_approval: { label: t('statusAwaitingApproval', '承認待ち'), bg: 'bg-yellow-100', text: 'text-yellow-700' },
        revision_needed: { label: t('statusRevisionNeeded', '要修正'), bg: 'bg-red-100', text: 'text-red-700' },
        approved: { label: t('statusApproved', '承認済'), bg: 'bg-green-100', text: 'text-green-700' },
        completed: { label: t('statusCompleted', '完了'), bg: 'bg-gray-200', text: 'text-gray-700' },
    }[card.status] || { label: card.status, bg: 'bg-slate-200', text: 'text-slate-600' };
    let actionIcon = null;
    if (card.status === 'unsent' || card.status === 'revision_needed') {
        actionIcon = (
            <button title="編集する" className="text-slate-400 hover:text-indigo-600 flex-shrink-0 pointer-events-auto" onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onEdit && onEdit(card); }}>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
            </button>
        );
    } else if (card.status === 'edited') {
        actionIcon = (
            <button title="送信する" className="text-blue-500 hover:text-blue-700 flex-shrink-0 pointer-events-auto" onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onEdit && onEdit(card); }}>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 8.25l-5.607-1.752a.75.75 0 00-.95-.826z" /><path d="M15 6.75a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h3.5a.75.75 0 00.75-.75zM15 9.75a.75.75 0 00-.75-.75h-6.5a.75.75 0 000 1.5h6.5a.75.75 0 00.75-.75zM15 12.75a.75.75 0 00-.75-.75h-6.5a.75.75 0 000 1.5h6.5a.75.75 0 00.75-.75zM4.832 15.312a.75.75 0 00.95-.826l-1.414-4.95a.75.75 0 00-.95-.826L.5 11.25l5.607 1.752a.75.75 0 00.95.826z" /></svg>
            </button>
        );
    }

    // Restore nextStepGuide definition
    let nextStepGuide = null;
    if (card._pendingStatus === 'pending') {
        nextStepGuide = <span className="block text-xs text-yellow-700 mt-1">{t('nextStepPending', 'クライアントの採用連絡をお待ちください。')}</span>;
    } else if (card._pendingStatus === 'accepted' && card.status !== '完了') {
        nextStepGuide = <span className="block text-xs text-blue-700 mt-1">{t('nextStepInProgress', '作業を進めてください。納品・連絡が可能です。')}</span>;
    } else if ((card.status === '完了') || (card._pendingStatus === 'accepted' && card.status === '完了')) {
        nextStepGuide = <span className="block text-xs text-gray-500 mt-1">{t('nextStepCompleted', 'この仕事は完了しました。')}</span>;
    }

    // --- JSX return for SortableCard ---
    // Accept button (only for pending tab and pending status)
    const showAcceptButton = card._pendingStatus === 'pending' && projectTab !== 'completed';
    // handleAcceptJob cannot be passed from parent, call via window
    const handleAccept = () => {
        if (typeof window !== 'undefined' && typeof window.handleAcceptJob === 'function') {
            window.handleAcceptJob(card.id);
        }
    };
    return (
        <div
            ref={combinedRef}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-lg shadow kanban-card flex flex-col gap-2 border border-slate-200 min-h-[48px] transition-all p-3 sm:p-4 cursor-pointer hover:shadow-md touch-none select-none ${isDragging ? 'dragging' : ''}`}
            style={style}
            onClick={() => onEdit && onEdit(card)}
        >
            <div className="flex justify-between items-start">
                <span className="font-semibold text-slate-800 flex-1 min-w-0 w-0 pr-2 text-base truncate">{card.title}</span>
                <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${progressStatusInfo.bg} ${progressStatusInfo.text} whitespace-nowrap`}>{progressStatusInfo.label}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                    {/* Message button */}
                    <button
                        title="メッセージ"
                        className="text-slate-400 hover:text-indigo-600 flex-shrink-0 pointer-events-auto"
                        onMouseDown={e => e.stopPropagation()}
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            const navigate = window.__workManagementNavigate;
                            if (navigate) {
                                navigate(`/messages?project=${card.projectId}`);
                            }
                        }}
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                            <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                        </svg>
                    </button>
                    {actionIcon}
                </div>
            </div>
            <div className="text-xs text-slate-600 truncate mb-1">{card.description}</div>
            {/* Dates, duration, reward */}
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-1">
                {card.startDate && <span>開始日: {card.startDate}</span>}
                {card.duration && <span>期間: {card.duration}日</span>}
            </div>
            {/* Payment badge */}
            {card.reward && (
                <div className="inline-flex items-center bg-slate-100 border border-slate-300 rounded-full px-3 py-1 text-sm font-bold text-slate-600 shadow-sm">
                    <Coins size={16} className="mr-1 text-slate-400" />
                    <span>{Number(card.reward).toLocaleString('ja-JP')} pt</span>
                </div>
            )}
            {nextStepGuide}
            {/* Show "Accept" button only in pending tab */}
            {showAcceptButton && (
                <button
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                    onClick={e => { e.stopPropagation(); handleAccept(); }}
                >
                    採用する
                </button>
            )}
            {/* Show "Complete" button only for cards that are ready for completion */}
            {card._pendingStatus === 'accepted' && !card._completedStatus && projectTab !== 'completed' && (
                <>
                    {(card.status === 'approved' || card.status === 'awaiting_approval' || card.status === 'edited') ? (
                        <button
                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                            onClick={e => {
                                e.stopPropagation();
                                if (typeof window !== 'undefined' && typeof window.handleCompleteMilestone === 'function') {
                                    window.handleCompleteMilestone(card.id, card.projectId);
                                }
                            }}
                        >
                            完了
                        </button>
                    ) : (
                        <div className="mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-300">
                            {card.status === 'unsent' && <><Pencil size={14} className="inline text-slate-400 mr-1" />編集・提出後に完了可能</>}
                            {card.status === 'revision_needed' && '🔄 修正対応後に完了可能'}
                            {!card.status && <><Pencil size={14} className="inline text-slate-400 mr-1" />作業完了後に完了ボタンが表示されます</>}
                        </div>
                    )}
                </>
            )}
        </div>
    );
    // ...existing code...
}
