import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import './workmanagement.css';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Menu, X } from 'lucide-react';
import NewProjectModal from '../components/modals/NewProjectModal';
import { workManagementProjects as initialProjectsData, loggedInUserDataGlobal } from '../utils/initialData';
import EmptyDropzone from '../components/common/EmptyDropzone';
import CardHistoryTimeline from '../components/common/CardHistoryTimeline';

// --- カードごとの履歴管理 ---
// メモリ上でカードIDごとに履歴を保持（本来はDB/API管理）
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
        // 初期履歴（作成時）
        cardHistoryMapRef[card.id] = [{
            type: 'created',
            text: 'カード作成',
            date: card.startDate || new Date().toISOString(),
            userName: loggedInUserDataGlobal.name,
            userIcon: '📝',
        }];
    }
}

// --- 2つ前のバージョンのロジック/UIをベースに ---
function getInitialProjects() {
    const { getPendingApplicationJobsForUser, dashboardAllProjects } = require('../utils/initialData');
    const pendingApplications = getPendingApplicationJobsForUser(loggedInUserDataGlobal.id);
    const pendingJobs = pendingApplications.filter(j => j.status === 'pending').map(j => j.jobId);
    const acceptedJobs = pendingApplications.filter(j => j.status === 'accepted').map(j => j.jobId);

    // 既存プロジェクト（初期データ）
    let base = initialProjectsData
        .filter(project => pendingJobs.includes(project.id) || acceptedJobs.includes(project.id))
        .map(project => {
            let _pendingStatus = '';
            if (pendingJobs.includes(project.id)) _pendingStatus = 'pending';
            if (acceptedJobs.includes(project.id)) _pendingStatus = 'accepted';
            let proj = { ...project, _pendingStatus };
            if (project.cards && Array.isArray(project.cards)) return proj;
            if (project.milestones && Array.isArray(project.milestones)) {
                return {
                    ...proj,
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
            return { ...proj, cards: [] };
        });

    // 応募中で初期データに存在しないjobIdはdashboardAllProjectsから生成
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
                }))
                : [{ id: `${job.id}-m1`, projectId: job.id, title: job.name || job.title || '作業', status: 'unsent', reward: job.totalAmount || 0, startDate: job.dueDate || '', duration: '', order: 1 }];
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
        }
    }
    // acceptedも同様に（ただしpending→acceptedに昇格した場合のみ）
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
                }))
                : [{ id: `${job.id}-m1`, projectId: job.id, title: job.name || job.title || '作業', status: 'unsent', reward: job.totalAmount || 0, startDate: job.dueDate || '', duration: '', order: 1 }];
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
        }
    }
    return base;
}

