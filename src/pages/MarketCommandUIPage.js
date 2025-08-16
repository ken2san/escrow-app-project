
import React, { useState } from 'react';
import { marketCommandItems } from '../utils/initialData';


const MarketCommandUIPage = () => {
  // Main view toggle
  const [marketView, setMarketView] = useState('timeline');
  // Prompt input
  const [prompt, setPrompt] = useState('');
  // Suggestion display control
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(0);

  // Suggestion candidates
  const suggestItems = [
    { cmd: '/タイムライン', desc: 'タイムライン表示' },
    { cmd: '/マップ', desc: 'マップ表示' },
    { cmd: '/お気に入り', desc: 'お気に入りだけ表示' },
    { cmd: '/タスク', desc: 'タスクダッシュボード表示' },
  ];

  // Command execution
  const handleCommand = (valRaw) => {
    let val = valRaw.replace(/[Ａ-Ｚａ-ｚ＠]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).toLowerCase();
    if (val.startsWith('/')) {
      if (valRaw.includes('タスク')) {
  // Task dashboard (not implemented: fallback to timeline)
        setMarketView('timeline');
      } else if (val.includes('map') || valRaw.includes('マップ')) {
        setMarketView('map');
      } else if (val.includes('timeline') || valRaw.includes('タイムライン') || valRaw.includes('一覧')) {
        setMarketView('timeline');
      } else if (valRaw.includes('お気に入り') || val.includes('favorite') || val.includes('fav')) {
  // Show only favorites (not implemented: fallback to timeline)
        setMarketView('timeline');
      }
    }
  };

  // Timeline cards
  const renderTimeline = () => (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-4">タイムライン</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {marketCommandItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.type === 'request' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{item.type === 'request' ? 'REQUEST' : 'OFFER'}</span>
                <span className={`text-sm font-bold ${item.type === 'request' ? 'text-green-600' : 'text-orange-700'}`}>{item.type === 'request' ? '+ ' : '- '}¥{item.value.toLocaleString()}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.type === 'request' ? '依頼者' : '提供者'}: {item.by}</p>
              <p className="text-sm text-slate-600 mt-3 line-clamp-3">{item.description}</p>
            </div>
            <div className="w-full mt-4 flex gap-2 items-center">
              {/* Favorite/Proposal/Purchase buttons to be implemented later */}
              <button
                className={`flex-1 font-semibold py-2 rounded-lg transition-colors text-sm
                  ${item.type === 'request'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'}`}
              >{item.type === 'request' ? '応募' : '購入'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Map view (dummy)
  const renderMapView = () => (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-4">マーケットの地図（ダミー）</h3>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-slate-400">Map Chart（Chart.js等で実装予定）</div>
    </div>
  );

  // Main view switch
  const renderMainView = () => {
    if (marketView === 'timeline') return renderTimeline();
    if (marketView === 'map') return renderMapView();
    return null;
  };

  // Removed custom Sidebar logic; now uses App-wide Sidebar only
  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="bg-white/80 backdrop-blur-sm z-10 border-b border-slate-200">
        <div className="flex items-center justify-between h-16 px-4 md:px-8">
          <h2 className="text-2xl font-bold text-slate-800">マーケット</h2>
        </div>
      </header>
      <div className="relative px-4 md:px-8 py-6 flex flex-col gap-6 flex-1">
  <div className="relative w-full max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="「@Sato Designにロゴ作成を依頼」のように、AIに話しかけてみてください..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value);
              if (e.target.value.trim() === '/') {
                setShowSuggest(true);
                setSuggestIdx(0);
              } else {
                setShowSuggest(false);
              }
            }}
            onKeyDown={e => {
              if (showSuggest) {
                if (e.key === 'ArrowDown') {
                  setSuggestIdx(idx => (idx + 1) % suggestItems.length);
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  setSuggestIdx(idx => (idx - 1 + suggestItems.length) % suggestItems.length);
                  e.preventDefault();
                } else if (e.key === 'Tab') {
                  // Tab: 選択内容を入力欄に反映しサジェストを閉じるだけ
                  setPrompt(suggestItems[suggestIdx].cmd);
                  setShowSuggest(false);
                  e.preventDefault();
                  return;
                } else if (e.key === 'Enter') {
                  // Enter: 選択内容を入力欄に反映し即コマンド実行
                  setPrompt(suggestItems[suggestIdx].cmd);
                  setShowSuggest(false);
                  handleCommand(suggestItems[suggestIdx].cmd);
                  setPrompt('');
                  e.preventDefault();
                  return;
                }
              } else if (e.key === 'Enter' && prompt.trim() !== '') {
                handleCommand(prompt.trim());
                setPrompt('');
                setShowSuggest(false);
              }
            }}
            autoComplete="off"
          />
          {/* Suggestion dropdown */}
          {showSuggest && (
            <div className="absolute left-0 right-0 top-full bg-white border border-slate-200 z-50 text-[15px] shadow-lg rounded-b-lg min-w-[220px] max-w-full" style={{pointerEvents:'auto'}}>
              {suggestItems.map((item, i) => (
                <div
                  key={item.cmd}
                  className={`suggest-item px-4 py-2 cursor-pointer${i === suggestIdx ? ' bg-indigo-50 text-indigo-700' : ''}`}
                  onMouseDown={() => {
                    setPrompt(item.cmd);
                    setShowSuggest(false);
                  }}
                >{item.cmd}: {item.desc}</div>
              ))}
            </div>
          )}
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l.34 2.27.28 1.84a2 2 0 0 0 1.95 1.54l1.84.28 2.27.34-1.64 1.64-.8.8a2 2 0 0 0 0 2.82l.8.8 1.64 1.64-2.27.34-1.84.28a2 2 0 0 0-1.95 1.54l-.28 1.84-.34 2.27-1.64-1.64-.8-.8a2 2 0 0 0-2.82 0l-.8.8-1.64 1.64.34-2.27.28-1.84a2 2 0 0 0-1.95-1.54l-1.84-.28-2.27-.34 1.64-1.64.8-.8a2 2 0 0 0 0-2.82l-.8-.8L2.69 12l2.27-.34 1.84-.28a2 2 0 0 0 1.95-1.54l.28-1.84.34-2.27L12 2.69z"/></svg>
        </div>
        {/* Main View */}
        {renderMainView()}
      </div>
    </div>
  );
}

export default MarketCommandUIPage;
