import React, { useState } from 'react';
import { MessageSquare, XCircle } from 'lucide-react';

const NegotiationModal = ({ isOpen, onClose, onSubmit, milestone, projectName }) => {
  const [proposedAmount, setProposedAmount] = useState(milestone?.amount || '');
  const [proposedDueDate, setProposedDueDate] = useState(milestone?.dueDate || '');
  const [reason, setReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('交渉理由を入力してください。');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    const negotiationData = {
      id: `neg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      proposedAmount: Number(proposedAmount),
      proposedDueDate,
      reason: reason.trim(),
      status: 'pending'
    };

    onSubmit(negotiationData);
    setShowConfirmDialog(false);
    onClose();

    // Reset form
    setProposedAmount(milestone?.amount || '');
    setProposedDueDate(milestone?.dueDate || '');
    setReason('');
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    onClose();

    // Reset form
    setProposedAmount(milestone?.amount || '');
    setProposedDueDate(milestone?.dueDate || '');
    setReason('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquare size={24} className="mr-2 text-amber-600" />
              マイルストーン条件の交渉
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>
          </div>

          {/* Project and Milestone Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">プロジェクト</p>
            <p className="font-semibold text-gray-800 mb-3">{projectName}</p>
            <p className="text-sm text-gray-600 mb-1">マイルストーン</p>
            <p className="font-semibold text-gray-800">{milestone?.name}</p>
          </div>

          {/* Current Conditions */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">現在の条件</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">金額</p>
                <p className="font-semibold text-gray-800">
                  {Number(milestone?.amount).toLocaleString('ja-JP')} pt
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">納期</p>
                <p className="font-semibold text-gray-800">{milestone?.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Proposed Conditions */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">提案する条件</h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提案金額 (pt) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="例: 150000"
                min="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提案納期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={proposedDueDate}
                onChange={(e) => setProposedDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交渉理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows="4"
                placeholder="条件変更を希望する理由を詳しく記入してください"
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/500 文字
              </p>
            </div>
          </div>

          {/* Notice */}
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              ⚠️ 交渉を送信すると、クライアントに通知されます。クライアントが承認するまでこのマイルストーンは「交渉中」状態になります。
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
            >
              交渉を送信
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              交渉を送信しますか？
            </h3>
            <div className="mb-4 text-sm text-gray-600">
              <p className="mb-2">以下の内容でクライアントに交渉を送信します：</p>
              <div className="p-3 bg-gray-50 rounded space-y-1">
                <p><span className="font-semibold">提案金額:</span> {Number(proposedAmount).toLocaleString('ja-JP')} pt</p>
                <p><span className="font-semibold">提案納期:</span> {proposedDueDate}</p>
                <p><span className="font-semibold">理由:</span> {reason}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NegotiationModal;
