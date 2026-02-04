import React, { useState } from 'react';

// Project creation modal component based on ProjectFlowDemoPage
export default function NewProjectModal({
  open,
  onClose,
  onConfirm,
  nextProjectId,
  nextCardId
}) {
  const initialMilestoneTitles = [
    'UI/UXデザイン設計',
    'フロントエンド開発',
    'バックエンド開発',
    'テストとデプロイ',
  ];
  const [step, setStep] = useState(1);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [tempProject, setTempProject] = useState({
    name: '',
    client: '',
    totalBudget: '',
    deadline: '',
    duration: '',
    description: '',
    deliverables: '',
    acceptanceCriteria: '',
    scopeOfWork_included: '',
    scopeOfWork_excluded: '',
    additionalWorkTerms: ''
  });
  const [milestones, setMilestones] = useState([]);
  const [initialStatus, setInitialStatus] = useState('recruiting'); // 'recruiting' | 'inprogress'
  const [showStep1Errors, setShowStep1Errors] = useState(false);
  const [showStep2Errors, setShowStep2Errors] = useState(false);

  const hasValidBudget = Number(tempProject.totalBudget) > 0;
  const hasValidDuration = Number(tempProject.duration) > 0;
  const step1Valid =
    tempProject.name.trim() &&
    tempProject.client.trim() &&
    hasValidBudget &&
    tempProject.deadline &&
    hasValidDuration &&
    tempProject.description.trim();

  const milestonesValid =
    milestones.length > 0 &&
    milestones.every(m => m.title && m.title.trim());

  if (!open) return null;

  const handleNextStep = () => {
    if (!step1Valid) {
      setShowStep1Errors(true);
      return;
    }
    setShowStep2Errors(false);
    setStep(2);
    setAiGenerating(true);
    setTimeout(() => {
      setMilestones(initialMilestoneTitles.map(title => ({
        title,
        deliverables: '',
        acceptanceCriteria: '',
        additionalWorkTerms: ''
      })));
      setAiGenerating(false);
    }, 1000);
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, {
      title: '新しいマイルストーン',
      deliverables: '',
      acceptanceCriteria: '',
      additionalWorkTerms: ''
    }]);
  };
  const handleRemoveMilestone = idx => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };
  const handleMilestoneTitleChange = (idx, value) => {
    setMilestones(milestones.map((m, i) => i === idx ? { ...m, title: value } : m));
  };
  const handleMilestoneFieldChange = (idx, field, value) => {
    setMilestones(milestones.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleConfirm = () => {
    if (!milestonesValid) {
      setShowStep2Errors(true);
      return;
    }
    const newProject = {
      id: nextProjectId,
      name: tempProject.name,
      client: tempProject.client,
      totalBudget: parseInt(tempProject.totalBudget) || 0,
      deadline: tempProject.deadline,
      duration: tempProject.duration,
      description: tempProject.description,
      deliverables: tempProject.deliverables,
      acceptanceCriteria: tempProject.acceptanceCriteria,
      scopeOfWork_included: tempProject.scopeOfWork_included,
      scopeOfWork_excluded: tempProject.scopeOfWork_excluded,
      additionalWorkTerms: tempProject.additionalWorkTerms,
      _pendingStatus: initialStatus === 'recruiting' ? 'pending' : 'accepted',
      cards: milestones.map((m, i) => ({
        id: nextCardId + i,
        projectId: nextProjectId,
        title: m.title,
        description: '',
        reward: 0,
        status: 'unsent',
        deliverables: m.deliverables || '',
        acceptanceCriteria: m.acceptanceCriteria || '',
        additionalWorkTerms: m.additionalWorkTerms || ''
      })),
    };
    onConfirm(newProject);
    setStep(1);
    setMilestones([]);
    setInitialStatus('recruiting');
    setTempProject({
      name: '',
      client: '',
      totalBudget: '',
      deadline: '',
      duration: '',
      description: '',
      deliverables: '',
      acceptanceCriteria: '',
      scopeOfWork_included: '',
      scopeOfWork_excluded: '',
      additionalWorkTerms: ''
    });
    setShowStep1Errors(false);
    setShowStep2Errors(false);
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-8 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-2xl font-bold">新規プロジェクト作成</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&larr; 閉じる</button>
        </div>
        {step === 1 && (
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Client Trust & Risk Display (Mock Data) */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-indigo-900">📊 クライアント信頼情報</h4>
                <span className="text-xs text-indigo-600 bg-white px-2 py-1 rounded-full">デモデータ</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-500">過去プロジェクト</p>
                  <p className="text-lg font-bold text-slate-800">12件</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-500">完了率</p>
                  <p className="text-lg font-bold text-green-600">92%</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-slate-500">紛争履歴</p>
                  <p className="text-lg font-bold text-slate-800">0件</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  本人確認済み
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  支払方法確認済み
                </span>
              </div>
            </div>

            {/* Risk Display (Mock) */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-yellow-900 mb-1">⚠️ リスク評価</h4>
                  <p className="text-xs text-yellow-800">
                    <span className="font-semibold">再販リスク: 中</span> - このタイプのプロジェクトは要件が変更されやすい傾向があります。契約条件を明確にすることを推奨します。
                  </p>
                </div>
              </div>
            </div>

            {/* AI Suggestions (Mock) */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-purple-900 mb-2">💡 AI提案</h4>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>「成果物」に具体的なファイル形式（Figma、AI、PDFなど）を明記すると、後のトラブルを防げます。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>「受入基準」に検収期間（例：納品後5営業日以内）を追加すると明確になります。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>「作業範囲」で除外項目を明記することで、スコープクリープを防止できます。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">プロジェクト名</label>
                <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.name} onChange={e => setTempProject({ ...tempProject, name: e.target.value })} />
                {showStep1Errors && !tempProject.name.trim() && (
                  <p className="text-xs text-red-500 mt-1">必須項目です</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">クライアント</label>
                <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.client} onChange={e => setTempProject({ ...tempProject, client: e.target.value })} placeholder="例：株式会社NextGen Mart" />
                {showStep1Errors && !tempProject.client.trim() && (
                  <p className="text-xs text-red-500 mt-1">必須項目です</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">総予算</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">¥</span>
                  </div>
                  <input type="number" min="1" className="block w-full rounded-md border-slate-300 pl-7 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="0" value={tempProject.totalBudget} onChange={e => setTempProject({ ...tempProject, totalBudget: e.target.value })} />
                </div>
                {showStep1Errors && !hasValidBudget && (
                  <p className="text-xs text-red-500 mt-1">1以上の金額を入力してください</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">期日</label>
                <input type="date" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.deadline} onChange={e => setTempProject({ ...tempProject, deadline: e.target.value })} />
                {showStep1Errors && !tempProject.deadline && (
                  <p className="text-xs text-red-500 mt-1">必須項目です</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">期間（日数）</label>
                <input type="number" min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.duration} onChange={e => setTempProject({ ...tempProject, duration: e.target.value })} />
                {showStep1Errors && !hasValidDuration && (
                  <p className="text-xs text-red-500 mt-1">1以上の日数を入力してください</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">プロジェクトの概要</label>
                <textarea rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="例：新しいEコマースサイトを構築し、ユーザーが商品を閲覧・購入できるようにする。" value={tempProject.description} onChange={e => setTempProject({ ...tempProject, description: e.target.value })} />
                {showStep1Errors && !tempProject.description.trim() && (
                  <p className="text-xs text-red-500 mt-1">必須項目です</p>
                )}
              </div>

              {/* Contract Details Section */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">契約条件詳細</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      成果物
                      <span className="text-xs text-slate-500 ml-2">（納品物の詳細）</span>
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="例：UIデザインデータ（Figma）、デザインガイドライン、実装支援"
                      value={tempProject.deliverables}
                      onChange={e => setTempProject({ ...tempProject, deliverables: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      受入基準
                      <span className="text-xs text-slate-500 ml-2">（検収条件）</span>
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="例：デザイン仕様書通りの実装、ユーザビリティテスト合格"
                      value={tempProject.acceptanceCriteria}
                      onChange={e => setTempProject({ ...tempProject, acceptanceCriteria: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      作業範囲（含まれる内容）
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="例：UI/UXデザイン、デザインシステム構築、実装支援"
                      value={tempProject.scopeOfWork_included}
                      onChange={e => setTempProject({ ...tempProject, scopeOfWork_included: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      作業範囲（含まれない内容）
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="例：フロントエンド実装、バックエンド開発、テスト"
                      value={tempProject.scopeOfWork_excluded}
                      onChange={e => setTempProject({ ...tempProject, scopeOfWork_excluded: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      追加作業条件
                      <span className="text-xs text-slate-500 ml-2">（変更時の対応）</span>
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="例：デザイン変更は各マイルストーンごとに2回まで対応"
                      value={tempProject.additionalWorkTerms}
                      onChange={e => setTempProject({ ...tempProject, additionalWorkTerms: e.target.value })}
                    />
                  </div>
                </div>
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
                    <div key={i} className="milestone-gen-card bg-slate-50 p-4 rounded-lg mb-3 border border-slate-200">
                      <div className="flex items-center mb-3">
                        <input
                          type="text"
                          value={m.title}
                          className="flex-1 bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md p-2 font-semibold"
                          placeholder="マイルストーン名"
                          onChange={e => handleMilestoneTitleChange(i, e.target.value)}
                        />
                        {showStep2Errors && (!m.title || !m.title.trim()) && (
                          <span className="text-xs text-red-500 ml-2">必須</span>
                        )}
                        <button
                          className="remove-milestone-btn ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                          onClick={() => handleRemoveMilestone(i)}
                        >
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {/* Milestone Details */}
                      <div className="space-y-2 ml-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">成果物</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="例：ワイヤーフレーム、デザインカンプ"
                            value={m.deliverables || ''}
                            onChange={e => handleMilestoneFieldChange(i, 'deliverables', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">受入基準</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="例：デザインカンプの承認、プロトタイプでの操作感検証"
                            value={m.acceptanceCriteria || ''}
                            onChange={e => handleMilestoneFieldChange(i, 'acceptanceCriteria', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">追加作業条件</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="例：修正は2回まで無料"
                            value={m.additionalWorkTerms || ''}
                            onChange={e => handleMilestoneFieldChange(i, 'additionalWorkTerms', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {showStep2Errors && !milestonesValid && (
                    <p className="text-xs text-red-500 mt-2">マイルストーン名を入力してください</p>
                  )}
                  <button className="w-full text-sm text-slate-500 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors" onClick={handleAddMilestone}>+ マイルストーンを追加</button>
                </>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700 mb-4">このプロジェクトの初期ステータスを選択してください</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50" style={{ borderColor: initialStatus === 'recruiting' ? '#4f46e5' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="status"
                    value="recruiting"
                    checked={initialStatus === 'recruiting'}
                    onChange={(e) => setInitialStatus(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">募集中（応募受付）</p>
                    <p className="text-xs text-slate-600">應募者からの提案を受け付けます。後で採用者を選択できます。</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-green-50" style={{ borderColor: initialStatus === 'inprogress' ? '#16a34a' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="status"
                    value="inprogress"
                    checked={initialStatus === 'inprogress'}
                    onChange={(e) => setInitialStatus(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">進行中（契約者確定）</p>
                    <p className="text-xs text-slate-600">既に契約者が決まっている場合、直接プロジェクトを開始できます。</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
        <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
          <button onClick={onClose} className="bg-white border border-slate-300 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50">キャンセル</button>
          {step === 1 && (
            <button onClick={handleNextStep} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700">マイルストーン設定へ &rarr;</button>
          )}
          {step === 2 && (
            <button onClick={() => setStep(3)} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700" disabled={!milestonesValid}>初期ステータスを選択へ &rarr;</button>
          )}
          {step === 3 && (
            <button onClick={handleConfirm} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700">登録して確定</button>
          )}
        </div>
      </div>
    </div>
  );
}
