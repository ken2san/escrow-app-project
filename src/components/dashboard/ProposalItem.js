import React from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import StarRatingDisplay from '../common/StarRatingDisplay';

const ProposalItem = ({ proposal, lang, t, isAnyProposalSelectedOnProject, onViewDetails }) => {
  return (
    <div
      className={`bg-white p-4 rounded-md shadow hover:shadow-lg transition-shadow border ${
        proposal.status === 'accepted'
          ? 'border-green-500 ring-2 ring-green-300'
          : 'border-gray-200'
      } ${proposal.status === 'archived' ? 'opacity-60 bg-gray-50' : ''}`}
    >
    <div className="flex justify-between items-start">
      <div>
        <h5 className="text-md font-semibold text-indigo-700">
          {(lang === 'en' && proposal.contractorName_en) ? proposal.contractorName_en : proposal.contractorName}
        </h5>
        {proposal.contractorReputation && (
          <div className="mt-0.5 mb-1">
            <StarRatingDisplay
              score={proposal.contractorReputation.averageScore}
              totalReviews={proposal.contractorReputation.totalReviews}
              size="xs"
              lang={lang}
              t={t}
            />
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500">{proposal.submissionDate}</span>
    </div>
    <p
      className="text-xs text-gray-700 mt-1 h-12 overflow-hidden text-ellipsis"
      title={proposal.proposalText}
    >
      {proposal.proposalText.substring(0, 120)}
      {proposal.proposalText.length > 120 ? '...' : ''}
    </p>
    <div className="text-xs text-gray-600 mt-2">
      <span>{t('desiredAmount')}: {proposal.desiredAmount ? `¥${Number(proposal.desiredAmount).toLocaleString()}` : '-'}</span>
      {proposal.proposedAmount && (
        <span className="ml-2">| {t.proposedAmount}: ¥{Number(proposal.proposedAmount).toLocaleString()}</span>
      )}
      {proposal.estimatedDeliveryTime && (
        <span className="ml-2">| {t.estimatedDeliveryTime}: {proposal.estimatedDeliveryTime}</span>
      )}
    </div>
    <div className="mt-3 flex justify-end space-x-2">
      {proposal.status === 'pending_review' &&
        !isAnyProposalSelectedOnProject && (
          <button
            onClick={() => onViewDetails(proposal)}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
          >
            <Eye size={14} className="mr-1" />
            {t.viewProposalDetails}
          </button>
        )}
      {proposal.status === 'accepted' && (
        <span className="text-xs text-green-600 font-semibold flex items-center">
          <CheckCircle size={14} className="mr-1" />
          {t.proposalStatusSelected}
        </span>
      )}
      {proposal.status === 'archived' && (
        <span className="text-xs text-gray-500 font-semibold">
          {t.proposalStatusArchived}
        </span>
      )}
    </div>
    </div>
  );
};

export default ProposalItem;
