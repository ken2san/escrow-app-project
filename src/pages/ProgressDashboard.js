import React from 'react';
import { getPendingApplicationJobsForUser, loggedInUserDataGlobal } from '../utils/initialData';

// 進行状況ダッシュボード（全案件の進捗・重要通知を俯瞰）
export default function ProgressDashboard() {
  const jobs = getPendingApplicationJobsForUser(loggedInUserDataGlobal.id);
  const accepted = jobs.filter(j => j.status === 'accepted').length;
  const pending = jobs.filter(j => j.status === 'pending').length;
  const rejected = jobs.filter(j => j.status === 'rejected').length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">進行状況ダッシュボード</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatusCard label="進行中" count={accepted} color="emerald" />
        <StatusCard label="応募中" count={pending} color="yellow" />
        <StatusCard label="不採用" count={rejected} color="rose" />
      </div>
      {/* 重要通知エリア（例: 納期迫る、未読メッセージ等） */}
      <div className="mb-6">
        <ImportantNotice />
      </div>
      {/* 案件ごとの進捗リスト */}
      <div>
        <h2 className="text-lg font-semibold mb-2">案件ごとの進捗</h2>
        <ul className="space-y-3">
          {jobs.map(job => (
            <li key={job.jobId} className="bg-white rounded shadow p-4 flex items-center gap-4">
              <span className="font-bold text-slate-800">{job.jobId}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${statusColor(job.status)}-100 text-${statusColor(job.status)}-700`}>
                {statusLabel(job.status)}
              </span>
              <span className="text-xs text-slate-500 ml-2">{job.history?.slice(-1)[0]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatusCard({ label, count, color }) {
  return (
    <div className={`bg-${color}-100 rounded-lg p-6 text-center`}>
      <div className={`text-3xl font-bold text-${color}-700`}>{count}</div>
      <div className={`text-${color}-700 text-sm font-semibold`}>{label}</div>
    </div>
  );
}

function statusLabel(status) {
  if (status === 'accepted') return '進行中';
  if (status === 'pending') return '応募中';
  if (status === 'rejected') return '不採用';
  return status;
}
function statusColor(status) {
  if (status === 'accepted') return 'emerald';
  if (status === 'pending') return 'yellow';
  if (status === 'rejected') return 'rose';
  return 'slate';
}

function ImportantNotice() {
  // デモ: 納期迫る通知
  return (
    <div className="bg-orange-100 border-l-4 border-orange-400 text-orange-800 p-4 rounded mb-2">
      <span className="font-bold">納期が近い案件があります！</span> 2日以内に対応が必要です。
    </div>
  );
}
