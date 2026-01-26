import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import './workmanagement.css';
import { DndContext, closestCenter, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { workManagementProjects as initialProjectsData, loggedInUserDataGlobal } from '../utils/initialData';
import EmptyDropzone from '../components/common/EmptyDropzone';
import KanbanCard from '../components/dashboard/KanbanCard';


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
        // Group cards for rendering (by project/status/dueDate)
    // --- State and handlers ---
    const [projects, setProjects] = useState(getInitialProjects());
    const [projectTab] = useState('pending');
    const [viewSettings] = useState({ layout: 'list', groupBy: 'project', sortBy: 'startDate' });
    const [activeId, setActiveId] = useState(null);
    const [dragOverInfo, setDragOverInfo] = useState({ groupKey: null, overIndex: null });
    const { t } = useTranslation();

    const groupedCards = useMemo(() => {
        let allCards = [];
        projects.forEach(p => {
            if (Array.isArray(p.cards)) {
                allCards = allCards.concat(p.cards.map(card => ({ ...card, projectId: p.id, _pendingStatus: p._pendingStatus })));
            }
        });
        if (viewSettings.groupBy === 'project') {
            const map = {};
            projects.forEach(p => {
                map[p.id] = allCards.filter(card => String(card.projectId) === String(p.id));
            });
            return map;
        } else if (viewSettings.groupBy === 'status') {
            const map = {};
            allCards.forEach(card => {
                if (!map[card.status]) map[card.status] = [];
                map[card.status].push(card);
            });
            return map;
        } else if (viewSettings.groupBy === 'dueDate') {
            const map = { '期限切れ': [], '今日が期日': [], '今後': [], '期日未設定': [] };
            const today = new Date().toISOString().split('T')[0];
            allCards.forEach(card => {
                if (!card.startDate) return map['期日未設定'].push(card);
                if (card.startDate < today) return map['期限切れ'].push(card);
                if (card.startDate === today) return map['今日が期日'].push(card);
                return map['今後'].push(card);
            });
            return map;
        }
        return {};
    }, [projects, viewSettings.groupBy]);

    // DnD sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
    );

    // Active card for DragOverlay
    const activeCard = useMemo(() => {
        if (!activeId) return null;
        for (const group of Object.values(groupedCards)) {
            const found = group.find(card => card.id === activeId);
            if (found) return found;
        }
        return null;
    }, [activeId, groupedCards]);



    // Show no pending message if no cards in pending
    const showNoPendingMessage = projectTab === 'pending' && projects.every(p => !p.cards || p.cards.length === 0);

    // 応募状態がグローバルで変わったら反映
    useEffect(() => {
        const handler = () => setProjects(getInitialProjects());
        window.addEventListener('updatePendingApplications', handler);
        return () => window.removeEventListener('updatePendingApplications', handler);
    }, []);

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
            {/* Main Content always rendered */}
            <main className="flex-1 flex flex-col">
                {/* ...existing code for tab bar, settings, and main view... */}
                        {viewSettings.layout === 'list' && projectTab === 'pending' && (
                            <div id="view-area" className="flex flex-col gap-8">
                                {Object.entries(groupedCards).map(([groupKey, groupCards]) => {
                                    let groupTitle = groupKey;
                                    let subTitle = '';
                                    let warning = '';
                                    if (viewSettings.groupBy === 'project') {
                                        const project = projects.find(p => String(p.id) === String(groupKey));
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
                                                {warning && <p className="text-sm font-bold text-red-500 mt-1">{warning}</p>}
                                            </div>
                                            <div className="space-y-0">
                                                {isEmpty
                                                    ? <EmptyDropzone id={`empty-dropzone-${groupKey}`} />
                                                    : groupCards.map((card, idx) => {
                                                        return (
                                                            <div key={card.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2 flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-slate-800">{card.title}</span>
                                                                    <span className="ml-2 text-xs font-bold text-yellow-700 bg-yellow-100 rounded px-2 py-0.5">審査中</span>
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1">この仕事は現在クライアントの審査中です。編集・操作はできません。</div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {viewSettings.layout === 'list' && projectTab !== 'pending' && (
                            <div id="view-area" className="flex flex-col gap-8">
                                {/* Non-pending list view rendering here (if needed) */}
                            </div>
                        )}
                        {viewSettings.layout === 'board' && (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={e => setActiveId(e.active.id)}
                                onDragOver={e => {
                                    // ...existing code...
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
                                    // ...existing code...
                                    const { active, over } = e;
                                    let fallbackOver = over;
                                    if (!fallbackOver && dragOverInfo.groupKey) {
                                        fallbackOver = { id: `column-dropzone-${dragOverInfo.groupKey}` };
                                    }
                                    setActiveId(null);
                                    setDragOverInfo({ groupKey: null, overIndex: null });
                                    if (!fallbackOver || active.id === fallbackOver.id) return;
                                    // DnD/編集はpendingタブでは不可
                                    if (projectTab === 'pending') return;
                                    // ...existing code...
                                    // rest of DnD logic
                                }}
                            >
                                {/* DragOverlay: ドラッグ中のカードをbody直下に描画し、枠外でも消えないようにする（ボードビュー） */}
                                <DragOverlay dropAnimation={null}>
                                    {activeCard && (
                                        <KanbanCard card={activeCard} />
                                    )}
                                </DragOverlay>
                                <div id="board-area" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {Object.entries(groupedCards).map(([groupKey, groupCards]) => {
                                        let groupTitle = groupKey;
                                        let subTitle = '';
                                        if (viewSettings.groupBy === 'project') {
                                            const project = projects.find(p => String(p.id) === String(groupKey));
                                            groupTitle = project?.name || groupKey;
                                            subTitle = project?.client ? `（${project.client}）` : '';
                                            if (project) {/* Lines 910-925 omitted */}
                                        } else {
                                            // Lines 926-943 omitted
                                        }
                                        // 表示時は元データのstartDateをそのまま使う（ボードビューで日付を再計算しない）
                                        const isEmpty = groupCards.length === 0;
                                        return (
                                            <div key={groupKey} className="mb-8">
                                                <div className="p-4 pb-2">
                                                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                                        {groupTitle}
                                                        {subTitle && <span className="text-xs text-slate-400 ml-2">{subTitle}</span>}
                                                    </h3>
                                                </div>
                                                <div className="space-y-0">
                                                    {isEmpty
                                                        ? <EmptyDropzone id={`empty-dropzone-${groupKey}`} />
                                                        : groupCards.map((card, idx) => {
                                                            return (
                                                                <KanbanCard key={card.id} card={card} />
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DndContext>
                        )}
                </main>
        </div>
    );
}
