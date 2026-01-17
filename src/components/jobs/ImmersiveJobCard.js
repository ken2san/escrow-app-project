import React, { useState, useEffect, useRef } from 'react';

export default function ImmersiveJobCard({
  job,
  onNext,
  onSkip,
  onExit,
  totalRemaining,
  maxScore = 100,
  currentIndex = 0,
  totalJobs = 0,
  isNew = false,
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [slideAnimation, setSlideAnimation] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const isSwipingRef = useRef(false);

  // Score count-up animation
  useEffect(() => {
    if (!job) return;
    let animationFrames = 0;
    let animationFrameId = null;
    const targetScore = job.recommendationScore;
    const duration = 30; // frames

    const animate = () => {
      animationFrames++;
      const progress = animationFrames / duration;
      const easeOutQuad = 1 - Math.pow(1 - progress, 2);
      setDisplayScore(Math.round(targetScore * easeOutQuad));

      if (animationFrames < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayScore(targetScore);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup animation on unmount or job change
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [job]);

  // Get gradient based on recommendation score
  const getScoreGradient = () => {
    const score = job.recommendationScore || 0;
    if (score >= 75) {
      return 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600';
    } else if (score >= 50) {
      return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600';
    } else {
      return 'bg-gradient-to-br from-red-400 via-red-500 to-red-600';
    }
  };

  // Get recommendation banner
  const getRecommendationBanner = () => {
    const flag = job.recommendationFlag;
    if (flag === 'green') {
      return { icon: '🎯', text: 'あなたにぴったり！', color: 'bg-emerald-100 text-emerald-900' };
    } else if (flag === 'red') {
      return { icon: '⚠️', text: '要注意 - よく確認', color: 'bg-red-100 text-red-900' };
    } else {
      return { icon: '💼', text: '見てみる価値あり', color: 'bg-blue-100 text-blue-900' };
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!touchStartPos) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    // Mark as swiping if horizontal movement is significant and dominant
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isSwipingRef.current = true;
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartPos || isAnimating) return;

    const touch = e.changedTouches[0];
    const dx = touchStartPos.x - touch.clientX;
    const dy = touchStartPos.y - touch.clientY;
    const isHorizontalSwipe = Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy);

    if (isHorizontalSwipe) {
      setIsAnimating(true);
      if (dx > 0) {
        // Swipe left: Skip job
        setSlideAnimation('slide-out-left');
        setTimeout(() => {
          onSkip?.();
          setSlideAnimation('');
          setIsAnimating(false);
        }, 300);
      } else {
        // Swipe right: Apply to job
        setSlideAnimation('slide-out-right');
        setTimeout(() => {
          onNext?.(job);
          setSlideAnimation('');
          setIsAnimating(false);
        }, 300);
      }
    }

    setTouchStartPos(null);
    // reset swiping flag shortly after touch end
    setTimeout(() => { isSwipingRef.current = false; }, 50);
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!job || isAnimating) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsAnimating(true);
        setSlideAnimation('slide-out-left');
        setTimeout(() => {
          onSkip?.();
          setSlideAnimation('');
          setIsAnimating(false);
        }, 300);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setIsAnimating(true);
        setSlideAnimation('slide-out-right');
        setTimeout(() => {
          onNext?.(job);
          setSlideAnimation('');
          setIsAnimating(false);
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [job, onNext, onSkip, isAnimating]);

  if (!job) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-2xl font-bold text-gray-800 mb-2">全ての仕事を見ました！</p>
          <p className="text-gray-600 mb-6">すべてチェック完了です。おめでとうございます！</p>
          <button
            onClick={onExit}
            className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const recommendationBanner = getRecommendationBanner();
  const scoreGradient = getScoreGradient();
  const mScoreColor =
    job.mScore >= 75 ? 'bg-emerald-500' : job.mScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const sScoreColor =
    job.sScore >= 75 ? 'bg-emerald-500' : job.sScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const ambiguityColor =
    job.ambiguityScore >= 75
      ? 'bg-emerald-500'
      : job.ambiguityScore >= 50
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={
        'fixed inset-0 z-50 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden flex flex-col items-center justify-center p-4'
      }
    >
      {/* Animated content wrapper: keep overlay visible; animate inner content only */}
      <div
        className={`w-full h-full transition-transform duration-300 ${
          slideAnimation === 'slide-out-left' ? 'translate-x-full' : ''
        } ${slideAnimation === 'slide-out-right' ? '-translate-x-full' : ''} ${
          isNew ? 'animate-slide-in' : ''
        }`}
      >
      {/* Header with progress */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between">
        <button
          onClick={onExit}
          className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold text-gray-700"
        >
          <span>←</span>
          <span className="text-sm">戻る</span>
        </button>
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-bold text-gray-800">
            {currentIndex + 1} / {totalJobs}
          </span>
          <span className="text-xs text-gray-600 ml-2">あと {totalRemaining} 件</span>
        </div>
      </div>

      {/* Main scrollable content */}
      <div className="w-full max-w-md mt-20 overflow-y-auto max-h-[80vh] pb-32">
        {/* AI Score - Large and prominent */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wider">
            🤖 AIマッチング度
          </p>
          <div className={`${scoreGradient} rounded-full w-40 h-40 mx-auto shadow-2xl flex items-center justify-center relative`}>
            {/* Glow effect */}
            <div className={`absolute inset-0 ${scoreGradient} rounded-full opacity-20 blur-2xl`}></div>
            {/* Score text */}
            <div className="relative z-10 text-center">
              <div className="text-7xl font-black text-white drop-shadow-lg">{displayScore}</div>
              <div className="text-sm font-semibold text-white/90 mt-1">/ {maxScore}</div>
            </div>
          </div>
        </div>

        {/* Recommendation Banner */}
        <div className={`${recommendationBanner.color} rounded-2xl p-4 mb-8 text-center shadow-lg`}>
          <div className="text-3xl mb-2">{recommendationBanner.icon}</div>
          <p className="text-lg font-bold">{recommendationBanner.text}</p>
        </div>

        {/* Job Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Job Title & Category */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="mb-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2 break-words">{job.title}</h2>
              {job.category && (
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                  {job.category}
                </span>
              )}
            </div>
            {job.client && <p className="text-sm text-gray-600 font-medium break-words">{job.client}</p>}
          </div>

          {/* Description */}
          {job.description && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
            </div>
          )}

          {/* Three Score Badges - Mobile optimized */}
          <div className="px-6 py-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap" aria-label="契約の透明性">
                  <span aria-hidden="true">📜 </span>契約の透明性
                </span>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{job.mScore}/100</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${mScoreColor} transition-all duration-500`}
                  style={{ width: `${job.mScore}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap" aria-label="支払い安全性">
                  <span aria-hidden="true">💳 </span>支払い安全性
                </span>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{job.sScore}/100</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${sScoreColor} transition-all duration-500`}
                  style={{ width: `${job.sScore}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap" aria-label="条件の明確さ">
                  <span aria-hidden="true">📋 </span>条件の明確さ
                </span>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{job.ambiguityScore}/100</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${ambiguityColor} transition-all duration-500`}
                  style={{ width: `${job.ambiguityScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Budget & Details - Mobile optimized */}
          <div className="px-6 py-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1" aria-label="報酬">
                <span aria-hidden="true">💰 </span>報酬
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 break-words">¥{job.budget?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1" aria-label="期間">
                <span aria-hidden="true">📅 </span>期間
              </p>
              <p className="text-base md:text-lg font-bold text-gray-900 break-words">{job.duration || '未指定'}</p>
            </div>
          </div>
        </div>

        {/* Safe marker */}
        {job.recommendationFlag === 'green' && (
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              ✓ 信頼性が高い案件
            </span>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-6 px-4">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={() => {
              if (!isSwipingRef.current) onNext?.(job);
            }}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            ✓ このお仕事を見る
          </button>

          <button
            onClick={() => {
              if (!isSwipingRef.current) onSkip?.();
            }}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            → スキップ（次の仕事へ）
          </button>

          {/* Keyboard hints */}
          <div className="flex gap-4 justify-center text-xs text-gray-500 pt-2">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-700 font-mono">↓</kbd>
              <span>次へ</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-700 font-mono">Enter</kbd>
              <span>詳細を見る</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💬 左右スワイプで操作</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
