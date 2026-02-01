import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, AlertCircle, Menu, X } from 'lucide-react';
import { getAvailableJobsForDiscovery, loggedInUserDataGlobal, getPendingApplicationJobsForUser, addPendingApplicationJob } from '../utils/initialData';
import ApplyJobModal from '../components/modals/ApplyJobModal';
import TimelineJobsView from '../components/jobs/TimelineJobsView';

export default function JobsSearchPage() {
  // Fetch pending applications
  const [pendingApplications, setPendingApplications] = useState([]);
  useEffect(() => {
    setPendingApplications(getPendingApplicationJobsForUser(loggedInUserDataGlobal.id));
  }, []);

  // Reflect changes when application status updates globally
  useEffect(() => {
    const handler = () => setPendingApplications(getPendingApplicationJobsForUser(loggedInUserDataGlobal.id));
    window.addEventListener('updatePendingApplications', handler);
    return () => window.removeEventListener('updatePendingApplications', handler);
  }, []);
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'timeline', or 'immersive'
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // Detect mobile screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      // Reset to grid if in immersive mode on desktop
      if (!mobile && viewMode === 'immersive') {
        setViewMode('timeline');
      }
    };

    // Ensure correct initial state on mount
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

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

  // ...existing code...
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
        {/* Top Filter Bar - Mobile optimized with hamburger menu */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-8 sticky top-24 z-20">
          <div className="flex flex-col gap-4">
            {/* Search + Mobile Menu Toggle */}
            <div className="flex gap-2">
              <div className="flex-1">
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
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Desktop: Full Controls - Always visible on md+ */}
            <div className="hidden md:block space-y-4">
              {/* Top Row: Filters + View toggle on one line, wrapping if needed */}
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'すべてのカテゴリ' : cat}</option>
                    ))}
                  </select>

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

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  >
                    <option value="recommendation">🤖 おすすめ順</option>
                    <option value="trust">🛡️ 信頼度</option>
                    <option value="budget">💰 報酬順</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">表示:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${
                        viewMode === 'grid'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>📊</span>
                      <span>グリッド</span>
                    </button>
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 border-x border-slate-300 ${
                        viewMode === 'timeline'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>📜</span>
                      <span>タイムライン</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Second Row: Buttons & Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                    showAdvancedFilters ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  ⚙️ 詳細
                </button>
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-slate-600 text-sm font-medium bg-slate-100 rounded-lg"
                >
                  ✕ リセット
                </button>

                <span className="text-xs font-medium text-slate-600">信頼度:</span>
                <button
                  onClick={() => setFilters({ ...filters, mScoreMin: 70, sScoreMin: 70 })}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium ${
                    filters.mScoreMin === 70 && filters.sScoreMin === 70
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  安全
                </button>
                <button
                  onClick={() => setFilters({ ...filters, mScoreMin: 0, sScoreMin: 0 })}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium ${
                    filters.mScoreMin === 0 && filters.sScoreMin === 0
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  全て
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

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Mobile: Hamburger Menu */}
            {showMobileMenu && (
              <div className="md:hidden pt-4 border-t border-slate-200 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">カテゴリ</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'すべてのカテゴリ' : cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">形態</label>
                  <select
                    value={filters.locationType}
                    onChange={(e) => setFilters({ ...filters, locationType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  >
                    {locationTypes.map(loc => (
                      <option key={loc} value={loc}>
                        {loc === 'all' ? 'すべての形態' : loc === 'remote' ? 'リモート' : loc === 'hybrid' ? 'ハイブリッド' : '現地'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">並べ替え</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm"
                  >
                    <option value="recommendation">🤖 おすすめ順</option>
                    <option value="trust">🛡️ 信頼度</option>
                    <option value="budget">💰 報酬順</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-2">表示</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 px-3 py-2 text-lg rounded font-medium ${
                        viewMode === 'grid'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      📊
                    </button>
                    <button
                      onClick={() => setViewMode('immersive')}
                      className={`flex-1 px-3 py-2 text-lg rounded font-medium ${
                        viewMode === 'immersive'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      🎯
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex-1 px-3 py-2 text-sm rounded font-medium ${
                      showAdvancedFilters ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    ⚙️詳細
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-3 py-2 text-sm rounded font-medium bg-slate-100 text-slate-700"
                  >
                    ✕リセット
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">信頼度</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters({ ...filters, mScoreMin: 70, sScoreMin: 70 })}
                      className={`flex-1 px-3 py-2 text-xs rounded-full font-medium ${
                        filters.mScoreMin === 70 && filters.sScoreMin === 70
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      安全
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, mScoreMin: 0, sScoreMin: 0 })}
                      className={`flex-1 px-3 py-2 text-xs rounded-full font-medium ${
                        filters.mScoreMin === 0 && filters.sScoreMin === 0
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      全て
                    </button>
                  </div>
                </div>

                {showAdvancedFilters && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">最小予算</label>
                      <input
                        type="number"
                        placeholder="最小"
                        value={filters.budgetMin}
                        onChange={(e) => setFilters({ ...filters, budgetMin: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">最大予算</label>
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

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.excludeRisks}
                    onChange={(e) => setFilters({ ...filters, excludeRisks: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs font-medium text-slate-700">リスク除外</span>
                </label>
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
                <JobCard key={job.id} job={job} pendingApplications={pendingApplications} />
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
function JobCard({ job, pendingApplications = [], onApply }) {
  // Resolve application status
  const applicationStatus = React.useMemo(() => {
    const found = pendingApplications.find(j => j.jobId === job.id);
    return found ? found.status : null;
  }, [pendingApplications, job.id]);

  // Test-only: status change button
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const getScoreIcon = (score) => {
    if (score >= 75) return { bg: 'bg-emerald-500', text: 'text-white' };
    if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-white' };
    return { bg: 'bg-red-500', text: 'text-white' };
  };

  const mScoreIcon = getScoreIcon(job.mScore);
  const sScoreIcon = getScoreIcon(job.sScore);
  const ambiguityIcon = getScoreIcon(job.ambiguityScore);
  const recommendationIcon = getScoreIcon(job.recommendationScore);

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
  const getFirstShift = (jobData) => {
    if (jobData?.workType !== 'hourly' || !Array.isArray(jobData?.milestones)) {
      return null;
    }
    return jobData.milestones.find((m) => m.start && m.end) || null;
  };

  const firstShift = getFirstShift(job);

  // Handle Apply Modal
  const handleApply = (e) => {
    e.stopPropagation();
    setShowApplyModal(true);
  };
  const handleApplyModalClose = () => setShowApplyModal(false);
  const handleApplyModalSubmit = () => {
    if (job?.id) {
      // Add to pending applications
      if (typeof window.addPendingApplicationJob === 'function') {
        window.addPendingApplicationJob(job.id, window.loggedInUserDataGlobal.id);
      } else if (typeof addPendingApplicationJob === 'function') {
        addPendingApplicationJob(job.id, loggedInUserDataGlobal.id);
      }
      // Notify global state update
      window.dispatchEvent(new Event('updatePendingApplications'));
      setShowApplyModal(false);
    }
  };



  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* AI Flag + Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-4 md:p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-base md:text-lg font-bold text-slate-900 truncate">{job.title}</h3>
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
            <p className="text-sm text-slate-600 truncate">{job.client || 'クライアント名'}</p>
            {job.description && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {job.description.substring(0, 120)}{job.description.length > 120 ? '...' : ''}
              </p>
            )}
          </div>
          <button
            onClick={handleApply}
            className={`w-full md:w-auto px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition whitespace-nowrap ${
              applicationStatus
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
            }`}
            disabled={!!applicationStatus}
          >
            {applicationStatus ? (applicationStatus === 'pending' ? '応募中' : applicationStatus === 'accepted' ? '採用済み' : '不採用') : 'このお仕事を見る'}
          </button>
        </div>

        {/* AI Recommendation */}
        <div className="bg-white rounded p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-600 md:mb-0">🤖 AIおすすめ度</p>
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${recommendationIcon.bg} flex items-center justify-center`}>
                <span className={`text-lg md:text-xl font-bold ${recommendationIcon.text}`}>{job.recommendationScore}</span>
              </div>
            </div>
            <div className="text-xs md:text-sm text-slate-600">
              <p className="line-clamp-3">{job.recommendationReason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable header for expansion */}
      <div className="p-4 md:p-6 border-b border-slate-200 cursor-pointer hover:bg-slate-50" onClick={() => setIsExpanded(!isExpanded)} role="button">
        {/* Simplified Score Icons - Mobile optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-1 md:mb-2 text-center">契約の透明性</p>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${mScoreIcon.bg} flex items-center justify-center`}>
              <span className={`text-base md:text-lg font-bold ${mScoreIcon.text}`}>{job.mScore}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-1 md:mb-2 text-center">支払い安全性</p>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${sScoreIcon.bg} flex items-center justify-center`}>
              <span className={`text-base md:text-lg font-bold ${sScoreIcon.text}`}>{job.sScore}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-1 md:mb-2 text-center">条件の明確さ</p>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${ambiguityIcon.bg} flex items-center justify-center`}>
              <span className={`text-base md:text-lg font-bold ${ambiguityIcon.text}`}>{job.ambiguityScore}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-slate-600 mb-1 md:mb-2 text-center">AI推奨度</p>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${recommendationIcon.bg} flex items-center justify-center`}>
              <span className={`text-base md:text-lg font-bold ${recommendationIcon.text}`}>{job.recommendationScore}</span>
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

        {/* Quick Details - Mobile optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm mb-4">
          <div>
            <p className="text-xs md:text-sm text-slate-600 mb-1" aria-label="報酬">
              <span aria-hidden="true">💰 </span>報酬
            </p>
            {job.workType === 'hourly' && job.hourlyRate ? (
              <div className="space-y-1">
                <p className="text-base md:text-lg font-bold text-slate-900 break-words">¥{job.hourlyRate?.toLocaleString()}/h</p>
                <p className="text-xs text-slate-500 break-words">目安合計: ¥{job.budget?.toLocaleString()}</p>
                {job.milestones?.length > 0 && (
                  <p className="text-xs text-slate-500 break-words">シフト予定: {job.milestones.length}日{firstShift ? ` ・ 初回 ${firstShift.start}–${firstShift.end}` : ''}</p>
                )}
              </div>
            ) : (
              <p className="text-base md:text-lg font-bold text-slate-900 break-words">¥{job.budget?.toLocaleString()}</p>
            )}
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-600 mb-1" aria-label="期限">
              <span aria-hidden="true">📅 </span>期限
            </p>
            <p className="text-base md:text-lg font-bold text-slate-900 break-words">
              {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-600 mb-1" aria-label="依頼者">
              <span aria-hidden="true">👤 </span>依頼者
            </p>
            <p className="text-base md:text-lg font-bold text-slate-900 truncate">{job.by || 'クライアント'}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-600 mb-1" aria-label="評価">
              <span aria-hidden="true">⭐ </span>評価
            </p>
            <p className="text-base md:text-lg font-bold text-slate-900 break-words">
              {job.popularity?.toFixed(1) || 'N/A'} / {job.clientRating?.totalReviews || 0}件
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
    {/* Apply Modal */}
    <ApplyJobModal
      isOpen={showApplyModal}
      onClose={handleApplyModalClose}
      onSubmit={handleApplyModalSubmit}
      job={job}
    />
  </>
  );
}