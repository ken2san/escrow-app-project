import EmptyDropzone from '../components/common/EmptyDropzone';

import React, { useState, useRef } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const kanbanDnDStyles = `
/* カード装飾 */
.kanban-card {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border: 1.5px solid #e5e7eb;
    transition: box-shadow 0.2s, border 0.2s;
    margin-bottom: 0;
}
.kanban-card:hover {
    box-shadow: 0 4px 16px rgba(99,102,241,0.10);
    border-color: #6366f1;
}
.kanban-card.dragging {
    opacity: 0.5;
    cursor: grabbing;
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(99,102,241,0.18);
    border-color: #6366f1;
    background: #f1f5f9;
}
.drag-over {
    background-color: #e0e7ff !important;
    border-radius: 0.75rem;
    box-shadow: 0 0 0 2px #6366f1;
}
.drop-placeholder {
    background-color: #c7d2fe;
    border-radius: 0.75rem;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    border: 2px dashed #6366f1;
    margin: 2px 0;
    min-height: 48px;
    height: auto;
    padding: 1rem;
    width: auto;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    flex: none;
    align-self: stretch;
    box-sizing: border-box;
    opacity: 0.5;
    transition: all 0.15s cubic-bezier(0.4,0,0.2,1);
    pointer-events: none;
}
/* カラム装飾 */
.kanban-column {
    background: #f8fafc;
    border-radius: 1rem;
    border: 1.5px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 1.2rem 1rem 1rem 1rem;
    margin-bottom: 1.5rem;
    transition: box-shadow 0.2s, border 0.2s;
}
.kanban-column:hover {
    box-shadow: 0 4px 16px rgba(99,102,241,0.08);
    border-color: #6366f1;
}
/* スクロールバー装飾 */
.card-list-container::-webkit-scrollbar {
    width: 8px;
}
.card-list-container::-webkit-scrollbar-thumb {
    background: #e0e7ff;
    border-radius: 4px;
}
.card-list-container::-webkit-scrollbar-track {
    background: #f1f5f9;
}
`;

