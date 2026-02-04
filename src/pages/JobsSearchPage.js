import React, { useState } from 'react';

export default function JobsSearchPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">仕事を探す</h1>
          <p className="text-slate-600 mt-2">ぴったりの仕事を見つける</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="キーワード検索"
              value={filters.searchText}
              onChange={e => setFilters({ ...filters, searchText: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">すべてのカテゴリ</option>
              <option value="IT">IT</option>
              <option value="事務">事務</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>
        {/* ダミーJobCardリスト（複数件） */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
            {/* タイトル＋チェックボタン */}
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-extrabold text-slate-900 flex-grow truncate">React コーディング</h3>
              <button className="ml-6 px-6 py-2 rounded-lg font-bold bg-indigo-600 text-white text-base whitespace-nowrap">チェック</button>
            </div>
            {/* 詳細説明（中央・背景色・余白広め） */}
            <div className="bg-slate-50 rounded-lg mb-6 p-5">
              <p className="text-slate-800 text-base leading-relaxed line-clamp-3">弊社のプロダクトで使用しているReact/TypeScriptの開発案件です。設計・実装・テスト・ドキュメント作成まで幅広く担当いただきます。チーム開発経験者歓迎。コミュニケーション重視。</p>
            </div>
            {/* 主要情報（グリッド均等配置） */}
            <div className="grid grid-cols-2 gap-6 text-sm mb-4">
              <div>
                <span className="text-xs text-slate-500">報酬</span>
                <p className="text-xl font-extrabold text-slate-900">¥250,000</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">期限</span>
                <p className="text-xl font-extrabold text-slate-900">6/30/2025</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">依頼者</span>
                <p className="text-lg font-bold text-slate-900">株式会社デモ</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">評価</span>
                <p className="text-lg font-bold text-slate-900">4.9 / 63件</p>
              </div>
            </div>
            {/* バッジ群（横並び・色分け） */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-bold">✓ 資金確保済み</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-bold">✓ 条件明確</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-bold">⚠ 注意あり</span>
            </div>
            {/* スコア群（AI推奨度のみ残す） */}
            <div className="flex items-end gap-6 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500">契約の透明性</span>
                <span className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-extrabold text-lg">85</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500">支払い安全性</span>
                <span className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-extrabold text-lg">90</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500">条件の明確さ</span>
                <span className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-extrabold text-lg">100</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-indigo-700 font-bold">AI推奨度</span>
                <span className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-extrabold text-lg">100</span>
              </div>
            </div>
            {/* スキルタグ（下部横並び） */}
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-bold">React</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-bold">TypeScript</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-bold">Jest</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-bold">Storybook</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-bold">Git</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}