import React from 'react';
import { X, AlertTriangle, Coins } from 'lucide-react';

const DepositFundsModal = ({ isOpen, onClose, project, lang, t, onSubmitDeposit }) => {
  // 支払い方法選択は不要のため削除

  if (!isOpen || !project) return null;

  const handleDeposit = () => {
    onSubmitDeposit(project.id, project.totalAmount);
  };

  const showResellingAlert =
    project.contractorResellingRisk && project.contractorResellingRisk > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t.depositFundsTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <p>
            {t.projectName}:{' '}
            <span className="font-semibold">{project.name}</span>
          </p>
          <p>
            {t.contractor}:{' '}
            <span className="font-semibold">
              {project.contractorName || 'N/A'}
            </span>
          </p>
          <p>
            {t.amountToDeposit}:{' '}
            <span className="font-semibold text-yellow-600">
              {project.totalAmount.toLocaleString()} pt
            </span>
          </p>
          {showResellingAlert && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md my-3">
              <div className="flex items-start">
                <div className="text-yellow-500 mr-2 shrink-0 mt-0.5">
                  <AlertTriangle size={20} />
                </div>
                <div className="text-xs text-yellow-700">
                  <p className="font-semibold text-yellow-800">
                    {t.resellingAlertTitle}
                  </p>
                  <p>
                    {t.resellingAlertMessage
                      .replace(
                        '{contractorName}',
                        project.contractorName ||
                          (lang === 'ja' ? 'この受注者' : 'This contractor')
                      )
                      .replace('{percentage}', project.contractorResellingRisk)}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* 支払い方法選択UIは省略（ポイントのみ） */}
          <p className="text-xs text-gray-500 mt-2">
            （
            {lang === 'ja'
              ? '実際の決済処理は実装されていません。このモーダルはUIのデモンストレーションです。'
              : 'Actual payment processing is not implemented. This modal is for UI demonstration.'}
            ）
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleDeposit}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
          >
            <Coins size={16} className="mr-2" />
            {t.executeDeposit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositFundsModal;