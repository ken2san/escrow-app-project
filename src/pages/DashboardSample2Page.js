
import React, { useState, useMemo } from 'react';

const initialData = [
    { id: 1, title: 'UI/UXデザイン設計', status: 'approved', reward: 150000, dueDate: '2025-08-20', project: 'Eコマースサイト構築', client: 'NextGen Mart' },
    { id: 2, title: 'フロントエンド開発', status: 'awaiting_approval', reward: 300000, dueDate: '2025-09-10', project: 'Eコマースサイト構築', client: 'NextGen Mart' },
    { id: 3, title: 'バックエンド開発', status: 'edited', reward: 400000, dueDate: '2025-09-30', project: 'Eコマースサイト構築', client: 'NextGen Mart' },
    { id: 4, title: 'ロゴデザイン', status: 'approved', reward: 80000, dueDate: '2025-08-25', project: '新規ブランド立ち上げ', client: 'Creative Studio' },
    { id: 5, title: 'LP制作', status: 'revision_needed', reward: 120000, dueDate: '2025-08-18', project: '新規ブランド立ち上げ', client: 'Creative Studio' },
    { id: 6, title: 'SNSキャンペーン企画', status: 'unsent', reward: 100000, dueDate: null, project: '秋のセールスプロモーション', client: 'Growth Hackers' },
];

const statusInfoMap = {
    unsent: { label: '未編集', bg: 'bg-slate-200', text: 'text-slate-600' },
    edited: { label: '編集済', bg: 'bg-blue-100', text: 'text-blue-700' },
    awaiting_approval: { label: '承認待ち', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    revision_needed: { label: '要修正', bg: 'bg-red-100', text: 'text-red-700' },
    approved: { label: '承認済', bg: 'bg-green-100', text: 'text-green-700' },
};

function getStatusInfo(status) {
    return statusInfoMap[status] || { label: '不明', bg: 'bg-slate-200', text: 'text-slate-600' };
}
function getStatusText(status) {
    return getStatusInfo(status).label;
}
function getDueDateCategory(dueDateStr) {
    if (!dueDateStr) return '期日未設定';
    const today = new Date(); today.setHours(0,0,0,0);
    const dueDate = new Date(dueDateStr);
    if (dueDate < today) return '期限切れ';
    if (dueDate.getTime() === today.getTime()) return '今日が期日';
    return '今後';
}

const DashboardSample2Page = () => {
    const [data] = useState(initialData);
    const [layout, setLayout] = useState('list');
    const [groupBy, setGroupBy] = useState('project');
    const [sortBy, setSortBy] = useState('dueDate');

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            if (sortBy === 'dueDate') {
                return (a.dueDate || '9999-12-31') > (b.dueDate || '9999-12-31') ? 1 : -1;
            }
            if (sortBy === 'reward') {
                return b.reward - a.reward;
            }
            return 0;
        });
    }, [data, sortBy]);

    const groupedData = useMemo(() => {
        return sortedData.reduce((acc, card) => {
            let key;
            if (groupBy === 'project') {
                key = card.project;
            } else if (groupBy === 'status') {
                key = getStatusText(card.status);
            } else if (groupBy === 'dueDate') {
                key = getDueDateCategory(card.dueDate);
            }
            if (!acc[key]) acc[key] = [];
            acc[key].push(card);
            return acc;
        }, {});
    }, [sortedData, groupBy]);

    const renderCard = (card, layoutType) => {
        const statusInfo = getStatusInfo(card.status);
        const cardBaseClass = layoutType === 'list'
            ? 'border-t first:border-t-0 border-slate-200'
            : 'bg-white rounded-lg shadow kanban-card';
        return (
            <div key={card.id} className={`${cardBaseClass} p-4`} draggable>
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 flex-1 pr-2">{card.title}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{card.project}</p>
                <div className="flex justify-between items-end mt-4">
                    <div className="text-sm text-slate-600">
                        <p>¥{card.reward.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{card.dueDate || '期日未設定'}</p>
                    </div>
                    <img src="https://placehold.co/24x24/E0E7FF/4F46E5?text=A" alt="Assignee" className="w-6 h-6 rounded-full" />
                </div>
            </div>
        );
    };

    const renderListView = () => (
        <div className="space-y-6">
            {Object.entries(groupedData).map(([groupTitle, cards]) => (
                <div key={groupTitle}>
                    <h3 className="text-lg font-bold text-slate-700 mb-3">{groupTitle}</h3>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                        {cards.map(card => renderCard(card, 'list'))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderBoardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(groupedData).map(([groupTitle, cards]) => (
                <div key={groupTitle} className="bg-slate-200 rounded-xl p-3 kanban-column">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-slate-700">{groupTitle}</h3>
                        <span className="text-sm font-semibold text-slate-500 bg-slate-300 px-2 py-1 rounded-md">{cards.length}</span>
                    </div>
                    <div className="space-y-3">
                        {cards.map(card => renderCard(card, 'board'))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-slate-100 text-slate-800 min-h-screen">
            <div className="max-w-6xl mx-auto py-8">
                <h2 className="text-2xl font-bold mb-6">Dashboard Sample 2</h2>
                {/* View Settings Panel */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">レイアウト:</span>
                        <div className="inline-flex rounded-md shadow-sm bg-white p-1">
                            <button
                                className={`view-control-btn px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 ${layout === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                onClick={() => setLayout('list')}
                            >リスト</button>
                            <button
                                className={`view-control-btn px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 ${layout === 'board' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                onClick={() => setLayout('board')}
                            >ボード</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">グループ化:</span>
                        <select
                            className="bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                            value={groupBy}
                            onChange={e => setGroupBy(e.target.value)}
                        >
                            <option value="project">プロジェクト</option>
                            <option value="status">ステータス</option>
                            <option value="dueDate">期日</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500">並べ替え:</span>
                        <select
                            className="bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="dueDate">期日 (昇順)</option>
                            <option value="reward">報酬額 (降順)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <svg className="w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.59L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" /></svg>
                            フィルター
                        </button>
                    </div>
                </div>
                {/* View Area */}
                <div>
                    {layout === 'list' ? renderListView() : renderBoardView()}
                </div>
            </div>
        </div>
    );
};

export default DashboardSample2Page;
