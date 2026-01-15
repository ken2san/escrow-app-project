import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, AlertCircle } from 'lucide-react';
import { getAvailableJobsForDiscovery, addDraftJobs, loggedInUserDataGlobal } from '../utils/initialData';
import TimelineJobsView from '../components/jobs/TimelineJobsView';

export default function JobsSearchPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'timeline', or 'immersive'
  const [filters, setFilters] = useState({
    mScoreMin: 0,
    sScoreMin: 0,
    budgetMin: 0,
    budgetMax: 999999,
    searchText: '',
    excludeRisks: false, // New: exclude red-flag jobs
    category: 'all', // New: category filter
    locationType: 'all', // New: location filter
  });
  const [sortBy, setSortBy] = useState('recommendation'); // recommendation, trust, budget
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Advanced filter panel state

  // Get all available jobs
  const allJobs = useMemo(() => getAvailableJobsForDiscovery(), []);

  // Category options derived from data
  const categories = useMemo(() => {
    const unique = new Set();
    allJobs.forEach(job => unique.add(job.category || 'その他'));
    return ['all', ...Array.from(unique)];
  }, [allJobs]);

  // Location options derived from data
  const locationTypes = useMemo(() => {
    const unique = new Set();
    allJobs.forEach(job => unique.add(job.locationType || 'onsite'));
    return ['all', ...Array.from(unique)];
  }, [allJobs]);

  // Filter & Sort
  const filteredJobs = useMemo(() => {
    let result = allJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(filters.searchText.toLowerCase());
      const matchesMScore = job.mScore >= filters.mScoreMin;
      const matchesSScore = job.sScore >= filters.sScoreMin;
      const matchesBudget = job.budget >= filters.budgetMin && job.budget <= filters.budgetMax;
      const matchesCategory = filters.category === 'all' || job.category === filters.category;
      const matchesLocation = filters.locationType === 'all' || job.locationType === filters.locationType;
      const notRisky = !filters.excludeRisks || job.recommendationFlag !== 'red';
      return matchesSearch && matchesMScore && matchesSScore && matchesBudget && matchesCategory && matchesLocation && notRisky;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recommendation':
          return b.recommendationScore - a.recommendationScore;
        case 'trust':
          return (b.mScore + b.sScore) / 2 - (a.mScore + a.sScore) / 2;
        case 'budget':
          return b.budget - a.budget;
        default:
          return 0;
      }
    });

    return result;
  }, [allJobs, filters, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      mScoreMin: 0,
      sScoreMin: 0,
      budgetMin: 0,
      budgetMax: 999999,
      searchText: '',
      excludeRisks: false,
      category: 'all',
      locationType: 'all',
    });
    setSortBy('recommendation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">{t('jobs.title', '仕事を探す')}</h1>
          <p className="text-slate-600 mt-2">ぴったりの仕事を見つける</p>
          <p className="text-xs text-slate-500 mt-1">
            💼 募集中の仕事のみ表示 | 受けた仕事は「仕事管理」で確認できます
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-8 sticky top-24 z-20">
          <div className="flex flex-col gap-4">
            {/* Primary Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="キーワード検索"
                    value={filters.searchText}
                    onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'すべてのカテゴリ' : cat}</option>
                ))}
              </select>

              {/* Location */}
              <select
                value={filters.locationType}
                onChange={(e) => setFilters({ ...filters, locationType: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                {locationTypes.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'すべての形態' : loc === 'remote' ? 'リモート' : loc === 'hybrid' ? 'ハイブリッド' : '現地'}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                <option value="recommendation">🤖 おすすめ順</option>
                <option value="trust">🛡️ 信頼度</option>
                <option value="budget">💰 報酬順</option>
              </select>

              {/* Layout Toggle */}
              <div className="flex items-center border border-slate-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded font-medium text-sm transition ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-transparent text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  📊 グリッド
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded font-medium text-sm transition ${
                    viewMode === 'timeline' || viewMode === 'immersive'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-transparent text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  📜 タイムライン
                </button>
                {(viewMode === 'timeline' || viewMode === 'immersive') && (
                  <button
                    onClick={() => setViewMode(viewMode === 'immersive' ? 'timeline' : 'immersive')}
                    className={`px-3 py-1 rounded font-medium text-sm transition ${
                      viewMode === 'immersive'
                        ? 'bg-purple-600 text-white'
                        : 'bg-transparent text-slate-700 hover:bg-slate-100'
                    }`}
                    title="TikTok風の全画面没入モード"
                  >
                    🎯 没入モード
                  </button>
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  showAdvancedFilters
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⚙️ 詳細
              </button>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition"
              >
                ✕ リセット
              </button>
            </div>

            {/* Safety Preset Buttons (always visible) */}
            <div className="flex gap-2 items-center">
              <span className="text-xs font-medium text-slate-600">信頼度:</span>
              <button
                onClick={() => { setFilters({ ...filters, mScoreMin: 70, sScoreMin: 70 }); }}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
                  filters.mScoreMin === 70 && filters.sScoreMin === 70
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ✓ 安全な仕事
              </button>
              <button
                onClick={() => { setFilters({ ...filters, mScoreMin: 0, sScoreMin: 0 }); }}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
                  filters.mScoreMin === 0 && filters.sScoreMin === 0
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                すべて表示
              </button>
              <label className="ml-auto flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.excludeRisks}
                  onChange={(e) => setFilters({ ...filters, excludeRisks: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs font-medium text-slate-700">リスク除外</span>
              </label>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Budget Min */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">最小予算</label>
                  <input
                    type="number"
                    placeholder="最小"
                    value={filters.budgetMin}
                    onChange={(e) => setFilters({ ...filters, budgetMin: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>

                {/* Budget Max */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">最大予算</label>
                  <input
                    type="number"
                    placeholder="最大"
                    value={filters.budgetMax}
                    onChange={(e) => setFilters({ ...filters, budgetMax: parseInt(e.target.value) || 999999 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - View Mode Toggle */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Results Summary */}
            <div className="col-span-full mb-4">
              <p className="text-slate-600 text-sm">
                {filteredJobs.length} 件の仕事が見つかりました
              </p>
            </div>

            {/* Job Cards */}
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
                <p className="text-slate-500 text-lg">
                  条件に合う仕事がありません
                </p>
              </div>
            )}
          </div>
        ) : (
          <TimelineJobsView
            filteredJobs={filteredJobs}
            immersive={viewMode === 'immersive'}
            onExitImmersive={() => setViewMode('timeline')}
          />
        )}
      </div>
    </div>
  );
}

/* Job Card Component */
function JobCard({ job }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const getScoreIcon = (score) => {
    if (score >= 75) return { bg: 'bg-emerald-500', text: 'text-white' };
    if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-white' };
    return { bg: 'bg-red-500', text: 'text-white' };
  };

  const mScoreIcon = getScoreIcon(job.mScore);
  const sScoreIcon = getScoreIcon(job.sScore);
  const ambiguityIcon = getScoreIcon(job.ambiguityScore);
  const recommendationIcon = getScoreIcon(job.recommendationScore);

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

  // AI Flag styling
  const getFlagStyle = () => {
    const base = 'px-3 py-1 rounded-full font-bold text-sm';
    if (job.recommendationFlag === 'green') {
      return `${base} bg-emerald-100 text-emerald-700`;
    } else if (job.recommendationFlag === 'red') {
      return `${base} bg-red-100 text-red-700`;
    } else {
      return `${base} bg-yellow-100 text-yellow-700`;
    }
  };

  // First shift time badge for hourly jobs
  const firstShift = job?.workType === 'hourly' && Array.isArray(job?.milestones)
    ? job.milestones.find(m => m.start && m.end)
    : null;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* AI Flag + Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
              {job.category && (
                <span className={getCategoryBadgeStyle(job.category)}>
                  {job.category}
                </span>
              )}
                {job.locationType && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {job.locationType === 'remote' ? 'リモート' : job.locationType === 'hybrid' ? 'ハイブリッド' : '現地'}
                  </span>
                )}
                {firstShift && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {firstShift.start}–{firstShift.end}
                  </span>
                )}
              <span className={getFlagStyle()}>
                {job.recommendationFlag === 'green' ? '✓ おすすめ' :
                 job.recommendationFlag === 'red' ? '⚠️ 要注意' :
                 '⚡ 確認推奨'}
              </span>
            </div>
            <p className="text-sm text-slate-600">{job.client || 'クライアント名'}</p>
            {job.description && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {job.description.substring(0, 120)}{job.description.length > 120 ? '...' : ''}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addDraftJobs([job.id], loggedInUserDataGlobal.id);
              navigate('/work-management');
            }}
            className="px-6 py-3 rounded-lg font-bold text-base transition whitespace-nowrap bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl"
          >
            このお仕事を見る
          </button>
        </div>

        {/* AI Recommendation */}
        <div className="bg-white rounded p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-2">🤖 AIおすすめ度</p>
              <div className={`w-16 h-16 rounded-full ${recommendationIcon.bg} flex items-center justify-center`}>
                <span className={`text-xl font-bold ${recommendationIcon.text}`}>{job.recommendationScore}</span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="line-clamp-3">{job.recommendationReason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable header for expansion */}
      <div className="p-6 border-b border-slate-200 cursor-pointer hover:bg-slate-50" onClick={() => setIsExpanded(!isExpanded)} role="button">
        {/* Simplified Score Icons */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-2">契約の透明性</p>
            <div className={`w-14 h-14 rounded-full ${mScoreIcon.bg} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${mScoreIcon.text}`}>{job.mScore}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-2">支払い安全性</p>
            <div className={`w-14 h-14 rounded-full ${sScoreIcon.bg} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${sScoreIcon.text}`}>{job.sScore}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-2">条件の明確さ</p>
            <div className={`w-14 h-14 rounded-full ${ambiguityIcon.bg} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${ambiguityIcon.text}`}>{job.ambiguityScore}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-2">AI推奨度</p>
            <div className={`w-14 h-14 rounded-full ${recommendationIcon.bg} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${recommendationIcon.text}`}>{job.recommendationScore}</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.escrowStatus?.isFullyDeposited && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              ✓ 資金確保済み
            </span>
          )}
          {job.ambiguityScore >= 75 && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              ✓ 条件明確
            </span>
          )}
          {job.safetyWarnings && job.safetyWarnings.length === 0 && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              ✓ 安全
            </span>
          )}
          {job.safetyWarnings && job.safetyWarnings.length > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
              ⚠ 注意あり
            </span>
          )}
        </div>

        {/* Quick Details */}
        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <p className="text-slate-600">報酬</p>
            {job.workType === 'hourly' && job.hourlyRate ? (
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-900">¥{job.hourlyRate?.toLocaleString()}/h</p>
                <p className="text-xs text-slate-500">目安合計: ¥{job.budget?.toLocaleString()}</p>
                {job.milestones?.length > 0 && (
                  <p className="text-xs text-slate-500">シフト予定: {job.milestones.length}日{firstShift ? ` ・ 初回 ${firstShift.start}–${firstShift.end}` : ''}</p>
                )}
              </div>
            ) : (
              <p className="text-lg font-bold text-slate-900">¥{job.budget?.toLocaleString()}</p>
            )}
          </div>
          <div>
            <p className="text-slate-600">期限</p>
            <p className="text-lg font-bold text-slate-900">
              {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-slate-600">依頼者</p>
            <p className="text-lg font-bold text-slate-900 truncate">{job.by || 'クライアント'}</p>
          </div>
          <div>
            <p className="text-slate-600">評価</p>
            <p className="text-lg font-bold text-slate-900">
              ⭐ {job.popularity?.toFixed(1) || 'N/A'} / {job.clientRating?.totalReviews || 0}件
            </p>
          </div>
        </div>

        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-600 mb-2">向く人:</p>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                  👤 {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expand Indicator */}
        <div className="mt-4 flex items-center justify-center text-slate-400 hover:text-slate-600">
          <ChevronDown
            size={20}
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="bg-slate-50 p-6 border-t border-slate-200 space-y-6">
          {/* Safety Warnings */}
          {job.safetyWarnings && job.safetyWarnings.length > 0 && (
            <div className="space-y-2 bg-amber-50 border border-amber-200 p-4 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                <h4 className="font-semibold text-amber-900">⚠ AI安全警告</h4>
              </div>
              <ul className="space-y-1">
                {job.safetyWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-900 flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clarity Checklist */}
          {job.claritychecklist && (
            <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">契約の明確さ</h4>
                <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                  job.claritychecklist.totalScore >= 75 ? 'bg-emerald-100 text-emerald-700' :
                  job.claritychecklist.totalScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {job.claritychecklist.totalScore}/100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {job.claritychecklist.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 text-lg ${item.complete ? '✓ text-emerald-600' : '✗ text-slate-400'}`}>
                      {item.complete ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className={`font-medium ${item.complete ? 'text-slate-900' : 'text-slate-600'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Info */}
          <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
            <h4 className="font-semibold text-slate-900">案件詳細</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600 font-medium">依頼者</p>
                <p className="text-slate-900">{job.by || 'クライアント'}</p>
              </div>
              <div>
                <p className="text-slate-600 font-medium">評価・レビュー</p>
                <p className="text-slate-900">
                  ⭐ {job.popularity?.toFixed(1) || 'N/A'} 点 ({job.clientRating?.totalReviews || 0}件)
                </p>
              </div>
              <div>
                <p className="text-slate-600 font-medium">予算</p>
                <p className="text-lg font-bold text-slate-900">¥{job.budget?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-600 font-medium">納期</p>
                <p className="text-slate-900">
                  {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'TBD'}
                </p>
              </div>
            </div>
          </div>

          {/* Required Skills - Full */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="space-y-2 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">向く人</h4>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium">
                    👤 {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          {job.description && (
            <div className="space-y-2 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">仕事内容</h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {/* Deliverables */}
          {job.deliverables && (
            <div className="space-y-2 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">納品物</h4>
              <p className="text-sm text-slate-700">{job.deliverables}</p>
              {job.deliverableDetails && (
                <p className="text-sm text-slate-600 mt-2">詳細: {job.deliverableDetails}</p>
              )}
            </div>
          )}

          {/* Scope of Work */}
          {(job.scopeOfWork_included || job.scopeOfWork_excluded) && (
            <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">業務範囲</h4>
              {job.scopeOfWork_included && (
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">✓ 含まれる作業</p>
                  <p className="text-sm text-slate-600">{job.scopeOfWork_included}</p>
                </div>
              )}
              {job.scopeOfWork_excluded && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-amber-700 mb-1">✗ 含まれない作業</p>
                  <p className="text-sm text-slate-600">{job.scopeOfWork_excluded}</p>
                </div>
              )}
            </div>
          )}

          {/* Acceptance Criteria */}
          {job.acceptanceCriteria && (
            <div className="space-y-2 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">受け入れ基準</h4>
              <p className="text-sm text-slate-700">{job.acceptanceCriteria}</p>
              {job.acceptanceCriteriaDetails && (
                <p className="text-sm text-slate-600 mt-2">詳細: {job.acceptanceCriteriaDetails}</p>
              )}
            </div>
          )}

          {/* Milestones (project-type) */}
          {job.workType !== 'hourly' && job.milestones && job.milestones.length > 0 && (
            <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">マイルストーン</h4>
              <div className="space-y-3">
                {job.milestones.map((milestone, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-400 pl-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{milestone.name || milestone.title}</p>
                      <p className="text-sm font-bold text-slate-900">¥{milestone.amount?.toLocaleString()}</p>
                    </div>
                    {milestone.dueDate && (
                      <p className="text-xs text-slate-500">期限: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                    )}
                    {milestone.description && (
                      <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shift schedule (hourly-type) */}
          {job.workType === 'hourly' && job.milestones && job.milestones.length > 0 && (
            <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">シフト予定</h4>
              <ul className="space-y-2">
                {job.milestones
                  .filter(m => m.date && m.start && m.end)
                  .map((m) => (
                    <li key={m.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-900">{m.date} ・ {m.start}–{m.end}</span>
                      <span className="text-xs text-slate-600">{m.title}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}



          {/* Additional Terms */}
          {job.additionalWorkTerms && (
            <div className="space-y-2 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">追加作業について</h4>
              <p className="text-sm text-slate-700">{job.additionalWorkTerms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}