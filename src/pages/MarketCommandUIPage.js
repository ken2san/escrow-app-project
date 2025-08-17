
import React, { useState, useRef, useEffect } from 'react';
import { marketCommandItems as initialMarketCommandItems, getMyProjectCards, loggedInUserDataGlobal } from '../utils/initialData';
import MarketCommandCardWrapper from '../components/market/MarketCommandCardWrapper';


const MarketCommandUIPage = () => {
  // Main view toggle
  const [marketView, setMarketView] = useState('timeline');
  // Prompt input
  const [prompt, setPrompt] = useState('');
  // Suggestion display control
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(0);

  // Suggestion candidates (English only)
  const suggestItems = [
    { cmd: '/timeline', desc: 'Show timeline' },
    { cmd: '/map', desc: 'Show map' },
    { cmd: '/favorite', desc: 'Show only favorites' },
    { cmd: '/task', desc: 'Show task dashboard' },
    { cmd: '/setlocation', desc: 'Set your location (e.g. /setlocation Tokyo)' },
    { cmd: '/my', desc: 'Show only my cards (dummy)' },
  ];

  // User location state
  const [userLocation, setUserLocation] = useState('');

  // スラッシュ検索用 state
  const [searchKeyword, setSearchKeyword] = useState('');

  // Command execution (English only)
  const handleCommand = (valRaw) => {
    let val = valRaw.replace(/[Ａ-Ｚａ-ｚ＠]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).toLowerCase();
    if (val.startsWith('/')) {
      if (val.startsWith('/task')) {
        setMarketView('timeline'); // fallback
        setSearchKeyword('');
      } else if (val.startsWith('/map')) {
        setMarketView('map');
        setSearchKeyword('');
      } else if (val.startsWith('/timeline')) {
        setMarketView('timeline');
        setSearchKeyword('');
      } else if (val.startsWith('/favorite') || val.startsWith('/fav')) {
        setMarketView('timeline'); // fallback
        setSearchKeyword('');
      } else if (val.startsWith('/setlocation')) {
        // /setlocation <address>
        const loc = valRaw.replace(/^\/setlocation\s*/i, '').trim();
        if (loc) {
          setUserLocation(loc);
          alert('Location set to: ' + loc);
        } else {
          alert('Usage: /setlocation <your address>');
        }
        setSearchKeyword('');
      } else if (val.startsWith('/my')) {
        // Show only my cards (dummy)
        setSearchKeyword('__MY_CARDS_ONLY__');
        setMarketView('timeline');
      } else {
        // --- スラッシュ検索: /<keyword> で検索 ---
        const keyword = valRaw.replace(/^\//, '').trim();
        setSearchKeyword(keyword);
        setMarketView('timeline');
      }
    } else {
      setSearchKeyword('');
    }
  };

  // Timeline cards with vertical snap and infinite scroll
  // Ensure unique keys: prefix user cards with 'my-'
  const [marketItems, setMarketItems] = useState([
    ...initialMarketCommandItems,
    ...getMyProjectCards(loggedInUserDataGlobal.id).map(item => ({ ...item, id: `my-${item.id}` }))
  ]);
  // Track archived (favorited) item ids
  const [archivedIds, setArchivedIds] = useState([]);
  const timelineRef = useRef(null);
  const loadingRef = useRef(false);

  // Infinite scroll: add more dummy cards when near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current || loadingRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = timelineRef.current;
      if (scrollHeight - scrollTop - clientHeight < 200) {
        loadingRef.current = true;
        setTimeout(() => {
          setMarketItems(prev => {
            // Generate unique ids for new dummy cards
            const nextIdx = prev.length;
            return [
              ...prev,
              ...prev.slice(0, 4).map((item, idx) => ({
                ...item,
                id: `dummy-${nextIdx + idx + 1}`,
                title: item.title + ' (おすすめ)',
                nature: Math.random(),
                popularity: Math.floor(Math.random() * 10) + 1,
              }))
            ];
          });
          loadingRef.current = false;
        }, 600);
      }
    };
    const el = timelineRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, []);


  const handleViewDetails = (item) => {
    alert(`View details for: ${item.title}`);
  };

  // Remove card from timeline when favorited
  const handleFavorite = (item) => {
    setArchivedIds(ids => [...ids, item.id]);
  };

  const renderTimeline = () => {
    // --- 検索キーワードがあればフィルタ ---
    let filteredMarketItems;
    if (searchKeyword === '__MY_CARDS_ONLY__') {
      // Dummy: filter to only my cards (by userId, with 'my-' prefix)
      filteredMarketItems = marketItems.filter(item => String(item.id).startsWith('my-'));
    } else if (searchKeyword) {
      filteredMarketItems = marketItems.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    } else {
      filteredMarketItems = marketItems;
    }

    return (
      <div className="relative">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">タイムライン</h3>
        {/* Mobile: vertical snap, Desktop: grid */}
        <div
          ref={timelineRef}
          className="w-full gap-6 overflow-y-auto"
          style={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile only: snap scroll */}
          <div
            className="block md:hidden"
            style={{
              height: '100%',
              overflowY: 'auto',
              scrollSnapType: 'y mandatory',
              flex: 1,
            }}
          >
            {filteredMarketItems
              .filter(item => !archivedIds.includes(item.id))
              .sort((a, b) => b.nature - a.nature)
              .map((item, idx) => (
                <MarketCommandCardWrapper
                  key={item.id}
                  item={item}
                  onAction={handleViewDetails}
                  onFavorite={handleFavorite}
                  minHeight={item.nature > 0.8 ? '80vh' : item.nature > 0.6 ? '65vh' : '50vh'}
                  scrollSnapAlign="start"
                  size={item.nature > 0.8 ? 'xl' : item.nature > 0.6 ? 'lg' : 'md'}
                />
            ))}
            <div className="text-center text-gray-400 py-4">Loading more...</div>
          </div>
          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMarketItems
              .filter(item => !archivedIds.includes(item.id))
              .sort((a, b) => b.nature - a.nature)
              .map((item, idx) => (
                <MarketCommandCardWrapper
                  key={item.id}
                  item={item}
                  onAction={handleViewDetails}
                  onFavorite={handleFavorite}
                  size={item.nature > 0.8 ? 'xl' : item.nature > 0.6 ? 'lg' : 'md'}
                />
            ))}
          </div>
        </div>
      </div>
    );
  };

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
