import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ShoppingCart, ChevronDown, AlertCircle, Info, Zap } from 'lucide-react';
import { getMyProjectCards } from '../utils/initialData';

export default function JobsSearchPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    mScoreMin: 0,
    sScoreMin: 0,
    budgetMin: 0,
    budgetMax: 999999,
    searchText: '',
  });
  const [sortBy, setSortBy] = useState('mScore'); // mScore, sScore, budget, deadline
  const [cartItems, setCartItems] = useState([]);

  // Get all available jobs
  const allJobs = useMemo(() => getMyProjectCards(), []);

  // Filter & Sort
  const filteredJobs = useMemo(() => {
    let result = allJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(filters.searchText.toLowerCase());
      const matchesMScore = job.mScore >= filters.mScoreMin;
      const matchesSScore = job.sScore >= filters.sScoreMin;
      const matchesBudget = job.budget >= filters.budgetMin && job.budget <= filters.budgetMax;
      return matchesSearch && matchesMScore && matchesSScore && matchesBudget;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'mScore':
          return b.mScore - a.mScore;
        case 'sScore':
          return b.sScore - a.sScore;
        case 'budget':
          return b.budget - a.budget;
        case 'deadline':
          return new Date(a.dueDate) - new Date(b.dueDate);
        default:
          return 0;
      }
    });

    return result;
  }, [allJobs, filters, sortBy]);

  const handleAddToCart = (jobId) => {
    if (!cartItems.includes(jobId)) {
      setCartItems([...cartItems, jobId]);
    }
  };

  const handleRemoveFromCart = (jobId) => {
    setCartItems(cartItems.filter(id => id !== jobId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">{t('jobs.title', '仕事を探す')}</h1>
          <p className="text-slate-600 mt-2">{t('jobs.subtitle', '美味しい仕事を見つけよう')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">{t('common.filters', 'フィルター')}</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('common.search', '検索')}
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('jobs.searchPlaceholder', 'キーワード')}
                    value={filters.searchText}
                    onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* M-Score Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  M-Score: {filters.mScoreMin}以上
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.mScoreMin}
                  onChange={(e) => setFilters({ ...filters, mScoreMin: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* S-Score Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  S-Score: {filters.sScoreMin}以上
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.sScoreMin}
                  onChange={(e) => setFilters({ ...filters, sScoreMin: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Budget Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('common.budget', '予算')} (¥)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="最小"
                    value={filters.budgetMin}
                    onChange={(e) => setFilters({ ...filters, budgetMin: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={filters.budgetMax}
                    onChange={(e) => setFilters({ ...filters, budgetMax: parseInt(e.target.value) || 999999 })}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('common.sortBy', 'ソート')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mScore">M-Score（高い順）</option>
                  <option value="sScore">S-Score（高い順）</option>
                  <option value="budget">報酬（高い順）</option>
                  <option value="deadline">期限（近い順）</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main: Job List */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                {filteredJobs.length} {t('jobs.jobsFound', '件の仕事')}
              </p>
              {cartItems.length > 0 && (
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                  <ShoppingCart size={18} className="text-indigo-600" />
                  <span className="font-medium text-indigo-900">
                    {cartItems.length} {t('jobs.inCart', 'カート内')}
                  </span>
                </div>
              )}
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isInCart={cartItems.includes(job.id)}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-slate-500 text-lg">
                    {t('jobs.noResults', '条件に合う仕事がありません')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingCart size={20} className="text-indigo-600" />
              <span className="font-medium text-slate-900">
                {cartItems.length} {t('jobs.selected', '件選択中')}
              </span>
            </div>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
              {t('jobs.createProposals', '一括で提案作成')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Job Card Component */
function JobCard({ job, isInCart, onAddToCart, onRemoveFromCart }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' };
    if (score >= 60) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
    return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' };
  };

  const mScoreColor = getScoreColor(job.mScore);
  const sScoreColor = getScoreColor(job.sScore);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200" onClick={() => setIsExpanded(!isExpanded)} role="button">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{job.client || 'クライアント名'}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              isInCart ? onRemoveFromCart(job.id) : onAddToCart(job.id);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ml-4 ${
              isInCart
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {isInCart ? 'カート内' : 'カートに入れる'}
          </button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`${mScoreColor.bg} p-3 rounded-lg cursor-pointer hover:shadow-sm transition`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">M-Score</span>
              <span className={`text-2xl font-bold ${mScoreColor.text}`}>{job.mScore}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className={`${mScoreColor.bar} h-2 rounded-full`}
                style={{ width: `${job.mScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">契約の透明性・公正性</p>
          </div>

          <div className={`${sScoreColor.bg} p-3 rounded-lg cursor-pointer hover:shadow-sm transition`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">S-Score</span>
              <span className={`text-2xl font-bold ${sScoreColor.text}`}>{job.sScore}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className={`${sScoreColor.bar} h-2 rounded-full`}
                style={{ width: `${job.sScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">支払い・予算の安全性</p>
          </div>
        </div>

        {/* Quick Details */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600">報酬</p>
            <p className="text-lg font-bold text-slate-900">¥{job.budget?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-600">期限</p>
            <p className="text-lg font-bold text-slate-900">
              {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-slate-600">ステータス</p>
            <p className="text-lg font-bold text-slate-900 capitalize">{job.status}</p>
          </div>
        </div>

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
          {/* M-Score Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-emerald-600" />
              <h4 className="font-semibold text-slate-900">M-Score 詳細（契約の透明性）</h4>
            </div>
            {job.scoreDetails?.mScoreDetails && (
              <div className="bg-white p-3 rounded border border-emerald-200 space-y-2 text-sm">
                {Object.entries(job.scoreDetails.mScoreDetails).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-600 capitalize">{key}:</span>
                    <span className="font-medium text-slate-900">{value} 点</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* S-Score Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-blue-600" />
              <h4 className="font-semibold text-slate-900">S-Score 詳細（支払い信頼性）</h4>
            </div>
            {job.scoreDetails?.sScoreDetails && (
              <div className="bg-white p-3 rounded border border-blue-200 space-y-2 text-sm">
                {Object.entries(job.scoreDetails.sScoreDetails).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-600 capitalize">{key}:</span>
                    <span className="font-medium text-slate-900">{value} 点</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          {job.scoreDetails?.warnings && job.scoreDetails.warnings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                <h4 className="font-semibold text-slate-900">注意事項</h4>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-2">
                {job.scoreDetails.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {job.scoreDetails?.mScoreRecommendations && job.scoreDetails.mScoreRecommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">改善提案</h4>
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3 space-y-2">
                {job.scoreDetails.mScoreRecommendations.map((rec, idx) => (
                  <div key={idx} className="text-sm text-indigo-900">
                    <p className="font-medium">• {rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