export default function WorkManagementPage() {
            // 応募状態がグローバルで変わったら反映
            useEffect(() => {
                const handler = () => setProjects(getInitialProjects());
                window.addEventListener('updatePendingApplications', handler);
                return () => window.removeEventListener('updatePendingApplications', handler);
            }, []);
        // Demo: Accept job (move from pending to inprogress)
        const handleAcceptJob = React.useCallback((jobId) => {
            // グローバル応募状態も更新
            const { updateApplicationJobStatus } = require('../utils/initialData');
            updateApplicationJobStatus(jobId, 'accepted', loggedInUserDataGlobal.id);
            setProjects(getInitialProjects());
            // Dispatch event to trigger UI sync across all listeners
            window.dispatchEvent(new CustomEvent('updatePendingApplications'));
        }, []);

        // window経由でSortableCardからhandleAcceptJobを呼べるようにする（デモ用）
        React.useEffect(() => {
            window.handleAcceptJob = handleAcceptJob;
            return () => { delete window.handleAcceptJob; };
        }, [handleAcceptJob]);
    const { t } = useTranslation();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;
        const handler = () => setShowNewProjectModal(true);
        main.addEventListener('openNewProjectModal', handler);
        return () => main.removeEventListener('openNewProjectModal', handler);
    }, []);
    // const initialProjects = useMemo(() => getInitialProjects(), []);
    // 上記は不要。下でuseState(getInitialProjects())を使う。
    const handleCloseNewProject = () => setShowNewProjectModal(false);
    const handleConfirmNewProject = (newProject) => {
        setProjects(prev => [...prev, newProject]);
        if (newProject.cards && newProject.cards.length > 0) {
            setCards(prev => [...prev, ...newProject.cards]);
        }
        setShowNewProjectModal(false);
    };
    // --- 2つ前のバージョンのロジック/UIをベースに ---
    // --- Hybrid logic/UI, all inside WorkManagementPage function ---
    // --- State for tab switching ---
    const [projectTab, setProjectTab] = useState('inprogress');
    // --- ダミー案件を必ず初期表示 ---
    // getInitialProjects()の返り値をそのまま使う
    // localStorageキー
    const PROJECTS_STORAGE_KEY = 'workManagementProjects_v2';
    // 初期化: localStorage→なければgetInitialProjects()
    const [projects, setProjects] = useState(getInitialProjects());

    // projectsが変化するたびにlocalStorageへ保存
    useEffect(() => {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }, [projects]);
    // タブごとに案件を正しく分類するフィルタロジックを復活
    const filteredProjects = useMemo(() => {
        // "pending"タブ: _pendingStatusが"pending"かつstatusが"完了"以外
        if (projectTab === 'pending') return projects.filter(p => p._pendingStatus === 'pending' && p.status !== '完了');
        // "completed"タブ: _pendingStatusが"accepted"かつstatusが"完了"
        if (projectTab === 'completed') return projects.filter(p => p._pendingStatus === 'accepted' && p.status === '完了');
        // "inprogress"タブ: _pendingStatusが"accepted"かつstatusが"完了"以外
        return projects.filter(p => p._pendingStatus === 'accepted' && p.status !== '完了');
    }, [projects, projectTab]);

    // --- 応募中タブで何も表示されない場合の案内 ---
    const showNoPendingMessage = projectTab === 'pending' && filteredProjects.length === 0;

    // Cards are derived from filteredProjects
    const [cards, setCards] = useState(filteredProjects.flatMap(p => p.cards || []));
    useEffect(() => {
        setCards(filteredProjects.flatMap(p => p.cards || []));
    }, [filteredProjects]);
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
        setCards(prev => prev.map(card => card.id === editingCard.id ? { ...editingCard, status: 'edited' } : card));
        // 履歴追加
        addCardHistory(editingCard.id, {
          type: 'edited',
          text: 'カード内容を編集',
          date: new Date().toISOString(),
          userName: loggedInUserDataGlobal.name,
          userIcon: '📝',
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
    // --- タブ切り替えUI ---
    const tabDefs = [
        { key: 'inprogress', label: '進行中' },
        { key: 'pending', label: '応募中' },
        { key: 'completed', label: '完了' },
    ];
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
            {/* 応募中タブの手動登録ボタンは不要のため削除 */}
            {/* New Project Modal (ProjectFlowDemo style) */}
            <NewProjectModal
                open={showNewProjectModal}
                onClose={handleCloseNewProject}
                onConfirm={handleConfirmNewProject}
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
                                {/* --- 履歴タイムライン --- */}
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
                            tabCount = projects.filter(p => p._pendingStatus === 'pending' && p.status !== '完了').length;
                        } else if (tab.key === 'inprogress') {
                            tabCount = projects.filter(p => p._pendingStatus === 'accepted' && p.status !== '完了').length;
                        } else if (tab.key === 'completed') {
                            tabCount = projects.filter(p => p._pendingStatus === 'accepted' && p.status === '完了').length;
                        }
                        return (
                            <button
                                key={tab.key}
                                className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all ${projectTab === tab.key ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
                                onClick={() => setProjectTab(tab.key)}
                            >
                                {tab.label} <span className="text-xs text-slate-500 ml-1">({tabCount})</span>
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
                        {/* View Area: レイアウト切り替え */}
                        {viewSettings.layout === 'list' ? (
                            <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={e => setActiveId(e.active.id)}
                                onDragOver={e => {
                                    // ドラッグオーバー時のカラム/リスト・インデックスを記録
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
                                    // 空リストDnD対応
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
                                    // グループがdueDateの場合はグループ間移動禁止
                                    if (viewSettings.groupBy === 'dueDate') {
                                        // 移動前後のグループが異なる場合は何もしない
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
                                    // overIndex: 空リストDnD時は0、通常DnD時は既存カードのindex
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
                                            // グループ間移動は既に禁止済みなので、ここは同一グループ内DnDのみ
                                            // 期日未設定グループはstartDate空欄維持、他はstartDateを新しい順序で再計算
                                            if (targetGroupKey === '期日未設定') {
                                                // 何もしない（updated = prev;）
                                                return updated;
                                            } else {
                                                // 新しい順序でstartDateを再計算
                                                // targetGroupKeyは日付文字列
                                                // 並び順の先頭がtargetGroupKeyの日付、以降はdurationで順次加算
                                                // グループ内カード配列を直接使う
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
                                                // cards全体の順序を維持しつつ、該当グループだけreorderedで置き換え
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
                                        // グループ内の新しい順序をcards全体に反映
                                        let newTargetCards = updated.filter(card =>
                                            viewSettings.groupBy === 'project' ? card.projectId === targetGroupKey :
                                            viewSettings.groupBy === 'status' ? card.status === targetGroupKey :
                                            viewSettings.groupBy === 'dueDate' ? card.startDate === targetGroupKey :
                                            false
                                        );
                                        const movingIdx = newTargetCards.findIndex(card => card.id === movingCard.id);
                                        let reordered = arrayMove(newTargetCards, movingIdx, overIndex);
                                        if (viewSettings.groupBy === 'project') {
                                            // プロジェクトグループの場合、元のグループ内で一番古い開始日を基準にして計算
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
                                {/* DragOverlay: ドラッグ中のカードをbody直下に描画し、枠外でも消えないようにする */}
                                <DragOverlay dropAnimation={null}>
                                    {activeCard && (
                                        <SortableCard card={activeCard} activeId={activeId} projects={projects} layout={viewSettings.layout} />
                                    )}
                                </DragOverlay>
                                <div id="view-area" className="flex flex-col gap-8">
                                    {Object.entries(groupedCards).map(([groupKey, groupCards]) => {
                                        // groupKeyはそのまま使う
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
                                                <div className="p-4 pb-2">
                                                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                                        {groupTitle}
                                                        {subTitle && <span className="text-xs text-slate-400 ml-2">{subTitle}</span>}
                                                    </h3>
                                                    {/* プロジェクト属性表示 */}
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
                                                            : projectTab === 'pending'
                                                                ? groupCards.map((card, idx) => {
                                                                    const project = projects.find(p => String(p.id) === String(card.projectId));
                                                                    const appliedDate = card.appliedDate || card.startDate || project?.appliedDate || '未設定';
                                                                    const clientName = project?.client || project?.clientName || 'クライアント';
                                                                    return (
                                                                        <div key={card.id} className="bg-white border border-slate-200 rounded-lg p-4 mb-2 flex flex-col">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-semibold text-slate-800">{card.title}</span>
                                                                                <span className="ml-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded px-2 py-0.5">確認中</span>
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 mt-1">クライアントが確認中です。次の操作は不要です。</div>
                                                                            <div className="text-xs text-slate-500 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                                                                                <span>応募先: {clientName}</span>
                                                                                <span>応募日: {appliedDate}</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
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
                                    // overがnullになるケースに備え、最後にホバーしていたgroupをフォールバックに使う
                                    let fallbackOver = over;
                                    if (!fallbackOver && dragOverInfo.groupKey) {
                                        fallbackOver = { id: `column-dropzone-${dragOverInfo.groupKey}` };
                                    }
                                    setActiveId(null);
                                    setDragOverInfo({ groupKey: null, overIndex: null });
                                    if (!fallbackOver || active.id === fallbackOver.id) return;

                                    // ドロップ先のカラムを特定
                                    let targetGroupKey = null;
                                    // 空カラム/カラム末尾DnD対応
                                    if (typeof fallbackOver.id === 'string' && fallbackOver.id.startsWith('empty-dropzone-')) {
                                        targetGroupKey = fallbackOver.id.replace('empty-dropzone-', '');
                                    } else if (typeof fallbackOver.id === 'string' && fallbackOver.id.startsWith('column-dropzone-')) {
                                        targetGroupKey = fallbackOver.id.replace('column-dropzone-', '');
                                    } else {
                                        // カード上にドロップした場合、そのカードが所属するカラムを特定
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
                                    // ボードビューではprojectIdまたはstatusのみ変更（日付計算なし）
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

                                        // グループ内での並び順を反映（日付再計算なし）
                                        let newTargetCards = updated.filter(card =>
                                            viewSettings.groupBy === 'project' ? card.projectId === targetGroupKey :
                                            viewSettings.groupBy === 'status' ? card.status === targetGroupKey :
                                            false
                                        );
                                        const movingIdx = newTargetCards.findIndex(card => card.id === movingCard.id);
                                        if (movingIdx === -1) return updated;

                                        // overがカードIDの場合はそのインデックスを取得
                                        let targetOverIndex = 0;
                                        if (fallbackOver && !fallbackOver.id.toString().startsWith('empty-dropzone-') && !fallbackOver.id.toString().startsWith('column-dropzone-')) {
                                            targetOverIndex = newTargetCards.findIndex(card => card.id.toString() === fallbackOver.id.toString());
                                            if (targetOverIndex === -1) targetOverIndex = newTargetCards.length;
                                        }

                                        let reordered = arrayMove(newTargetCards, movingIdx, targetOverIndex);

                                        // プロジェクトグループの場合、日付を再計算（リストビューと同じロジック）
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

                                        // cards全体の順序を維持しつつ、該当グループだけreorderedで置き換え
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
                                {/* DragOverlay: ドラッグ中のカードをbody直下に描画し、枠外でも消えないようにする（ボードビュー） */}
                                <DragOverlay dropAnimation={null}>
                                    {activeCard && (
                                        <SortableCard card={activeCard} activeId={activeId} projects={projects} layout={viewSettings.layout} />
                                    )}
                                </DragOverlay>
                                <div id="board-area" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {Object.entries(groupedCards).map(([groupKey, groupCards]) => {
                                        // groupKeyはそのまま使う
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
                                        // 表示時は元データのstartDateをそのまま使う（ボードビューで日付を再計算しない）
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
                {/* 編集・Undo・トースト等は一時的に無効化（DnD安定化のため） */}
            </main>
        </div>
    );
}


// --- ファイル末尾に移動 ---

function SortableCard({ card, onEdit, activeId, projects, layout, setNodeRef: externalSetNodeRef }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
    // refを外部からも渡せるように
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
    // --- ステータスバッジ＋アクションアイコンを右上で横並びに ---
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

    // nextStepGuideの定義を復元
    let nextStepGuide = null;
    if (card._pendingStatus === 'pending') {
        nextStepGuide = <span className="block text-xs text-yellow-700 mt-1">{t('nextStepPending', 'クライアントの採用連絡をお待ちください。')}</span>;
    } else if (card._pendingStatus === 'accepted' && card.status !== '完了') {
        nextStepGuide = <span className="block text-xs text-blue-700 mt-1">{t('nextStepInProgress', '作業を進めてください。納品・連絡が可能です。')}</span>;
    } else if ((card.status === '完了') || (card._pendingStatus === 'accepted' && card.status === '完了')) {
        nextStepGuide = <span className="block text-xs text-gray-500 mt-1">{t('nextStepCompleted', 'この仕事は完了しました。')}</span>;
    }

    // --- JSX return for SortableCard ---
    // Acceptボタン（pending状態の案件のみ）
    const showAcceptButton = card._pendingStatus === 'pending';
    // handleAcceptJobは親から渡せないのでwindow経由で呼び出し
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
                <span className="font-semibold text-slate-800 flex-1 pr-2 text-base truncate">{card.title}</span>
                <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                    {actionIcon}
                </div>
            </div>
            <div className="text-xs text-slate-600 truncate mb-1">{card.description}</div>
            {/* 日付・期間・報酬など */}
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-1">
                {card.startDate && <span>開始日: {card.startDate}</span>}
                {card.duration && <span>期間: {card.duration}日</span>}
                {card.reward && <span>報酬: ¥{Number(card.reward).toLocaleString()}</span>}
            </div>
            {nextStepGuide}
            {/* 応募中タブのみ「採用」ボタンを表示 */}
            {showAcceptButton && (
                <button
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                    onClick={e => { e.stopPropagation(); handleAccept(); }}
                >
                    採用する
                </button>
            )}
        </div>
    );
    // ...existing code...
}
