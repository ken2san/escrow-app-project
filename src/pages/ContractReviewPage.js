import React, { useState } from 'react';
import { FileSignature, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  dashboardAllProjects,
  updateApplicationJobStatus,
  loggedInUserDataGlobal,
  updateMilestoneApproval,
  getMilestoneApprovalSummary,
  areAllMilestonesApproved
} from '../utils/initialData';

const ContractReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [isContractFinalized, setIsContractFinalized] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(null); // 'accept' or 'reject'
  const [milestoneApprovals, setMilestoneApprovals] = useState({}); // Track individual milestone approval states

  // Get project from dashboardAllProjects
  const selectedProjectForReview = dashboardAllProjects.find(p => p.id === projectId);

  if (!selectedProjectForReview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl text-gray-400 mb-4">🚫</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">
          案件情報が見つかりません
        </div>
        <div className="text-gray-500 mb-6">
          このページは直接アクセスできません。Work Managementから案件を選択してください。
        </div>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          onClick={() => navigate('/work-management')}
        >
          Work Managementに戻る
        </button>
      </div>
    );
  }

  const handleApproveMilestone = (milestoneId) => {
    // Update milestone approval in data layer
    updateMilestoneApproval(projectId, milestoneId, 'approved');

    // Update local state
    setMilestoneApprovals(prev => ({
      ...prev,
      [milestoneId]: 'approved'
    }));
  };

  const handleAcceptContract = () => {
    // Check if all milestones are approved
    if (!areAllMilestonesApproved(projectId)) {
      alert('全てのマイルストーンを承認してください。');
      return;
    }

    // Update application status to accepted
    updateApplicationJobStatus(projectId, 'accepted', loggedInUserDataGlobal.id);

    // Dispatch event to refresh WorkManagementPage
    window.dispatchEvent(new CustomEvent('contractStatusUpdated', {
      detail: { jobId: projectId, status: 'accepted' }
    }));

    setIsContractFinalized(true);
  };

  const handleRejectContract = () => {
    // Update application status to rejected
    updateApplicationJobStatus(projectId, 'rejected', loggedInUserDataGlobal.id);

    // Dispatch event to refresh WorkManagementPage
    window.dispatchEvent(new CustomEvent('contractStatusUpdated', {
      detail: { jobId: projectId, status: 'rejected' }
    }));

    navigate('/work-management');
  };

  const openConfirmDialog = (type) => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    if (actionType === 'accept') {
      handleAcceptContract();
    } else if (actionType === 'reject') {
      handleRejectContract();
    }
  };

  if (isContractFinalized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <CheckCircle size={48} className="text-green-500 mb-4" />
        <div className="text-2xl font-bold text-gray-800 mb-2">
          契約を承認しました
        </div>
        <div className="text-gray-600 mb-6">
          契約内容が確定しました。Work Managementの進行中タブで作業を開始できます。
        </div>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          onClick={() => navigate('/work-management')}
        >
          Work Managementに戻る
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <FileSignature size={28} className="mr-3 text-indigo-600" />
          契約内容の確認
        </h2>
        <div className="space-y-6 text-sm">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">
              {selectedProjectForReview.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <p>
                <span className="font-semibold">クライアント:</span>{' '}
                {selectedProjectForReview.clientName}
              </p>
              <p>
                <span className="font-semibold">総額:</span> {selectedProjectForReview.totalAmount.toLocaleString('ja-JP')} pt
              </p>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              プロジェクト概要
            </h4>
            <p className="text-gray-600 whitespace-pre-line text-xs">
              {selectedProjectForReview.description}
            </p>
          </div>

        {/* Deliverables */}
        {selectedProjectForReview.deliverables && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="text-md font-semibold text-blue-900 mb-2 flex items-center">
              📦 納品物
            </h4>
            <p className="text-gray-700 text-xs font-medium mb-1">
              {selectedProjectForReview.deliverables}
            </p>
            {selectedProjectForReview.deliverableDetails && (
              <p className="text-gray-600 text-xs mt-2">
                {selectedProjectForReview.deliverableDetails}
              </p>
            )}
          </div>
        )}

        {/* Acceptance Criteria */}
        {selectedProjectForReview.acceptanceCriteria && (
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="text-md font-semibold text-green-900 mb-2 flex items-center">
              ✅ 検収基準
            </h4>
            <p className="text-gray-700 text-xs font-medium mb-1">
              {selectedProjectForReview.acceptanceCriteria}
            </p>
            {selectedProjectForReview.acceptanceCriteriaDetails && (
              <p className="text-gray-600 text-xs mt-2">
                {selectedProjectForReview.acceptanceCriteriaDetails}
              </p>
            )}
          </div>
        )}

        {/* Scope of Work */}
        {(selectedProjectForReview.scopeOfWork_included || selectedProjectForReview.scopeOfWork_excluded) && (
          <div className="p-4 border rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3">
              📋 作業範囲
            </h4>
            {selectedProjectForReview.scopeOfWork_included && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-green-700 mb-1">✓ 含まれる作業:</p>
                <p className="text-gray-700 text-xs">
                  {selectedProjectForReview.scopeOfWork_included}
                </p>
              </div>
            )}
            {selectedProjectForReview.scopeOfWork_excluded && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">✗ 含まれない作業:</p>
                <p className="text-gray-700 text-xs">
                  {selectedProjectForReview.scopeOfWork_excluded}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Work Terms */}
        {selectedProjectForReview.additionalWorkTerms && (
          <div className="p-4 border rounded-lg bg-amber-50">
            <h4 className="text-md font-semibold text-amber-900 mb-2 flex items-center">
              💡 追加作業条件
            </h4>
            <p className="text-gray-700 text-xs">
              {selectedProjectForReview.additionalWorkTerms}
            </p>
          </div>
        )}

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-700">
              マイルストーン個別承認
            </h4>
            {selectedProjectForReview.milestones?.length > 0 && (() => {
              const summary = getMilestoneApprovalSummary(projectId);
              return (
                <div className="text-xs">
                  <span className={`font-semibold ${
                    summary.allApproved ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {summary.approved}/{summary.total} 承認済み
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({summary.approvedAmount.toLocaleString('ja-JP')}/{summary.totalAmount.toLocaleString('ja-JP')} pt)
                  </span>
                </div>
              );
            })()}
          </div>
          {selectedProjectForReview.milestones?.length > 0 ? (
            <ul className="space-y-3">
              {selectedProjectForReview.milestones.map((ms) => {
                const approvalStatus = ms.approvalStatus || milestoneApprovals[ms.id] || 'pending';
                const isApproved = approvalStatus === 'approved';

                return (
                  <li
                    key={ms.id}
                    className={`p-3 border rounded-lg ${
                      isApproved ? 'bg-green-50 border-green-300' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {ms.name}
                          </p>
                          {isApproved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              承認済み
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          期日: {ms.dueDate}
                        </p>
                        {ms.description && (
                          <p className="text-xs text-gray-600 mb-2">{ms.description}</p>
                        )}
                        <p className="text-sm font-semibold text-indigo-600">
                          {Number(ms.amount).toLocaleString('ja-JP')} pt
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {!isApproved ? (
                          <>
                            <button
                              onClick={() => handleApproveMilestone(ms.id)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 whitespace-nowrap flex items-center"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              承認
                            </button>
                            <button
                              className="px-3 py-1.5 border border-amber-300 text-amber-700 rounded text-xs font-medium hover:bg-amber-50 whitespace-nowrap flex items-center"
                              disabled
                              title="交渉機能は次のタスクで実装予定"
                            >
                              <MessageSquare size={14} className="mr-1" />
                              交渉
                            </button>
                          </>
                        ) : (
                          <div className="text-xs text-green-600 font-medium flex items-center">
                            <CheckCircle size={14} className="mr-1" />
                            承認済み
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-xs">マイルストーンが設定されていません</p>
          )}
        </div>
        <div className="p-4 border rounded-lg text-xs text-gray-500">
          <p>
            上記内容およびプラットフォーム利用規約に同意の上、契約を承認します。
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={() => navigate('/work-management')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← 保留して戻る
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openConfirmDialog('reject')}
              className="px-6 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 flex items-center justify-center"
            >
              <XCircle size={18} className="mr-2" />
              辞退する
            </button>
            <button
              onClick={() => openConfirmDialog('accept')}
              disabled={!areAllMilestonesApproved(projectId)}
              className={`px-6 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center ${
                areAllMilestonesApproved(projectId)
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle size={18} className="mr-2" />
              契約を承認する
              {!areAllMilestonesApproved(projectId) && (
                <span className="ml-2 text-xs">(全承認が必要)</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Confirmation Dialog */}
    {showConfirmDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {actionType === 'accept' ? '契約を承認しますか？' : '契約を辞退しますか？'}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {actionType === 'accept'
              ? 'この操作により、契約が確定し作業を開始できます。'
              : 'この操作により、この案件への応募が取り下げられます。'}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                actionType === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionType === 'accept' ? '承認する' : '辞退する'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default ContractReviewPage;