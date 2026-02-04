
import React, { useState } from 'react';
import { getPendingApplicationJobsForUser, loggedInUserDataGlobal } from '../utils/initialData';

const STATUS_COLUMNS = [
  { key: 'pending', label: '応募中', color: 'yellow' },
  { key: 'offered', label: '採用提示中', color: 'blue' },
  { key: 'accepted', label: '進行中', color: 'emerald' },
  { key: 'rejected', label: '不採用', color: 'rose' },
];

export default function ProgressDashboard() {
  const [filter, setFilter] = useState('');
  const jobs = getPendingApplicationJobsForUser(loggedInUserDataGlobal.id);

  // サマリー
  const summary = STATUS_COLUMNS.map(col => ({
    ...col,
    count: jobs.filter(j => j.status === col.key).length,
  }));

  // フィルタ適用
  const filteredJobs = filter
    ? jobs.filter(j => (j.jobId + (j.title || '')).toLowerCase().includes(filter.toLowerCase()))
    : jobs;

  // 納期アラート（例: 2日以内の案件）
  const urgentJobs = filteredJobs.filter(j => {
    if (!j.responseDeadline) return false;
    const days = (new Date(j.responseDeadline) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 2 && days >= 0 && j.status !== 'rejected';
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">進行状況ダッシュボード</h1>
      {/* サマリー */}
      <div className="flex gap-4 mb-6">
        {summary.map(col => (
          <div key={col.key} className={`flex-1 bg-${col.color}-100 rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold text-${col.color}-700`}>{col.count}</div>
            <div className={`text-${col.color}-700 text-sm font-semibold`}>{col.label}</div>
          </div>
        ))}
      </div>
      {/* 納期アラート */}
      {urgentJobs.length > 0 && (
        <div className="bg-orange-100 border-l-4 border-orange-400 text-orange-800 p-4 rounded mb-4">
          <span className="font-bold">納期が近い案件があります！</span> 2日以内に対応が必要です。
        </div>
      )}
      {/* フィルタバー */}
      <div className="mb-4 flex items-center gap-2">
        <input
          className="border border-slate-300 rounded px-3 py-1 text-sm w-64"
          placeholder="案件ID・タイトルで検索"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <span className="text-xs text-slate-400">{filteredJobs.length}件表示</span>
      </div>
      {/* カンバン型UI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(col => (
          <div key={col.key} className="bg-slate-50 rounded-xl shadow p-3 min-h-[200px] flex flex-col">
            <div className={`font-bold mb-2 text-${col.color}-700`}>{col.label}</div>
            <div className="flex-1 flex flex-col gap-3">
              {filteredJobs.filter(j => j.status === col.key).length === 0 && (
                <div className="text-xs text-slate-400 text-center mt-6">案件なし</div>
              )}
              {filteredJobs.filter(j => j.status === col.key).map(job => (
                <JobCard key={job.jobId} job={job} color={col.color} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSampleTitle(job) {
  if (job.title && job.title !== job.jobId) return job.title;
  if (job.jobId === 'job1') return 'ロゴデザイン案件';
  if (job.jobId === 'job2') return 'Webサイト制作案件';
  if (job.jobId === 'job3') return 'LPリニューアル案件';
  return '案件名未設定';
}

function JobCard({ job, color }) {
  const title = getSampleTitle(job);
  return (
    <div className={`bg-white rounded-lg shadow p-3 flex flex-col gap-1 border-l-4 border-${color}-400`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold text-slate-800 text-sm">{title}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700`}>
          {statusLabel(job.status)}
        </span>
      </div>
      <div className="text-xs text-slate-400 truncate mb-1">{job.jobId}</div>
      {job.description && (
        <div className="text-xs text-slate-600 mb-1">{job.description}</div>
      )}
      {job.responseDeadline && (
        <div className="text-xs text-orange-600 mb-1">納期: {job.responseDeadline}</div>
      )}
      {job.history && job.history.length > 0 && (
        <div className="text-xs text-slate-400 mb-1">{job.history.slice(-1)[0]}</div>
      )}
      {/* アクション例 */}
      <div className="flex gap-2 mt-1">
        <button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border text-slate-600">詳細</button>
        {job.status === 'offered' && (
          <button className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 border">採用受諾</button>
        )}
        {job.status === 'pending' && (
          <button className="text-xs px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border">応募取消</button>
        )}
      </div>
    </div>
  );
}

function statusLabel(status) {
  if (status === 'accepted') return '進行中';
  if (status === 'pending') return '応募中';
  if (status === 'rejected') return '不採用';
  if (status === 'offered') return '採用提示中';
  return status;
}