export default function DashboardSample2Page() {
    // カードごとのrefを保持
    const cardRefs = useRef({});
    // DnD用: ドラッグ中/オーバー状態管理
    const [dragOverInfo, setDragOverInfo] = useState({ groupKey: null, overIndex: null });
    // --- DnD安定化のため、Undo・トースト・保存トーストは一時的に無効化 ---
    // const [undoStack, setUndoStack] = useState([]); // {prevCards, message, id}
    // const [undoToastList, setUndoToastList] = useState([]); // [{id, message, visible}]
    // const [successToastOpen, setSuccessToastOpen] = useState(false);
    // 初期データ
    const [projects] = useState({
        'P-1': { name: 'Eコマースサイト構築', client: 'NextGen Mart', deadline: '2025-09-30' },
        'P-2': { name: '新規ブランド立ち上げ', client: 'Creative Studio', deadline: '2025-08-31' },
        'P-3': { name: '秋のセールスプロモーション', client: 'Growth Hackers', deadline: '2025-10-15' },
    });
    const [cards, setCards] = useState([
        { id: 1, projectId: 'P-1', title: 'UI/UXデザイン設計', status: 'approved', reward: 150000, startDate: '2025-08-11', duration: 10, order: 1 },
        { id: 2, projectId: 'P-1', title: 'フロントエンド開発', status: 'awaiting_approval', reward: 300000, startDate: '2025-08-25', duration: 15, order: 2 },
        { id: 3, projectId: 'P-1', title: 'バックエンド開発', status: 'edited', reward: 400000, startDate: '2025-09-15', duration: 15, order: 3 },
        { id: 4, projectId: 'P-2', title: 'ロゴデザイン', status: 'approved', reward: 80000, startDate: '2025-08-12', duration: 8, order: 1 },
        { id: 5, projectId: 'P-2', title: 'LP制作', status: 'revision_needed', reward: 120000, startDate: '2025-08-22', duration: 5, order: 2 },
    { id: 6, projectId: 'P-3', title: 'SNSキャンペーン企画', status: 'unsent', reward: 100000, startDate: '', duration: '', order: 1 },
    ]);
    const [viewSettings, setViewSettings] = useState({ layout: 'list', groupBy: 'project', sortBy: 'startDate' });

    // グループ化・並べ替え・レイアウト切り替えハンドラ
    const handleGroupByChange = (e) => {
        setViewSettings(v => ({ ...v, groupBy: e.target.value }));
    };
    const handleSortByChange = (e) => {
        setViewSettings(v => ({ ...v, sortBy: e.target.value }));
    };
    const handleLayoutChange = (layout) => {
        setViewSettings(v => ({ ...v, layout }));
        // ボードビュー時のgroupBy強制は廃止（ユーザー選択を尊重）
    };

    // --- HTML版に厳密に合わせたグループ化・並べ替え ---
    let groupedCards = {};
    const filteredCards = cards;
    // 日付カテゴリ分け関数
    function getDueDateCategory(dueDateStr) {
        if (!dueDateStr) return '期日未設定';
        const today = new Date(); today.setHours(0,0,0,0);
        const dueDate = new Date(dueDateStr);
        if (dueDate < today) return '期限切れ';
        if (dueDate.getTime() === today.getTime()) return '今日が期日';
        return '今後';
    }
    // カードにdueDateを付与
    function getCardWithDueDate(card) {
    if (!card.startDate || !card.duration) return { ...card, dueDate: null };
    const date = new Date(card.startDate);
    if (isNaN(date.getTime())) return { ...card, dueDate: null };
    date.setDate(date.getDate() + Number(card.duration));
    if (isNaN(date.getTime())) return { ...card, dueDate: null };
    return { ...card, dueDate: date.toISOString().split('T')[0] };
    }
    if (viewSettings.groupBy === 'project') {
        Object.entries(projects).forEach(([projectId, project]) => {
            groupedCards[projectId] = filteredCards.filter(card => card.projectId === projectId);
        });
    } else if (viewSettings.groupBy === 'status') {
        // ステータスは日本語ラベル順でグループ化
        const statusOrder = [
            { key: 'unsent', label: '未編集' },
            { key: 'edited', label: '編集済' },
            { key: 'awaiting_approval', label: '承認待ち' },
            { key: 'revision_needed', label: '要修正' },
            { key: 'approved', label: '承認済' },
        ];
        statusOrder.forEach(({ key }) => {
            groupedCards[key] = filteredCards.filter(card => card.status === key);
        });
    } else if (viewSettings.groupBy === 'dueDate') {
        // 期日は「期限切れ」「今日が期日」「今後」「期日未設定」の順でグループ化
        const dueDateCategories = ['期限切れ', '今日が期日', '今後', '期日未設定'];
        const tempGroups = { '期限切れ': [], '今日が期日': [], '今後': [], '期日未設定': [] };
        filteredCards.forEach(card => {
            const cardWithDue = getCardWithDueDate(card);
            const key = getDueDateCategory(cardWithDue.dueDate);
            tempGroups[key].push(cardWithDue);
        });
        dueDateCategories.forEach(cat => {
            groupedCards[cat] = tempGroups[cat];
        });
    }
    // 並べ替え（未設定値の扱い・日付比較も厳密化）
    Object.keys(groupedCards).forEach(key => {
        if (viewSettings.sortBy === 'startDate') {
            groupedCards[key].sort((a, b) => {
                if (!a.startDate) return 1;
                if (!b.startDate) return -1;
                return new Date(a.startDate) - new Date(b.startDate);
            });
        } else if (viewSettings.sortBy === 'reward') {
            groupedCards[key].sort((a, b) => b.reward - a.reward);
        }
    });

    // --- 編集・Undo・トースト等を復元 ---
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [editErrors, setEditErrors] = useState({});
    const [undoStack, setUndoStack] = useState([]); // {prevCards, message, id}
    const [undoToast, setUndoToast] = useState({ open: false, message: '', id: null });

    // ドラッグ中のカードID
    const [activeId, setActiveId] = useState(null);
    // ドラッグ中のカード情報を取得
    const activeCard = activeId != null ? cards.find(card => card.id === activeId) : null;

    const handleEditClick = (card) => {
        setEditingCard({ ...card }); // 編集用にコピー
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
        setUndoStack(prev => [...prev, { prevCards: cards, message: 'カードを編集しました', id: Date.now() }]);
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
            setCards(undoItem.prevCards);
            setUndoStack(stack => stack.filter(u => u.id !== undoId));
            setUndoToast({ open: false, message: '', id: null });
        }
    };


    return (
        <div className="flex h-screen overflow-hidden">
            {/* Undo Toast Notification */}
            {undoToast.open && (
                <div className="fixed bottom-8 right-8 bg-slate-800 text-white py-3 px-5 rounded-lg shadow-lg flex items-center gap-4 z-50">
                    <p className="text-sm font-medium">{undoToast.message}</p>
                    <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300" onClick={() => handleUndo(undoToast.id)}>元に戻す</button>
                </div>
            )}
            {/* 編集モーダル */}
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
                    <header className="bg-white/80 backdrop-blur-sm z-10 border-b border-slate-200">
                        <div className="flex items-center justify-between h-16 px-4 md:px-8">
                            <h2 className="text-2xl font-bold text-slate-800">マイダッシュボード</h2>
                            <div className="flex items-center space-x-4">
                                <img src="https://placehold.co/40x40/E0E7FF/4F46E5?text=A" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow" />
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {/* View Settings Panel */}
                        <div className="flex flex-row flex-wrap items-center gap-3 mb-6">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-slate-500">レイアウト:</span>
                                <div className="inline-flex rounded-md shadow-sm bg-white p-1">
                                    <button
                                        className={`view-control-btn px-2 py-1 text-sm font-semibold text-slate-600 rounded-md ${viewSettings.layout === 'list' ? 'bg-indigo-50' : ''}`}
                                        onClick={() => handleLayoutChange('list')}
                                    >リスト</button>
                                    <button
                                        className={`view-control-btn px-2 py-1 text-sm font-semibold text-slate-600 rounded-md ${viewSettings.layout === 'board' ? 'bg-indigo-50' : ''}`}
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
                        {/* View Area: レイアウト切り替え */}
                        {viewSettings.layout === 'list' ? (
                            <>
                            <style>{kanbanDnDStyles}</style>
                            <DndContext
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
                                    // const targetCards = groupedCards[targetGroupKey];
                                    // overIndex: 空リストDnD時は0、通常DnD時は既存カードのindex
                                    setUndoStack(prev => [...prev, { prevCards: cards, message: 'カードを移動しました', id: Date.now() }]);
                                    setUndoToast({ open: true, message: 'カードを移動しました', id: Date.now() });
                                    setCards(prev => {
                                        let updated = prev;
                                        if (viewSettings.groupBy === 'project') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, projectId: targetGroupKey } : card
                                            );
                                        } else if (viewSettings.groupBy === 'status') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, status: targetGroupKey } : card
                                            );
                                        } else if (viewSettings.groupBy === 'dueDate') {
                                            if (targetGroupKey === '期日未設定') {
                                                updated = prev.map(card =>
                                                    card.id === movingCard.id ? { ...card, startDate: '', duration: '' } : card
                                                );
                                            } else {
                                                updated = prev.map(card =>
                                                    card.id === movingCard.id ? { ...card, startDate: targetGroupKey } : card
                                                );
                                            }
                                        }
                                        // グループ内の新しい順序をcards全体に反映
                                        let newTargetCards = updated.filter(card => {
                                            if (viewSettings.groupBy === 'project') return card.projectId === targetGroupKey;
                                            if (viewSettings.groupBy === 'status') return card.status === targetGroupKey;
                                            if (viewSettings.groupBy === 'dueDate') return card.startDate === targetGroupKey;
                                            return false;
                                        });
                                        const movingIdx = newTargetCards.findIndex(card => card.id === movingCard.id);
                                        let reordered = arrayMove(newTargetCards, movingIdx, overIndex);
                                        if (viewSettings.groupBy === 'project') {
                                            const project = projects[targetGroupKey];
                                            let baseDate = project && project.deadline ? new Date(project.deadline) : new Date();
                                            for (let i = reordered.length - 1; i >= 0; i--) {
                                                let card = reordered[i];
                                                let duration = Number(card.duration) || 1;
                                                baseDate.setDate(baseDate.getDate() - duration);
                                                card = { ...card, startDate: baseDate.toISOString().split('T')[0] };
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
                                        // --- グループタイトル・サブタイトル・警告 ---
                                        let groupTitle = groupKey;
                                        let subTitle = '';
                                        let warning = '';
                                        if (viewSettings.groupBy === 'project') {
                                            const project = projects[groupKey];
                                            groupTitle = project?.name || groupKey;
                                            subTitle = project?.client ? `（${project.client}）` : '';
                                            if (project) {
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
                                                    <h3 className="text-lg font-bold text-slate-700">
                                                        {groupTitle}
                                                        {subTitle && <span className="text-xs text-slate-400 ml-2">{subTitle}</span>}
                                                    </h3>
                                                    {viewSettings.groupBy === 'project' && projects[groupKey]?.deadline && (
                                                        <p className="text-sm text-slate-500">プロジェクト期日: {projects[groupKey].deadline}</p>
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
                                                                <SortableCard key={card.id} card={card} /* onEdit={handleEditClick} */ activeId={activeId} />
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
                            // ボードビュー: HTML版に近いカンバンUI
                            <>
                            <style>{kanbanDnDStyles}</style>
                            <DndContext
                                collisionDetection={closestCenter}
                                onDragStart={e => setActiveId(e.active.id)}
                                onDragOver={e => {
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
                                    // 空カラムDnD対応
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
                                    // overIndex: 空カラムDnD時は0、通常DnD時は既存カードのindex
                                    // Undo保存
                                    setUndoStack(prev => [...prev, { prevCards: cards, message: 'カードを移動しました', id: Date.now() }]);
                                    setUndoToast({ open: true, message: 'カードを移動しました', id: Date.now() });
                                    setCards(prev => {
                                        let updated = prev;
                                        if (viewSettings.groupBy === 'project') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, projectId: targetGroupKey } : card
                                            );
                                        } else if (viewSettings.groupBy === 'status') {
                                            updated = prev.map(card =>
                                                card.id === movingCard.id ? { ...card, status: targetGroupKey } : card
                                            );
                                        } else if (viewSettings.groupBy === 'dueDate') {
                                            if (targetGroupKey === '期日未設定') {
                                                updated = prev.map(card =>
                                                    card.id === movingCard.id ? { ...card, startDate: '', duration: '' } : card
                                                );
                                            } else {
                                                updated = prev.map(card =>
                                                    card.id === movingCard.id ? { ...card, startDate: targetGroupKey } : card
                                                );
                                            }
                                        }
                                        // グループ内の新しい順序をcards全体に反映
                                        let newTargetCards = updated.filter(card => {
                                            if (viewSettings.groupBy === 'project') return card.projectId === targetGroupKey;
                                            if (viewSettings.groupBy === 'status') return card.status === targetGroupKey;
                                            if (viewSettings.groupBy === 'dueDate') return card.startDate === targetGroupKey;
                                            return false;
                                        });
                                        const movingIdx = newTargetCards.findIndex(card => card.id === movingCard.id);
                                        let reordered = arrayMove(newTargetCards, movingIdx, overIndex);
                                        // プロジェクト内DnD時はstartDateを自動再計算
                                        if (viewSettings.groupBy === 'project') {
                                            const project = projects[targetGroupKey];
                                            let baseDate = project && project.deadline ? new Date(project.deadline) : new Date();
                                            for (let i = reordered.length - 1; i >= 0; i--) {
                                                let card = reordered[i];
                                                let duration = Number(card.duration) || 1;
                                                baseDate.setDate(baseDate.getDate() - duration);
                                                card = { ...card, startDate: baseDate.toISOString().split('T')[0] };
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
                                        // カラムタイトル
                                        let groupTitle = groupKey;
                                        let subTitle = '';
                                        if (viewSettings.groupBy === 'project') {
                                            groupTitle = projects[groupKey]?.name || groupKey;
                                            subTitle = projects[groupKey]?.client ? `（${projects[groupKey].client}）` : '';
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
                                        // プロジェクト内DnD時はstartDateを自動再計算
                                        let displayCards = groupCards;
                                        if (viewSettings.groupBy === 'project' && groupCards.length > 0) {
                                            const project = projects[groupKey];
                                            let baseDate = project && project.deadline ? new Date(project.deadline) : new Date();
                                            displayCards = [...groupCards];
                                            for (let i = displayCards.length - 1; i >= 0; i--) {
                                                let card = displayCards[i];
                                                let duration = Number(card.duration) || 1;
                                                baseDate.setDate(baseDate.getDate() - duration);
                                                card = { ...card, startDate: baseDate.toISOString().split('T')[0] };
                                                displayCards[i] = card;
                                            }
                                        }
                                        const isEmpty = displayCards.length === 0;
                                        return (
                                            <div
                                                key={groupKey}
                                                className={`bg-slate-200 rounded-xl p-3 kanban-column flex flex-col min-h-[400px] ${dragOverInfo.groupKey === groupKey ? 'drag-over' : ''}`}
                                                style={{ boxSizing: 'border-box' }}
                                            >
                                                <div className="flex items-center justify-between mb-4 px-1">
                                                    <h3 className="font-bold text-slate-700 text-base tracking-wide">{groupTitle} <span className="text-xs text-slate-400 font-normal">{subTitle}</span></h3>
                                                    <span className="text-sm font-semibold text-slate-500 bg-slate-300 px-2 py-1 rounded-md">{groupCards.length}</span>
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
    // KanbanCard.jsのDnD安定化ロジックを取り入れつつ、見た目は現状維持
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
    };
    // ステータスバッジ
    const statusInfo = {
        unsent: { label: '未編集', bg: 'bg-slate-200', text: 'text-slate-600' },
        edited: { label: '編集済', bg: 'bg-blue-100', text: 'text-blue-700' },
        awaiting_approval: { label: '承認待ち', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        revision_needed: { label: '要修正', bg: 'bg-red-100', text: 'text-red-700' },
        approved: { label: '承認済', bg: 'bg-green-100', text: 'text-green-700' },
    }[card.status] || { label: card.status, bg: 'bg-slate-200', text: 'text-slate-600' };
    // アクションアイコン
    const actionIcon = (card.status === 'unsent' || card.status === 'revision_needed') ? (
        <button title="編集する" className="text-slate-400 hover:text-indigo-600" onClick={e => { e.stopPropagation(); onEdit && onEdit(card); }}>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
        </button>
    ) : card.status === 'edited' ? (
        <button title="送信する" className="text-blue-500 hover:text-blue-700" onClick={e => { e.stopPropagation(); /* 送信アクション仮 */ }}>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 8.25l-5.607-1.752a.75.75 0 00-.95-.826z" /><path d="M15 6.75a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h3.5a.75.75 0 00.75-.75zM15 9.75a.75.75 0 00-.75-.75h-6.5a.75.75 0 000 1.5h6.5a.75.75 0 00.75-.75zM15 12.75a.75.75 0 00-.75-.75h-6.5a.75.75 0 000 1.5h6.5a.75.75 0 00.75-.75zM4.832 15.312a.75.75 0 00.95-.826l-1.414-4.95a.75.75 0 00-.95-.826L.5 11.25l5.607 1.752a.75.75 0 00.95.826z" /></svg>
        </button>
    ) : null;
    // プロジェクト名
    const projectName = projects && projects[card.projectId]?.name;
    // 期日
    const dueDate = (() => {
        if (!card.startDate || !card.duration) return '';
        const date = new Date(card.startDate);
        date.setDate(date.getDate() + Number(card.duration));
        return date.toISOString().split('T')[0];
    })();
    return (
        <div
            ref={combinedRef}
            style={style}
            {...attributes}
            {...listeners}
            className={
                'bg-white rounded-lg shadow kanban-card flex flex-col gap-2 border border-slate-200 min-h-[48px] transition-all p-3 sm:p-4 ' +
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

// ドロップターゲットの高さをカードに合わせるコンポーネント
