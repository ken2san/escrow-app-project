import React, { useState, useEffect } from 'react';

export default function ApplyJobModal({ isOpen, onClose, onSubmit, job, t }) {
  // Stage 1: Automatically track appliedAt timestamp
  const [appliedAt] = useState(() => new Date().toISOString());

  // Stage 2: Allow user to input custom deadline with default value
  const [customDeadline, setCustomDeadline] = useState('');

  // Stage 3: Milestone selection
  const [selectedMilestones, setSelectedMilestones] = useState([]);

  // Calculate default deadline (7 days from now)
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Get today's date
  const getTodayDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Set default deadline and milestones when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomDeadline(getDefaultDeadline());
      // Select all milestones by default
      if (job?.milestones && Array.isArray(job.milestones)) {
        setSelectedMilestones(job.milestones.map((_, idx) => idx));
      } else {
        setSelectedMilestones([]);
      }
    }
  }, [isOpen, job]);

  // Toggle milestone selection
  const toggleMilestone = (idx) => {
    setSelectedMilestones(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Pass appliedAt, deadline, and selected milestones to the handler
    const deadline = customDeadline || getDefaultDeadline();
    const deadlineISO = new Date(deadline).toISOString();
    onSubmit(job, appliedAt, deadlineISO, selectedMilestones);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fadeIn max-h-96 overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {t ? t('applyForJob', 'この仕事に応募しますか？') : 'この仕事に応募しますか？'}
        </h2>
        <div className="mb-4">
          <div className="font-semibold text-gray-700 mb-1">{job?.title}</div>
          <div className="text-sm text-gray-500 mb-2">{job?.client || 'クライアント名'}</div>
          <div className="text-sm text-gray-600">{job?.description?.substring(0, 80)}{job?.description?.length > 80 ? '...' : ''}</div>
        </div>

        {/* Stage 3: Milestone selection UI */}
        {job?.milestones && Array.isArray(job.milestones) && job.milestones.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              対応するマイルストーン（複数選択可）
            </label>
            <div className="space-y-2">
              {job.milestones.map((milestone, idx) => (
                <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={selectedMilestones.includes(idx)}
                    onChange={() => toggleMilestone(idx)}
                    className="mt-1 w-4 h-4 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{milestone.name || milestone.title}</div>
                    <div className="text-xs text-slate-600">¥{milestone.amount?.toLocaleString()}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Deadline input */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            応募期限（デフォルト: 7日後）
          </label>
          <input
            type="date"
            value={customDeadline}
            onChange={(e) => setCustomDeadline(e.target.value)}
            min={getTodayDate()}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            本日以降の日付を選択できます
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 py-2 rounded bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition"
            onClick={onClose}
          >
            {t ? t('cancel', 'キャンセル') : 'キャンセル'}
          </button>
          <button
            className="flex-1 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            onClick={handleSubmit}
          >
            {t ? t('apply', '応募する') : '応募する'}
          </button>
        </div>
      </div>
    </div>
  );
}
