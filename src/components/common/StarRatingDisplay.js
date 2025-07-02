import React from 'react';
import { Star } from 'lucide-react';

const StarRatingDisplay = ({ score, totalReviews, size = 'sm', lang, t }) => {
  if (score === null || score === undefined)
    return (
      <span
        className={`text-xs ${
          size === 'sm' ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {lang === 'ja' ? '評価なし' : 'No Rating'}
      </span>
    );
  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  const starSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const reviewText =
    lang === 'ja'
      ? totalReviews === 1
        ? '件のレビュー'
        : '件のレビュー'
      : totalReviews === 1
      ? ' review'
      : ' reviews';

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${starSizeClass} text-yellow-400 fill-yellow-400`}
        />
      ))}
      {halfStar && (
        <Star
          key="half"
          className={`${starSizeClass} text-yellow-400 fill-yellow-200`}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSizeClass} text-gray-300`} />
      ))}
      {totalReviews !== undefined && totalReviews > 0 && (
        <span
          className={`ml-1.5 text-xs ${
            size === 'sm' ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          ({score.toFixed(1)} / {totalReviews}
          {reviewText})
        </span>
      )}
      {totalReviews === 0 && (
        <span
          className={`ml-1.5 text-xs ${
            size === 'sm' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {lang === 'ja' ? '(まだレビューがありません)' : '(No reviews yet)'}
        </span>
      )}
    </div>
  );
};

export default StarRatingDisplay;
