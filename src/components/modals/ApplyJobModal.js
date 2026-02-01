import React, { useState } from 'react';

export default function ApplyJobModal({ isOpen, onClose, onSubmit, job, t }) {
  // Stage 1: Automatically track appliedAt timestamp
  const [appliedAt] = useState(() => new Date().toISOString());

  // Stage 2: Allow user to input custom deadline
  const [customDeadline, setCustomDeadline] = useState('');

  // Calculate default deadline (7 days from now)
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Pass both appliedAt and custom deadline to the handler
    const deadline = customDeadline || getDefaultDeadline();
    const deadlineISO = new Date(deadline).toISOString();
    onSubmit(job, appliedAt, deadlineISO);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
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

        {/* Stage 2: Deadline input field */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            応募期限（デフォルト: 7日後）
          </label>
          <input
            type="date"
            value={customDeadline}
            onChange={(e) => setCustomDeadline(e.target.value)}
            min={getDefaultDeadline()}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">
            最小期限: {new Date(getDefaultDeadline()).toLocaleDateString('ja-JP')}
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
