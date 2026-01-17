import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDraftJobs, loggedInUserDataGlobal } from '../../utils/initialData';
import ImmersiveJobCard from './ImmersiveJobCard';

export default function TimelineJobsView({ filteredJobs, immersive = false, onExitImmersive = null }) {
  const navigate = useNavigate();

  const getScoreIcon = (score) => {
    if (score >= 75) return { bg: 'bg-emerald-500', text: 'text-white' };
    if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-white' };
    return { bg: 'bg-red-500', text: 'text-white' };
  };

  const getCategoryBadgeStyle = (category) => {
    const base = 'px-2 py-0.5 text-xs font-semibold rounded-full border';
    switch (category) {
      case '飲食':
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
      case '物流':
        return `${base} bg-indigo-50 text-indigo-700 border-indigo-200`;
      case '小売':
        return `${base} bg-orange-50 text-orange-700 border-orange-200`;
      default:
        return `${base} bg-slate-100 text-slate-700 border-slate-200`;
    }
  };

  const getFlagStyle = () => {
    const base = 'px-3 py-1 rounded-full font-bold text-sm';
    return (job) => {
      if (job.recommendationFlag === 'green') {
        return `${base} bg-emerald-100 text-emerald-700`;
      } else if (job.recommendationFlag === 'red') {
        return `${base} bg-red-100 text-red-700`;
      } else {
        return `${base} bg-yellow-100 text-yellow-700`;
      }
    };
  };

  const flagStyleFn = getFlagStyle();

  if (filteredJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-slate-500 text-lg">
          条件に合う仕事がありません
        </p>
      </div>
    );
  }

  // Render immersive mode if requested (mobile only)
  if (immersive) {
    return (
      <ImmersiveJobsView
        jobs={filteredJobs}
        navigate={navigate}
        onExitImmersive={onExitImmersive}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-slate-600 text-sm">{filteredJobs.length} 件の仕事</p>
      </div>

      <div className="space-y-6">
        {filteredJobs.map(job => (
          <TimelineJobCard key={job.id} job={job} flagStyleFn={flagStyleFn} getCategoryBadgeStyle={getCategoryBadgeStyle} getScoreIcon={getScoreIcon} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function TimelineJobCard({ job, flagStyleFn, getCategoryBadgeStyle, getScoreIcon, navigate }) {
  const mScoreIcon = getScoreIcon(job.mScore);
  const sScoreIcon = getScoreIcon(job.sScore);
  const ambiguityIcon = getScoreIcon(job.ambiguityScore);
  const recommendationIcon = getScoreIcon(job.recommendationScore);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden border-l-4 border-indigo-500">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
              {job.category && (
                <span className={getCategoryBadgeStyle(job.category)}>
                  {job.category}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">{job.client || 'クライアント名'}</p>
          </div>
          <span className={flagStyleFn(job)}>
            {job.recommendationFlag === 'green' ? '✓ おすすめ' :
             job.recommendationFlag === 'red' ? '⚠️ 要注意' :
             '⚡ 確認推奨'}
          </span>
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-sm text-slate-700">
            {job.description}
          </p>
        )}

        {/* Score Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${mScoreIcon.bg} flex items-center justify-center mx-auto mb-2`}>
              <span className={`text-2xl font-bold ${mScoreIcon.text}`}>{job.mScore}</span>
            </div>
            <p className="text-xs font-medium text-slate-700">信頼度</p>
          </div>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${sScoreIcon.bg} flex items-center justify-center mx-auto mb-2`}>
              <span className={`text-2xl font-bold ${sScoreIcon.text}`}>{job.sScore}</span>
            </div>
            <p className="text-xs font-medium text-slate-700">安全性</p>
          </div>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${ambiguityIcon.bg} flex items-center justify-center mx-auto mb-2`}>
              <span className={`text-2xl font-bold ${ambiguityIcon.text}`}>{job.ambiguityScore}</span>
            </div>
            <p className="text-xs font-medium text-slate-700">明確性</p>
          </div>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full ${recommendationIcon.bg} flex items-center justify-center mx-auto mb-2`}>
              <span className={`text-2xl font-bold ${recommendationIcon.text}`}>{job.recommendationScore}</span>
            </div>
            <p className="text-xs font-medium text-slate-700">AIスコア</p>
          </div>
        </div>

        {/* Budget & Details */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
          <div>
            <p className="text-xs text-slate-600">報酬</p>
            <p className="text-lg font-bold text-slate-900">¥{job.budget?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">期間目安</p>
            <p className="text-lg font-bold text-slate-900">{job.duration || '未指定'}</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addDraftJobs([job.id], loggedInUserDataGlobal.id);
            navigate('/work-management');
          }}
          className="w-full px-6 py-3 rounded-lg font-bold text-base transition whitespace-nowrap bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"
        >
          このお仕事を見る
        </button>
      </div>
    </div>
  );
}

// Immersive Jobs View Container Component
function ImmersiveJobsView({ jobs, navigate, onExitImmersive }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewCard, setIsNewCard] = useState(false);

  // Apply: navigate to Work Management
  const handleApply = useCallback((job) => {
    addDraftJobs([job.id], loggedInUserDataGlobal.id);
    navigate('/work-management');
  }, [navigate]);

  // Like/save: stay in immersive and go to next (looping)
  const handlePrev = useCallback(() => {
    setIsNewCard(true);
    setTimeout(() => setIsNewCard(false), 300);
    setCurrentIndex((prev) => (prev - 1 + jobs.length) % jobs.length);
  }, [jobs.length]);

  const handleSkip = useCallback(() => {
    setIsNewCard(true);
    setTimeout(() => setIsNewCard(false), 300);
    // Loop to the beginning when reaching the end
    setCurrentIndex((prev) => (prev + 1) % jobs.length);
  }, [jobs.length]);

  if (jobs.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">条件に合う仕事がありません</p>
          <button
            onClick={() => onExitImmersive?.()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const currentJob = currentIndex < jobs.length ? jobs[currentIndex] : null;
  const totalRemaining = Math.max(0, jobs.length - currentIndex - 1);

  if (!currentJob) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-2xl font-bold text-gray-800 mb-2">全ての仕事を見ました！</p>
          <p className="text-gray-600 mb-6">すべてチェック完了です。おめでとうございます！</p>
          <button
            onClick={() => onExitImmersive?.()}
            className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <ImmersiveJobCard
      job={currentJob}
      onApply={handleApply}
      onPrev={handlePrev}
      onSkip={handleSkip}
      onExit={onExitImmersive}
      totalRemaining={totalRemaining}
      currentIndex={currentIndex}
      totalJobs={jobs.length}
      maxScore={100}
      isNew={isNewCard}
    />
  );
}
