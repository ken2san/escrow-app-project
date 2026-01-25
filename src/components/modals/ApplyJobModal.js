import React from 'react';

export default function ApplyJobModal({ isOpen, onClose, onSubmit, job, t }) {
  if (!isOpen) return null;

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
        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 py-2 rounded bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition"
            onClick={onClose}
          >
            {t ? t('cancel', 'キャンセル') : 'キャンセル'}
          </button>
          <button
            className="flex-1 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            onClick={() => onSubmit(job)}
          >
            {t ? t('apply', '応募する') : '応募する'}
          </button>
        </div>
      </div>
    </div>
  );
}
