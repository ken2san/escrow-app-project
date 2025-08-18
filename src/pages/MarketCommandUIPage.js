
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
          // setUserLocation(loc); // removed
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
  // コメントいいね・わるいね状態を全体で管理
  const [commentLikesMap, setCommentLikesMap] = useState({});

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

  // 各タイムラインアイテムごとに「もっと見る」状態を管理
  const [showAllComments, setShowAllComments] = useState({});

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

    const timelineItems = filteredMarketItems.filter(item => !archivedIds.includes(item.id));
    const handleLike = (itemId, cidx, type) => {
      setCommentLikesMap(prev => {
        const arr = prev[itemId] ? [...prev[itemId]] : [];
        if (!arr[cidx]) arr[cidx] = { likes: 0, dislikes: 0 };
        arr[cidx] = { ...arr[cidx], [type]: arr[cidx][type] + 1 };
        return { ...prev, [itemId]: arr };
      });
    };
    // 日付フォーマット関数
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d)) return '';
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };
    return (
      <div className="relative py-12 px-2 md:px-0 bg-gradient-to-b from-indigo-50 via-white to-indigo-100 min-h-[100vh]">
        <h3 className="text-2xl font-bold text-indigo-700 mb-12 text-center tracking-wide drop-shadow-sm">Timeline</h3>
        <div className="relative max-w-3xl mx-auto">
          {/* 中心ライン */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-200 -translate-x-1/2 z-0 rounded-full" />
          <div className="flex flex-col gap-20">
            {timelineItems.map((item, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={item.id} className="relative flex items-center min-h-[140px]">
                  {/* 枝ライン */}
                  <div className={`hidden md:block absolute top-1/2 w-16 h-1 bg-indigo-200 z-10 rounded-full ${isLeft ? 'right-1/2 mr-2' : 'left-1/2 ml-2'}`}
                    style={{transform: 'translateY(-50%)'}} />
                  {/* タイムラインノード */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border-2 border-indigo-400 rounded-full shadow-md z-20">
                    <span className="text-indigo-400 text-lg">★</span>
                  </div>
                  {/* カード本体（左右交互, ラッパー最小化） */}
                  <div className={`z-20 w-full md:w-[340px] max-w-md ${isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}
                    style={{marginTop: isLeft ? '0' : '40px', marginBottom: isLeft ? '40px' : '0'}}>
                    {/* カード上部に日付表示 */}
                    {item.date && (
                      <div className="text-xs text-gray-400 mb-1 ml-1">{formatDate(item.date)}</div>
                    )}
                    <MarketCommandCardWrapper
                      item={item}
                      onAction={handleViewDetails}
                      onFavorite={handleFavorite}
                      size="sm"
                    />
                  </div>
                  {/* コメントバブル群（左右交互, opposite to card, FIXED） */}
                  <div
                    className={`absolute top-1/2 ${!isLeft ? 'right-[calc(50%+80px)]' : 'left-[calc(50%+80px)]'} w-[360px] max-w-[600px] z-30 animate-fadein`}
                    style={{transform: 'translateY(-50%)'}}
                  >
                    <div className="flex flex-col gap-4">
                      {Array.isArray(item.userComments) && item.userComments.length > 0 ? (
                        (() => {
                          // いいね順でソート
                          const commentsWithLikes = item.userComments.map((commentObj, cidx) => {
                            // 文字列→オブジェクト変換対応
                            let comment = commentObj;
                            let date = undefined;
                            if (typeof commentObj === 'object' && commentObj !== null) {
                              comment = commentObj.text || commentObj.comment || '';
                              date = commentObj.date;
                            }
                            return {
                              comment,
                              date,
                              cidx,
                              likes: commentLikesMap[item.id]?.[cidx]?.likes || 0,
                              dislikes: commentLikesMap[item.id]?.[cidx]?.dislikes || 0
                            };
                          });
                          commentsWithLikes.sort((a, b) => b.likes - a.likes);
                          const showAll = !!showAllComments[item.id];
                          const displayComments = showAll ? commentsWithLikes : commentsWithLikes.slice(0, 5);
                          return <>
                            {displayComments.map(({ comment, date, cidx, likes, dislikes }) => (
                              <div key={cidx} className="relative">
                                <div className={`bubble-paper ${!isLeft ? 'left' : 'right'} flex items-center gap-2 px-3 py-2`}>
                                  <span className="italic text-indigo-700 flex-1">{comment}</span>
                                  <button className="text-green-500 hover:text-green-700 px-1" title="いいね" onClick={() => handleLike(item.id, cidx, 'likes')}>
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle"><path d="M2 10.75C2 9.784 2.784 9 3.75 9H7V5.5A2.5 2.5 0 019.5 3c.828 0 1.5.672 1.5 1.5V9h4.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0115.25 18H5.75A1.75 1.75 0 014 16.25v-5.5z"/></svg>
                                    <span className="text-xs ml-0.5">{likes}</span>
                                  </button>
                                  <button className="text-red-400 hover:text-red-600 px-1" title="わるいね" onClick={() => handleLike(item.id, cidx, 'dislikes')}>
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="inline-block align-middle"><path d="M18 9.25c0 .966-.784 1.75-1.75 1.75H13V14.5A2.5 2.5 0 0110.5 17c-.828 0-1.5-.672-1.5-1.5V11H4.75A1.75 1.75 0 013 9.25v-5.5C3 2.784 3.784 2 4.75 2h9.5A1.75 1.75 0 0116 3.75v5.5z"/></svg>
                                    <span className="text-xs ml-0.5">{dislikes}</span>
                                  </button>
                                </div>
                                {/* コメント日付 */}
                                {date && (
                                  <div className="text-[11px] text-gray-400 ml-2 mt-0.5">{formatDate(date)}</div>
                                )}
                              </div>
                            ))}
                            {commentsWithLikes.length > 5 && !showAll && (
                              <button className="mt-2 text-indigo-500 hover:underline text-sm" onClick={() => setShowAllComments(prev => ({ ...prev, [item.id]: true }))}>
                                もっと見る
                              </button>
                            )}
                          </>;
                        })()
                      ) : (
                        <span className="text-gray-400">最初のフィードバックをどうぞ！</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                >
                  {item.cmd}: {item.desc}
                </div>
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
