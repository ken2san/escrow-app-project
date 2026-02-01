import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingApplicationJobsForUser, getAvailableJobsForDiscovery, loggedInUserDataGlobal, updateApplicationJobStatus } from '../utils/initialData';

// Pending applications management page: list pending projects and their progress
export default function PendingApplicationsPage() {
  const navigate = useNavigate();
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  // Fetch pending applications data
  const [pendingApplications, setPendingApplications] = useState(() => getPendingApplicationJobsForUser(loggedInUserDataGlobal.id));
  const allJobs = useMemo(() => getAvailableJobsForDiscovery(), []);

  // Fetch details for pending application jobs
  const pendingJobs = pendingApplications
    .filter(app => app.status === 'pending')
    .map(app => {
      const job = allJobs.find(j => j.id === app.jobId);
      return job ? { ...job, applicationStatus: app.status, applicationHistory: app.history || [] } : null;
    })
    .filter(Boolean);

  // Demo: auto-change status after 5 seconds if there is a pending job
  useEffect(() => {
    if (pendingJobs.length > 0) {
      const timer = setTimeout(() => {
        // Randomly set accepted/rejected
        const newStatus = Math.random() > 0.5 ? 'accepted' : 'rejected';
        updateApplicationJobStatus(pendingJobs[0].id, newStatus, loggedInUserDataGlobal.id);
        setStatusMessage(newStatus === 'accepted' ? 'Congratulations! Your application was accepted.' : 'Sorry, your application was rejected.');
        setShowStatusToast(true);
        setPendingApplications(getPendingApplicationJobsForUser(loggedInUserDataGlobal.id));
        setTimeout(() => {
          setShowStatusToast(false);
          if (newStatus === 'accepted') {
            navigate('/work-management');
          }
        }, 2000);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pendingJobs.length, pendingJobs, navigate]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">応募中の案件管理</h1>
      {pendingJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          現在応募中の案件はありません。
        </div>
      ) : (
        <div className="space-y-6">
          {pendingJobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border-l-4 border-yellow-400">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">応募中</span>
                <span className="font-semibold text-lg text-slate-900">{job.title}</span>
              </div>
              <div className="text-slate-700 text-sm mb-2">{job.description?.substring(0, 60)}{job.description?.length > 60 ? '...' : ''}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                <div><span className="font-bold">クライアント:</span> {job.clientName || '（デモ）株式会社サンプル'}</div>
                <div><span className="font-bold">報酬:</span> {job.reward ? `${job.reward}pt` : '未設定'}</div>
                <div><span className="font-bold">応募日時:</span> {job.appliedAt || '2026/01/25 12:00'}</div>
                <div><span className="font-bold">案件ID:</span> {job.id}</div>
              </div>
              {/* Progress bar and history */}
              <div className="flex items-center gap-2 mb-2">
                <ProgressBar status={job.applicationStatus} />
                <span className="text-xs text-slate-500">クライアント確認中</span>
              </div>
              {job.applicationHistory && job.applicationHistory.length > 0 && (
                <div className="bg-slate-50 rounded p-2 text-xs text-slate-700 border-l-4 border-yellow-300">
                  <div className="font-bold mb-1 text-yellow-700">応募履歴</div>
                  <ul className="list-disc pl-5">
                    {job.applicationHistory.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showStatusToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg text-base font-bold animate-fadeIn">
          {statusMessage}
        </div>
      )}
    </div>
  );
}

// Pending application progress bar component
function ProgressBar({ status }) {
  // Extend when more statuses are added in the future
  const steps = [
    { key: 'pending', label: '応募受付' },
    { key: 'accepted', label: '採用' },
    { key: 'rejected', label: '不採用' },
  ];
  const currentIdx = steps.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, idx) => (
        <div key={step.key} className={`w-20 h-2 rounded ${idx <= currentIdx ? 'bg-yellow-400' : 'bg-slate-200'}`}></div>
      ))}
    </div>
  );
}
