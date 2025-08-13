import React, { useState } from 'react';

// TailwindCSS前提。UI/ロジックはHTML+JSデモを忠実に再現
const initialMilestoneTitles = [
	'UI/UXデザイン設計',
	'フロントエンド開発',
	'バックエンド開発',
	'テストとデプロイ',
];

function ProjectFlowDemoPage() {
	// --- STATE ---
	const [projects, setProjects] = useState([]);
	const [nextProjectId, setNextProjectId] = useState(1);
	const [nextCardId, setNextCardId] = useState(1);
	const [showNewProject, setShowNewProject] = useState(false);
	const [showEditCard, setShowEditCard] = useState(false);
	const [showSendDialog, setShowSendDialog] = useState(false);
	const [cardToSendId, setCardToSendId] = useState(null);
	const [tempProject, setTempProject] = useState({ name: '', client: '', totalBudget: '', description: '' });
	const [step, setStep] = useState(1); // 1:概要, 2:マイルストーン
	const [milestones, setMilestones] = useState([]); // [{title}]
	const [aiGenerating, setAiGenerating] = useState(false);
	const [editCard, setEditCard] = useState(null); // {projectId, id, ...}
	const [aiCheckLoading, setAiCheckLoading] = useState(false);
	const [aiCheckResult, setAiCheckResult] = useState('');

	// --- PROJECT LIST ---
	const handleAddProject = () => {
		setShowNewProject(true);
		setStep(1);
		setTempProject({ name: '', client: '', totalBudget: '', description: '' });
		setMilestones([]);
	};

	// --- NEW PROJECT MODAL ---
	const handleNextStep = () => {
		setStep(2);
		setAiGenerating(true);
		setTimeout(() => {
			setMilestones(initialMilestoneTitles.map(title => ({ title })));
			setAiGenerating(false);
		}, 1500);
	};

	const handleAddMilestone = () => {
		setMilestones([...milestones, { title: '新しいマイルストーン' }]);
	};
	const handleRemoveMilestone = idx => {
		setMilestones(milestones.filter((_, i) => i !== idx));
	};
	const handleMilestoneTitleChange = (idx, value) => {
		setMilestones(milestones.map((m, i) => i === idx ? { ...m, title: value } : m));
	};

	const handleConfirmNewProject = () => {
		const newProject = {
			id: nextProjectId,
			name: tempProject.name,
			client: tempProject.client,
			totalBudget: parseInt(tempProject.totalBudget) || 0,
			description: tempProject.description,
			cards: milestones.map(m => ({
				id: nextCardId + Math.random(), // avoid collision
				projectId: nextProjectId,
				title: m.title,
				description: '',
				reward: 0,
				status: 'unsent',
			})),
		};
		setProjects([...projects, newProject]);
		setNextProjectId(nextProjectId + 1);
		setNextCardId(nextCardId + milestones.length);
		setShowNewProject(false);
		setStep(1);
		setMilestones([]);
	};

	const handleCancelNewProject = () => {
		setShowNewProject(false);
		setStep(1);
		setMilestones([]);
	};

	// --- PROJECT CARD展開 ---
	const [openProjectIds, setOpenProjectIds] = useState([]);
	const toggleProjectOpen = pid => {
		setOpenProjectIds(openProjectIds.includes(pid)
			? openProjectIds.filter(id => id !== pid)
			: [...openProjectIds, pid]);
	};

	// --- CARD編集 ---
	const openEditModal = (projectId, cardId) => {
		const project = projects.find(p => p.id === projectId);
		const card = project.cards.find(c => c.id === cardId);
		setEditCard({ ...card, projectId });
		setShowEditCard(true);
		setAiCheckResult('');
		setAiCheckLoading(false);
	};
	const closeEditModal = () => {
		setShowEditCard(false);
		setEditCard(null);
		setAiCheckResult('');
		setAiCheckLoading(false);
	};
	const handleEditCardChange = (field, value) => {
		setEditCard({ ...editCard, [field]: value });
	};
	const handleConfirmEditCard = () => {
		setProjects(projects.map(p =>
			p.id === editCard.projectId
				? { ...p, cards: p.cards.map(c => c.id === editCard.id ? { ...editCard, status: 'edited' } : c) }
				: p
		));
		closeEditModal();
	};

	// --- AI契約チェック ---
	const handleAICheck = () => {
		setAiCheckLoading(true);
		setTimeout(() => {
			setAiCheckResult('・「できるだけ早く」といった曖昧な表現は避け、具体的な期日を記載しましょう。<br>・納品物の形式（例: PNG, JPG）を明記することをお勧めします。');
			setAiCheckLoading(false);
		}, 1500);
	};

	// --- CARD送信 ---
	const handleSendCard = (projectId, cardId) => {
		setCardToSendId({ projectId, cardId });
		setShowSendDialog(true);
	};
	const handleConfirmSend = () => {
		setProjects(projects.map(p =>
			p.id === cardToSendId.projectId
				? { ...p, cards: p.cards.map(c => c.id === cardToSendId.cardId ? { ...c, status: 'awaiting_approval' } : c) }
				: p
		));
		setShowSendDialog(false);
		setCardToSendId(null);
	};
	const handleCancelSend = () => {
		setShowSendDialog(false);
		setCardToSendId(null);
	};

	// --- 承認/修正 ---
	const handleApprove = (projectId, cardId) => {
		setProjects(projects.map(p =>
			p.id === projectId
				? { ...p, cards: p.cards.map(c => c.id === cardId ? { ...c, status: 'approved' } : c) }
				: p
		));
	};
	const handleReject = (projectId, cardId) => {
		setProjects(projects.map(p =>
			p.id === projectId
				? { ...p, cards: p.cards.map(c => c.id === cardId ? { ...c, status: 'revision_needed' } : c) }
				: p
		));
	};

	// --- UTILS ---
	const formatYen = n => '¥' + (n ? n.toLocaleString() : '0');

	// --- RENDER ---
	return (
		<div className="bg-slate-100 text-slate-800 min-h-screen">
			<div className="flex h-screen">
				{/* Sidebar */}
				<aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col">
					<div className="flex items-center justify-center lg:justify-start h-16 border-b border-slate-200 px-6">
						<h1 className="text-2xl font-bold text-indigo-600 hidden lg:block">Waritsu</h1>
						<svg className="w-8 h-8 text-indigo-600 lg:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM8 8v8m4-8v8m4-8v8"/></svg>
					</div>
					<nav className="flex-1 mt-6 space-y-2 px-2 lg:px-4">
									<button type="button" className="flex items-center p-3 bg-indigo-50 text-indigo-700 rounded-lg w-full text-left focus:outline-none">
										<svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
										<span className="ml-4 font-semibold hidden lg:inline">ダッシュボード</span>
									</button>
					</nav>
				</aside>
				{/* Main */}
				<main className="flex-1 overflow-y-auto p-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-bold text-slate-800">プロジェクト一覧</h2>
						<button onClick={handleAddProject} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
							<svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
							新規プロジェクト追加
						</button>
					</div>
					<div className="space-y-4">
						{projects.map(project => (
							<div key={project.id} className={`project-card bg-white rounded-xl shadow-sm border border-slate-200 ${openProjectIds.includes(project.id) ? 'open' : ''}`}>
								<div className="project-header p-4 cursor-pointer flex justify-between items-center" onClick={() => toggleProjectOpen(project.id)}>
									<div>
										<h3 className="text-xl font-bold">{project.name}</h3>
										<p className="text-sm text-slate-500">{project.client} / 総予算: {formatYen(project.totalBudget)}</p>
									</div>
									<svg className={`chevron w-6 h-6 text-slate-400 transition-transform ${openProjectIds.includes(project.id) ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
								</div>
								<div className={`details-content overflow-hidden transition-all ${openProjectIds.includes(project.id) ? 'max-h-[1000px]' : 'max-h-0'}`}>
									{project.cards.map(card => (
										<div key={card.id} className="work-card bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
											<div className="flex flex-col">
												<span className="font-medium text-slate-700">{card.title}</span>
												<span className="text-sm text-slate-500">{formatYen(card.reward)}</span>
											</div>
											<div className="flex items-center space-x-3">
												{/* クライアント側の承認/修正ボタン */}
												{card.status === 'awaiting_approval' && (
													<div className="flex space-x-2">
														<button className="client-reject-btn text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" onClick={e => { e.stopPropagation(); handleReject(project.id, card.id); }}>要修正</button>
														<button className="client-approve-btn text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200" onClick={e => { e.stopPropagation(); handleApprove(project.id, card.id); }}>承認</button>
													</div>
												)}
												{/* アイコン/アクション */}
												{(card.status === 'unsent' || card.status === 'revision_needed') && (
													<div className="card-action-icon cursor-pointer" title={card.status === 'unsent' ? 'クリックして編集' : '修正が必要です'} onClick={e => { e.stopPropagation(); openEditModal(project.id, card.id); }}>
														<svg className={`w-6 h-6 ${card.status === 'revision_needed' ? 'text-red-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
															{card.status === 'revision_needed' ? (
																<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
															) : (
																<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
															)}
														</svg>
													</div>
												)}
												{card.status === 'edited' && (
													<div className="card-action-icon cursor-pointer" title="クリックして送信" onClick={e => { e.stopPropagation(); handleSendCard(project.id, card.id); }}>
														<svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25" /></svg>
													</div>
												)}
												{card.status === 'awaiting_approval' && (
													<div title="承認待ち">
														<svg className="w-6 h-6 text-yellow-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
													</div>
												)}
												{card.status === 'approved' && (
													<div title="承認済み">
														<svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</main>
			</div>

			{/* 新規プロジェクトモーダル */}
			{showNewProject && (
				<div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-8 max-h-[90vh] flex flex-col">
						<div className="p-6 border-b flex justify-between items-center">
							<h3 className="text-2xl font-bold">新規プロジェクト作成</h3>
							<button onClick={handleCancelNewProject} className="text-slate-400 hover:text-slate-600">&larr; 概要に戻る</button>
						</div>
						{step === 1 && (
							<div className="p-6 flex-1 overflow-y-auto">
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-700">プロジェクト名</label>
										<input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.name} onChange={e => setTempProject({ ...tempProject, name: e.target.value })} />
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700">クライアント</label>
										<input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.client} onChange={e => setTempProject({ ...tempProject, client: e.target.value })} placeholder="例：株式会社NextGen Mart" />
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700">総予算</label>
										<div className="relative mt-1">
											<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
												<span className="text-gray-500 sm:text-sm">¥</span>
											</div>
											<input type="number" className="block w-full rounded-md border-slate-300 pl-7 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="0" value={tempProject.totalBudget} onChange={e => setTempProject({ ...tempProject, totalBudget: e.target.value })} />
										</div>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700">プロジェクトの概要</label>
										<textarea rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="例：新しいEコマースサイトを構築し、ユーザーが商品を閲覧・購入できるようにする。" value={tempProject.description} onChange={e => setTempProject({ ...tempProject, description: e.target.value })} />
									</div>
								</div>
							</div>
						)}
						{step === 2 && (
							<div className="p-6 flex-1 overflow-y-auto">
								<div className="mt-6 space-y-3">
									{aiGenerating ? (
										<div className="flex justify-center items-center p-4"><svg className="w-6 h-6 mr-3 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> AIがマイルストーンを生成中...</div>
									) : (
										<>
											<p className="text-sm font-semibold text-slate-600">AIが生成したマイルストーン案：</p>
											{milestones.map((m, i) => (
												<div key={i} className="milestone-gen-card flex items-center bg-slate-100 p-2 rounded-lg mb-1">
													<input type="text" value={m.title} className="flex-1 bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-md p-1" onChange={e => handleMilestoneTitleChange(i, e.target.value)} />
													<button className="remove-milestone-btn p-1 text-slate-400 hover:text-red-500" onClick={() => handleRemoveMilestone(i)}><svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
												</div>
											))}
											<button className="w-full text-sm text-slate-500 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors" onClick={handleAddMilestone}>+ マイルストーンを追加</button>
										</>
									)}
								</div>
							</div>
						)}
						<div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
							<button onClick={handleCancelNewProject} className="bg-white border border-slate-300 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50">キャンセル</button>
							{step === 1 && (
								<button onClick={handleNextStep} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700">マイルストーン設定へ &rarr;</button>
							)}
							{step === 2 && (
								<button onClick={handleConfirmNewProject} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700" disabled={milestones.length === 0}>登録して確定</button>
							)}
						</div>
					</div>
				</div>
			)}

			{/* カード編集モーダル */}
			{showEditCard && editCard && (
				<div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-8 max-h-[90vh] flex flex-col">
						<div className="p-6 border-b">
							<h3 className="text-2xl font-bold">仕事（マイルストーン）の編集</h3>
						</div>
						<div className="p-6 flex-1 overflow-y-auto">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700">タイトル</label>
									<input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={editCard.title} onChange={e => handleEditCardChange('title', e.target.value)} />
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700">報酬額</label>
									<div className="relative mt-1">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
											<span className="text-gray-500 sm:text-sm">¥</span>
										</div>
										<input type="number" className="block w-full rounded-md border-slate-300 pl-7 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="0" value={editCard.reward} onChange={e => handleEditCardChange('reward', e.target.value)} />
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700">詳細説明（契約内容）</label>
									<textarea rows={6} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="成果物、検収条件、作業範囲などを具体的に記述します。" value={editCard.description} onChange={e => handleEditCardChange('description', e.target.value)} />
								</div>
								<button className="w-full bg-teal-100 text-teal-700 font-semibold py-2 px-4 rounded-lg hover:bg-teal-200 transition-colors flex items-center justify-center" onClick={handleAICheck} disabled={aiCheckLoading}>
									<svg className={`w-5 h-5 mr-2 ${aiCheckLoading ? 'animate-spin' : 'hidden'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
									AI契約チェック
								</button>
								{aiCheckResult && (
									<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm" dangerouslySetInnerHTML={{ __html: `<strong>AIによるチェック結果：</strong><br>${aiCheckResult}` }} />
								)}
							</div>
						</div>
						<div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
							<button onClick={closeEditModal} className="bg-white border border-slate-300 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50">キャンセル</button>
							<button onClick={handleConfirmEditCard} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700">登録確定</button>
						</div>
					</div>
				</div>
			)}

			{/* 送信確認ダイアログ */}
			{showSendDialog && (
				<div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-sm m-8">
						<div className="p-6">
							<div className="text-center">
								<svg className="mx-auto mb-4 w-12 h-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6.75 2.25h.75a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75" />
								</svg>
								<h3 className="text-lg font-semibold text-slate-800">契約を送信しますか？</h3>
								<p className="mt-2 text-sm text-slate-500">この仕事カードをクライアントに送信し、契約プロセスを開始します。送信後は内容を編集できません。</p>
							</div>
						</div>
						<div className="p-4 bg-slate-50 flex justify-center space-x-3">
							<button onClick={handleCancelSend} className="bg-white border border-slate-300 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50">キャンセル</button>
							<button onClick={handleConfirmSend} className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700">送信する</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default ProjectFlowDemoPage;
