import React from 'react';
import { AlertOctagon, HelpCircle } from 'lucide-react';
import StarRatingDisplay from '../common/StarRatingDisplay';

const ReviewItem = ({ review, lang, t }) => {
  return (
    <div className="py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700">
          {review.clientName ||
            (lang === 'ja' ? '匿名ユーザー' : 'Anonymous User')}
        </span>
        <span className="text-xs text-gray-500">{review.date}</span>
      </div>
      <StarRatingDisplay
        score={review.rating}
        size="sm"
        lang={lang}
        totalReviews={undefined}
        t={t}
      />
      <p className="text-xs text-gray-600 mt-1.5">{review.comment}</p>
      {review.contractorResponse && (
        <div className="mt-2 ml-4 pl-3 border-l-2 border-gray-200">
          <p className="text-xs text-gray-500 font-semibold mb-0.5">
            {t.contractorResponseLabel ||
              (lang === 'ja' ? '受注者の返信:' : 'Contractor Response:')}
          </p>
          <p className="text-xs text-gray-600">{review.contractorResponse}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;