import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDraftJobs, loggedInUserDataGlobal } from '../../utils/initialData';

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

  // Render immersive mode if requested
  if (immersive) {
    return (
      <ImmersiveJobsView
        jobs={filteredJobs}
        getScoreIcon={getScoreIcon}
        getCategoryBadgeStyle={getCategoryBadgeStyle}
        flagStyleFn={flagStyleFn}
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

// Immersive Jobs View Component
function ImmersiveJobsView({ jobs, getScoreIcon, getCategoryBadgeStyle, flagStyleFn, navigate, onExitImmersive }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState('');

  const currentJob = jobs[currentIndex];

  const handleApply = useCallback((job) => {
    addDraftJobs([job.id], loggedInUserDataGlobal.id);
    if (onExitImmersive) {
      onExitImmersive();
      setTimeout(() => {
        navigate('/work-management');
      }, 300);
    } else {
      navigate('/work-management');
    }
  }, [navigate, onExitImmersive]);

  const handleNext = useCallback(() => {
    if (currentIndex < jobs.length - 1) {
      setAnimationDirection('slide-up');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setAnimationDirection('');
      }, 150);
    }
  }, [currentIndex, jobs.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setAnimationDirection('slide-down');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setAnimationDirection('');
      }, 150);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!currentJob) return;
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleApply(currentJob);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, currentJob, handleNext, handlePrevious, handleApply]);

  if (!currentJob) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">全ての仕事を見ました！🎉</p>
          <button onClick={onExitImmersive} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
            戻る
          </button>
        </div>
      </div>
    );
  }

  const mScoreIcon = getScoreIcon(currentJob.mScore);
  const sScoreIcon = getScoreIcon(currentJob.sScore);
  const ambiguityIcon = getScoreIcon(currentJob.ambiguityScore);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 overflow-y-auto">
      {/* Back button */}
      <button onClick={onExitImmersive} className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white hover:shadow-xl transition font-semibold text-gray-700 flex items-center gap-2">
        ← 戻る
      </button>

      {/* Progress indicator */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-semibold text-gray-700">{currentIndex + 1} / {jobs.length}</span>
          <span className="text-xs text-gray-500 ml-2">あと {jobs.length - currentIndex - 1} 件</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-32">
        {/* AI Score */}
        <div className="mb-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-600 mb-2">AI マッチングスコア</div>
            <div className="inline-block bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl shadow-2xl p-8">
              <div className="text-8xl font-black text-white drop-shadow-lg">{currentJob.recommendationScore}</div>
            </div>
          </div>
        </div>

        {/* Job card */}
        <div className={`w-full max-w-2xl transition-all duration-300 ${animationDirection === 'slide-up' ? 'translate-y-full opacity-0' : animationDirection === 'slide-down' ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-2xl font-bold text-slate-900">{currentJob.title}</h3>
                    {currentJob.category && <span className={getCategoryBadgeStyle(currentJob.category)}>{currentJob.category}</span>}
                  </div>
                  <p className="text-sm text-slate-600">{currentJob.client || 'クライアント名'}</p>
                </div>
                <span className={flagStyleFn(currentJob)}>
                  {currentJob.recommendationFlag === 'green' ? '✓ おすすめ' : currentJob.recommendationFlag === 'red' ? '⚠️ 要注意' : '⚡ 確認推奨'}
                </span>
              </div>

              {/* Description */}
              {currentJob.description && <p className="text-sm text-slate-700">{currentJob.description}</p>}

              {/* Score Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full ${mScoreIcon.bg} flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-2xl font-bold ${mScoreIcon.text}`}>{currentJob.mScore}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">信頼度</p>
                </div>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full ${sScoreIcon.bg} flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-2xl font-bold ${sScoreIcon.text}`}>{currentJob.sScore}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">安全性</p>
                </div>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full ${ambiguityIcon.bg} flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-2xl font-bold ${ambiguityIcon.text}`}>{currentJob.ambiguityScore}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">明確性</p>
                </div>
              </div>

              {/* Budget & Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600">報酬</p>
                  <p className="text-xl font-bold text-slate-900">¥{currentJob.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">期間目安</p>
                  <p className="text-xl font-bold text-slate-900">{currentJob.duration || '未指定'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <button onClick={() => handleApply(currentJob)} className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300">
            ✓ このお仕事を見る (Enter)
          </button>
          <button onClick={handleNext} className="px-8 py-4 bg-gray-200 text-gray-700 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
            → スキップ
          </button>
        </div>

        {/* Navigation hints */}
        <div className="mt-8 flex gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white rounded shadow">↑↓</kbd>
            <span>前後</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white rounded shadow">Enter</kbd>
            <span>詳細</span>
          </div>
        </div>
      </div>
    </div>
  );
}
