import React, { useState } from 'react';
import { FileSignature, CheckCircle } from 'lucide-react';

const ContractReviewPage = ({ selectedProjectForReview, t, setActivePage, handleFinalizeContract, currentLanguage, handleCancelProposalSelection, setActiveProjectDetailTab }) => {

  const [isContractFinalized, setIsContractFinalized] = useState(false);

  if (!selectedProjectForReview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl text-gray-400 mb-4">🚫</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">
          {currentLanguage === 'ja' ? '案件情報が見つかりません' : 'Project information not found'}
        </div>
        <div className="text-gray-500 mb-6">
          {currentLanguage === 'ja'
            ? 'このページは直接アクセスできません。ダッシュボードから案件を選択してください。'
            : 'This page cannot be accessed directly. Please select a project from the dashboard.'}
        </div>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          onClick={() => setActivePage('dashboard')}
        >
          {currentLanguage === 'ja' ? 'ダッシュボードに戻る' : 'Return to Dashboard'}
        </button>
      </div>
    );
  }
  const selectedProposal = selectedProjectForReview.proposals?.find(
    (p) => p.status === 'accepted'
  );

  if (isContractFinalized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <CheckCircle size={48} className="text-green-500 mb-4" />
        <div className="text-2xl font-bold text-gray-800 mb-2">
          {currentLanguage === 'ja' ? '契約が締結されました' : 'Contract Finalized'}
        </div>
        <div className="text-gray-600 mb-6">
          {currentLanguage === 'ja'
            ? '契約内容が確定しました。ダッシュボードから進行状況をご確認ください。'
            : 'The contract has been finalized. You can check the progress from the dashboard.'}
        </div>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          onClick={() => setActivePage('dashboard')}
        >
          {currentLanguage === 'ja' ? 'ダッシュボードに戻る' : 'Return to Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <FileSignature size={28} className="mr-3 text-indigo-600" />
        {t.contractReviewTitle}
      </h2>
      <div className="space-y-6 text-sm">
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">
            {selectedProjectForReview.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <p>
              <span className="font-semibold">{t.client}:</span>{' '}
              {selectedProjectForReview.clientName}
            </p>
            {selectedProjectForReview.contractorName && (
              <p>
                <span className="font-semibold">{t.contractor}:</span>{' '}
                {selectedProjectForReview.contractorName}
              </p>
            )}
            <p>
              <span className="font-semibold">{t.totalAmount}:</span> ¥
              {(
                selectedProposal?.proposedAmount ||
                selectedProjectForReview.totalAmount
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">{t.dueDate}:</span>{' '}
              {selectedProjectForReview.dueDate}
            </p>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-2">
            {t.projectOverviewDetails}
          </h4>
          <p className="text-gray-600 whitespace-pre-line text-xs">
            {selectedProjectForReview.description}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="text-md font-semibold text-gray-700 mb-2">
            {t.milestoneList}
          </h4>
          {selectedProjectForReview.milestones?.length > 0 ? (
            <ul className="space-y-2">
              {selectedProjectForReview.milestones.map((ms) => (
                <li
                  key={ms.id}
                  className="p-2 border-b last:border-b-0 text-xs"
                >
                  <p className="font-semibold">
                    {ms.name}{' '}
                    <span className="text-gray-500 font-normal">
                      ({t.dueDate}: {ms.dueDate})
                    </span>
                  </p>
                  {ms.description && (
                    <p className="text-gray-600">{ms.description}</p>
                  )}
                  <p className="text-indigo-600 font-semibold">
                    ¥{Number(ms.amount).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-xs">{t.milestonesNotSet}</p>
          )}
        </div>
        <div className="p-4 border rounded-lg text-xs text-gray-500">
          <p>
            {currentLanguage === 'ja'
              ? '上記内容およびプラットフォーム利用規約（別途提示）に同意の上、契約を締結します。'
              : 'By agreeing to the above terms and the platform terms of service (provided separately), you finalize this contract.'}
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => {
              if (selectedProjectForReview) {
                handleCancelProposalSelection(selectedProjectForReview);
                setActiveProjectDetailTab('proposals');
              }
              setActivePage('dashboard');
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('cancelAndReturnToProposals')}
          </button>
          <button
            onClick={() => {
              handleFinalizeContract(selectedProjectForReview.id);
              setIsContractFinalized(true);
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <CheckCircle size={18} className="mr-2" />
            {t('agreeAndFinalizeContract')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractReviewPage;