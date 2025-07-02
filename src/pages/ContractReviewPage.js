import React, { useEffect } from 'react';
import { FileSignature, CheckCircle } from 'lucide-react';

const ContractReviewPage = ({ selectedProjectForReview, t, setActivePage, handleFinalizeContract, currentLanguage, handleCancelProposalSelection, setActiveProjectDetailTab }) => {
  useEffect(() => {
    if (!selectedProjectForReview) {
      setActivePage('dashboard');
    }
  }, [selectedProjectForReview, setActivePage]);

  if (!selectedProjectForReview) {
    return (
      <div className="p-6 text-center text-gray-500">
        {t.pageUnderConstructionDetail?.replace(
          '{placeholder}',
          'contract review (project not found)'
        ) ||
          (currentLanguage === 'ja'
            ? '案件情報が見つかりません。ダッシュボードに戻ります...'
            : 'Project information not found. Returning to dashboard...')}
      </div>
    );
  }
  const selectedProposal = selectedProjectForReview.proposals?.find(
    (p) => p.status === 'accepted'
  );

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
            {t.cancelAndReturnToProposals}
          </button>
          <button
            onClick={() => handleFinalizeContract(selectedProjectForReview.id)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <CheckCircle size={18} className="mr-2" />
            {t.agreeAndFinalizeContract}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractReviewPage;