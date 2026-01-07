import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ChevronDown, AlertCircle } from 'lucide-react';
import { getAvailableJobsForDiscovery, addDraftJobs, loggedInUserDataGlobal } from '../utils/initialData';

export default function JobsSearchPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    mScoreMin: 0,
    sScoreMin: 0,
    budgetMin: 0,
    budgetMax: 999999,
    searchText: '',
    excludeRisks: false, // New: exclude red-flag jobs
  });
  const [sortBy, setSortBy] = useState('recommendation'); // recommendation, trust, budget


  // Get all available jobs
  const allJobs = useMemo(() => getAvailableJobsForDiscovery(), []);

  // Filter & Sort
  const filteredJobs = useMemo(() => {
    let result = allJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(filters.searchText.toLowerCase());
      const matchesMScore = job.mScore >= filters.mScoreMin;
      const matchesSScore = job.sScore >= filters.sScoreMin;
      const matchesBudget = job.budget >= filters.budgetMin && job.budget <= filters.budgetMax;
      const notRisky = !filters.excludeRisks || job.recommendationFlag !== 'red';
      return matchesSearch && matchesMScore && matchesSScore && matchesBudget && notRisky;
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

  // Smart filter: show only safe jobs
  const applySafeJobsFilter = () => {
    setFilters({
      mScoreMin: 70,
      sScoreMin: 70,
      budgetMin: 0,
      budgetMax: 999999,
      searchText: '',
      excludeRisks: true,
    });
    setSortBy('recommendation');
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      mScoreMin: 0,
      sScoreMin: 0,
      budgetMin: 0,
      budgetMax: 999999,
      searchText: '',
      excludeRisks: false,
    });
    setSortBy('recommendation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">{t('jobs.title', '仕事を探す')}</h1>
          <p className="text-slate-600 mt-2">{t('jobs.subtitle', '美味しい仕事を見つけよう')}</p>
          <p className="text-xs text-slate-500 mt-1">
            💼 募集中の仕事のみ表示 | 受けた仕事は「仕事管理」で確認できます
          </p>
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
                  契約の透明性: {filters.mScoreMin}以上
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
                  支払い安全性: {filters.sScoreMin}以上
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
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="最小金額"
                    value={filters.budgetMin}
                    onChange={(e) => setFilters({ ...filters, budgetMin: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="最大金額"
                    value={filters.budgetMax}
                    onChange={(e) => setFilters({ ...filters, budgetMax: parseInt(e.target.value) || 999999 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
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
                  <option value="recommendation">🤖 AI おすすめ度</option>
                  <option value="trust">🛡️ 信頼度（M+S）</option>
                  <option value="budget">💰 報酬（高い順）</option>
                </select>
              </div>

              {/* Risk Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.excludeRisks}
                    onChange={(e) => setFilters({ ...filters, excludeRisks: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">リスク案件を除外</span>
                </label>
              </div>

              {/* Smart Filters */}
              <div className="mb-6 pt-6 border-t border-slate-300">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  🎯 クイックアクション
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => applySafeJobsFilter()}
                    className="w-full px-3 py-2 text-sm font-medium text-left rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition"
                  >
                    ✓ 安全な仕事のみ表示
                  </button>
                  <button
                    onClick={() => resetFilters()}
                    className="w-full px-3 py-2 text-sm font-medium text-left rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                  >
                    ↻ 全てをリセット
                  </button>
                </div>
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

            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} />
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
    </div>
  );
}

/* Job Card Component */
function JobCard({ job }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' };
    if (score >= 60) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
    return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' };
  };

  const getAmbiguityColor = (score) => {
    if (score >= 75) return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '明確' };
    if (score >= 50) return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: '普通' };
    return { bg: 'bg-red-50', text: 'text-red-700', label: '曖昧' };
  };

  const mScoreColor = getScoreColor(job.mScore);
  const sScoreColor = getScoreColor(job.sScore);

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

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* AI Flag + Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
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
              // eslint-disable-next-line no-alert
              alert('下書きを作成しました。仕事管理で編集できます。');
              navigate('/work-management');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            管理で開く
          </button>
        </div>

        {/* AI Recommendation */}
        <div className="bg-white rounded p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">🤖 AIおすすめ度</p>
              <p className="text-2xl font-bold text-indigo-600">{job.recommendationScore}/100</p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="line-clamp-3">{job.recommendationReason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable header for expansion */}
      <div className="p-6 border-b border-slate-200 cursor-pointer hover:bg-slate-50" onClick={() => setIsExpanded(!isExpanded)} role="button">
        {/* Scores */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className={`${mScoreColor.bg} p-3 rounded-lg`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">契約の透明性</span>
              <span className={`text-2xl font-bold ${mScoreColor.text}`}>{job.mScore}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className={`${mScoreColor.bar} h-2 rounded-full`}
                style={{ width: `${job.mScore}%` }}
              />
            </div>
          </div>

          <div className={`${sScoreColor.bg} p-3 rounded-lg`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">支払い安全性</span>
              <span className={`text-2xl font-bold ${sScoreColor.text}`}>{job.sScore}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className={`${sScoreColor.bar} h-2 rounded-full`}
                style={{ width: `${job.sScore}%` }}
              />
            </div>
          </div>

          <div className={`${getAmbiguityColor(job.ambiguityScore).bg} p-3 rounded-lg`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">条件の明確さ</span>
              <span className={`text-2xl font-bold ${getAmbiguityColor(job.ambiguityScore).text}`}>{job.ambiguityScore}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className={`${getAmbiguityColor(job.ambiguityScore).text.replace('text', 'bg')} h-2 rounded-full`}
                style={{ width: `${job.ambiguityScore}%` }}
              />
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
            <p className="text-lg font-bold text-slate-900">¥{job.budget?.toLocaleString()}</p>
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
            <p className="text-xs font-medium text-slate-600 mb-2">必須スキル:</p>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                  {skill}
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
              <h4 className="font-semibold text-slate-900">必須スキル</h4>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium">
                    {skill}
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

          {/* Milestones */}
          {job.milestones && job.milestones.length > 0 && (
            <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
              <h4 className="font-semibold text-slate-900">マイルストーン</h4>
              <div className="space-y-3">
                {job.milestones.map((milestone, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-400 pl-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{milestone.name}</p>
                      <p className="text-sm font-bold text-slate-900">¥{milestone.amount?.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-slate-500">期限: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                    {milestone.description && (
                      <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                    )}
                  </div>
                ))}
              </div>
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