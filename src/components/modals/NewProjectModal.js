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
  const [tempProject, setTempProject] = useState({ name: '', client: '', totalBudget: '', deadline: '', duration: '', description: '' });
  const [milestones, setMilestones] = useState([]);

  if (!open) return null;

  const handleNextStep = () => {
    setStep(2);
    setAiGenerating(true);
    setTimeout(() => {
      setMilestones(initialMilestoneTitles.map(title => ({ title })));
      setAiGenerating(false);
    }, 1000);
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

  const handleConfirm = () => {
    const newProject = {
      id: nextProjectId,
      name: tempProject.name,
      client: tempProject.client,
      totalBudget: parseInt(tempProject.totalBudget) || 0,
      deadline: tempProject.deadline,
      duration: tempProject.duration,
      description: tempProject.description,
      cards: milestones.map((m, i) => ({
        id: nextCardId + i,
        projectId: nextProjectId,
        title: m.title,
        description: '',
        reward: 0,
        status: 'unsent',
      })),
    };
    onConfirm(newProject);
    setStep(1);
    setMilestones([]);
    setTempProject({ name: '', client: '', totalBudget: '', deadline: '', duration: '', description: '' });
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
                <label className="block text-sm font-medium text-slate-700">期日</label>
                <input type="date" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.deadline} onChange={e => setTempProject({ ...tempProject, deadline: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">期間（日数）</label>
                <input type="number" min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={tempProject.duration} onChange={e => setTempProject({ ...tempProject, duration: e.target.value })} />
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
          <button onClick={onClose} className="bg-white border border-slate-300 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50">キャンセル</button>
          {step === 1 && (
            <button onClick={handleNextStep} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700">マイルストーン設定へ &rarr;</button>
          )}
          {step === 2 && (
            <button onClick={handleConfirm} className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700" disabled={milestones.length === 0}>登録して確定</button>
          )}
        </div>
      </div>
    </div>
  );
}
