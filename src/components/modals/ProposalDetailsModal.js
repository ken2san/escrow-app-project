import React from 'react';
import { X, CheckCircle, ShieldCheck, Award } from 'lucide-react';
import StarRatingDisplay from '../common/StarRatingDisplay';

const ProposalDetailsModal = ({ isOpen, onClose, proposal, lang, t, onSelectProposal }) => {
  if (!isOpen || !proposal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {t('proposalDetailsModalTitle') || 'Proposal Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700">
              {proposal.contractorName}
            </h4>
            {proposal.contractorReputation && (
              <div className="my-1">
                <StarRatingDisplay
                  score={proposal.contractorReputation.averageScore}
                  totalReviews={proposal.contractorReputation.totalReviews}
                  size="sm"
                  lang={lang}
                  t={t}
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              {t('submissionDate')}: {proposal.submissionDate}
            </p>
          </div>
          <div className="space-y-1">
            {proposal.contractorReputation?.identityVerified && (
              <div className="flex items-center text-xs text-green-600">
                <ShieldCheck size={14} className="mr-1.5" />{' '}
                {t('identityVerified')}
              </div>
            )}
            {proposal.contractorReputation?.skillsCertified &&
              proposal.contractorReputation.skillsCertified.length > 0 && (
                <div className="flex items-center text-xs text-blue-600">
                  <Award size={14} className="mr-1.5" /> {t('skillsCertified')}:
                  {proposal.contractorReputation.skillsCertified.join(', ')}
                </div>
              )}
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-semibold text-gray-700 mb-1">
              {t('proposalMessage')}:
            </p>
            <p className="text-gray-600 whitespace-pre-wrap text-xs">
              {proposal.proposalText}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700">{t('proposedAmount')}:</p>
              <p className="text-gray-600">
                ¥{Number(proposal.proposedAmount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {t('estimatedDeliveryTime')}:
              </p>
              <p className="text-gray-600">
                {proposal.estimatedDeliveryTime || 'N/A'}
              </p>
            </div>
          </div>
          {proposal.contractorResellingRisk > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-md text-xs">
              <p className="font-semibold text-yellow-800">
                {t('resellingAlertTitle')}
              </p>
              <p className="text-yellow-700">
                {(t('resellingAlertMessage') || '')
                  .replace('{contractorName}', proposal.contractorName || '')
                  .replace('{percentage}', proposal.contractorResellingRisk || '')}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectProposal(proposal);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
          >
            <CheckCircle size={16} className="mr-2" />
            {t('selectThisProposal')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailsModal;