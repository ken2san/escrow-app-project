import React, { useState, useRef, useEffect, useMemo } from "react";
import './workmanagement.css';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Menu, X } from 'lucide-react';
import NewProjectModal from '../components/modals/NewProjectModal';
import { workManagementProjects as initialProjectsData, loggedInUserDataGlobal } from '../utils/initialData';

import EmptyDropzone from '../components/common/EmptyDropzone';

// Initial data loader (can be replaced with API/Firebase fetch later)
function getInitialProjects() {
        // Only show jobs that have been accepted by the client (application status 'accepted')
        const { getPendingApplicationJobsForUser } = require('../utils/initialData');
        const acceptedJobs = getPendingApplicationJobsForUser(loggedInUserDataGlobal.id)
            .filter(j => j.status === 'accepted')
            .map(j => j.jobId);
        const base = initialProjectsData
            .filter(project => acceptedJobs.includes(project.id))
            .map(project => {
                if (project.cards && Array.isArray(project.cards)) return project;
                if (project.milestones && Array.isArray(project.milestones)) {
                    return {
                        ...project,
                        cards: project.milestones.map((m, idx) => ({
                            id: m.id || `${project.id}-m${idx+1}`,
                            projectId: project.id,
                            title: m.name || m.title,
                            status: m.status || 'unsent',
                            reward: m.amount || 0,
                            startDate: m.dueDate || '',
                            duration: '',
                            order: idx+1,
                        })),
                    };
                }
                return { ...project, cards: [] };
            });
        // Merge proposed projects for current user (if needed)
        // const proposed = getProposedProjectsForUser(loggedInUserDataGlobal.id);
        // const drafts = getDraftProjectsForUser(loggedInUserDataGlobal.id);
        return base;
}

// styles moved to src/pages/workmanagement.css

export default function WorkManagementPage() {

    // Ref for each card
    // State for showing the new project modal
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    // Single event listener for Header->openNewProjectModal
    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;
        const handler = () => setShowNewProjectModal(true);
        main.addEventListener('openNewProjectModal', handler);
        return () => main.removeEventListener('openNewProjectModal', handler);
    }, []);
    // Project/card id counters for unique ids
    const [nextProjectId, setNextProjectId] = useState(4);
    const [nextCardId, setNextCardId] = useState(7);
    // Compute initial projects once to avoid duplicate work
    const initialProjects = useMemo(() => getInitialProjects(), []);
    // State for projects (array, to match ProjectFlowDemoPage)
    const [projects, setProjects] = useState(initialProjects);
    const handleCloseNewProject = () => setShowNewProjectModal(false);
    // Handler to confirm new project from modal
    const handleConfirmNewProject = (newProject) => {
        setProjects(prev => [...prev, newProject]);
        // Add new project cards into cards state
        if (newProject.cards && newProject.cards.length > 0) {
            setCards(prev => [...prev, ...newProject.cards]);
        }
        setNextProjectId(prev => prev + 1);
        setNextCardId(prev => prev + (newProject.cards?.length || 0));
        setShowNewProjectModal(false);
    };
    // ...existing code...
    const cardRefs = useRef({});
    // DnD: Manage drag/over state
    const [dragOverInfo, setDragOverInfo] = useState({ groupKey: null, overIndex: null });
    // --- For DnD stability, Undo/Toast/Save Toast temporarily disabled ---
    // const [undoStack, setUndoStack] = useState([]); // {prevCards, message, id}
    // const [undoToastList, setUndoToastList] = useState([]); // [{id, message, visible}]
    // const [successToastOpen, setSuccessToastOpen] = useState(false);
    // cards state is initialized from all cards in initialProjects
    const [cards, setCards] = useState(initialProjects.flatMap(p => p.cards || []));
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
        // Do not force groupBy in board view (respect user choice)
    };

    // Use shared util for grouping/sorting for testability and reuse
    const groupedCards = useMemo(() => {
        const { default: groupUtil } = require('../utils/groupCards');
        return groupUtil(cards, viewSettings, projects);
    }, [cards, viewSettings, projects]);

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
        setCards(prev => prev.map(card => card.id === editingCard.id ? { ...editingCard, status: 'edited' } : card));
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


    // (listener consolidated earlier) — no-op here

    return (
        <div className="flex h-screen overflow-hidden">
            {/* New Project Modal (ProjectFlowDemo style) */}
            <NewProjectModal
                open={showNewProjectModal}
                onClose={handleCloseNewProject}
                onConfirm={handleConfirmNewProject}
                nextProjectId={nextProjectId}
                nextCardId={nextCardId}
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
                                        const isEmpty = groupCards.length === 0;
                                        return (
                                            <div key={groupKey} className={`mb-8 ${dragOverInfo.groupKey === groupKey ? 'drag-over' : ''}`}>
                                                <div className="p-4 pb-2">
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
                                                </div>
                                                    <SortableContext
                                                        items={isEmpty ? [`empty-dropzone-${groupKey}`] : groupCards.map(card => card.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                    <div className="space-y-0">
                                                        {isEmpty
                                                            ? <EmptyDropzone id={`empty-dropzone-${groupKey}`} />
                                                            : groupCards.map((card, idx) => (
                                                                <SortableCard key={card.id} card={card} onEdit={handleEditClick} activeId={activeId} projects={projects} layout={viewSettings.layout} />
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
                                                            ? <EmptyDropzone id={`empty-dropzone-${groupKey}`} />
                                                            : displayCards.map((card) => (
                                                                <SortableCard
                                                                    key={card.id}
                                                                    card={card}
                                                                    activeId={activeId}
                                                                    onEdit={handleEditClick}
                                                                    projects={projects}
                                                                    layout="board"
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

function SortableCard({ card, onEdit, activeId, projects, layout, setNodeRef: externalSetNodeRef }) {
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
    // Status badge
    const statusInfo = {
        unsent: { label: '未編集', bg: 'bg-slate-200', text: 'text-slate-600' },
        edited: { label: '編集済', bg: 'bg-blue-100', text: 'text-blue-700' },
        awaiting_approval: { label: '承認待ち', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        revision_needed: { label: '要修正', bg: 'bg-red-100', text: 'text-red-700' },
        approved: { label: '承認済', bg: 'bg-green-100', text: 'text-green-700' },
    }[card.status] || { label: card.status, bg: 'bg-slate-200', text: 'text-slate-600' };
    // Action icon
    const actionIcon = (card.status === 'unsent' || card.status === 'revision_needed') ? (
        <button title="編集する" className="text-slate-400 hover:text-indigo-600 flex-shrink-0 pointer-events-auto" onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onEdit && onEdit(card); }}>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
        </button>
    ) : card.status === 'edited' ? (
        <button title="送信する" className="text-blue-500 hover:text-blue-700 flex-shrink-0 pointer-events-auto" onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onEdit && onEdit(card); }}>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 8.25l-5.607-1.752a.75.75 0 00-.95-.826z" /><path d="M15 6.75a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h3.5a.75.75 0 00.75-.75zM15 9.75a.75.75 0 00-.75-.75h-6.5a.75.75 0 000 1.5h6.5a.75.75 0 00.75-.75zM15 12.75a.75.75 0 00-.75-.75h-6.5a.75.75 0 000 1.5h6.5a.75.75 0 00.75-.75zM4.832 15.312a.75.75 0 00.95-.826l-1.414-4.95a.75.75 0 00-.95-.826L.5 11.25l5.607 1.752a.75.75 0 00.95.826z" /></svg>
        </button>
    ) : null;
    // Project name
    const projectName = projects && projects[card.projectId]?.name;
    // Due date
    const dueDate = (() => {
        if (!card.startDate || !card.duration) return '';
        const date = new Date(card.startDate);
        if (isNaN(date.getTime())) return '';
        date.setDate(date.getDate() + Number(card.duration));
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    })();
    return (
        <div
            ref={combinedRef}
            style={style}
            {...attributes}
            {...listeners}
            className={
                'bg-white rounded-lg shadow kanban-card flex flex-col gap-2 border border-slate-200 min-h-[48px] transition-all p-3 sm:p-4 cursor-pointer hover:shadow-md touch-none select-none ' +
                (isDragging ? 'dragging' : '')
            }
            onClick={() => onEdit && onEdit(card)}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-800 flex-1 pr-2 text-base truncate">{card.title}</h4>
                <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                    {actionIcon}
                </div>
            </div>
            {layout === 'board' && (
                <p className="text-sm text-slate-500 mt-1">{projectName}</p>
            )}
            <div className="flex justify-between items-end mt-2">
                <div className="text-sm text-slate-600">
                    <p>¥{card.reward.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">期日: {dueDate || '未設定'} ({card.duration}日間)</p>
                </div>
                <img src="https://placehold.co/24x24/E0E7FF/4F46E5?text=A" alt="Assignee" className="w-6 h-6 rounded-full" />
            </div>
        </div>
    );
}

    // Component to match drop target height to card
