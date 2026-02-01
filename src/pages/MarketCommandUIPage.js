
import React, { useState, useRef, useEffect } from 'react';
import { marketCommandItems as initialMarketCommandItems, getMyProjectCards, loggedInUserDataGlobal } from '../utils/initialData';
import MarketCommandCardWrapper from '../components/market/MarketCommandCardWrapper';
import PriorityTaskCard from '../components/dashboard/PriorityTaskCard';
import PriorityTaskList from '../components/dashboard/PriorityTaskList';
import { getTodaysPriorityTask, getAllTasksByPriority } from '../utils/priorityLogic';


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
    { cmd: '/timeline', desc: 'タイムラインを表示' },
    { cmd: '/task', desc: '全タスクを優先度順に表示' },
    { cmd: '/map', desc: '地図ビューを表示' },
    { cmd: '/favorite', desc: 'お気に入りのみ表示' },
    { cmd: '/my', desc: '自分の案件のみ表示' },
    { cmd: '/setlocation', desc: '場所を設定（例: /setlocation Tokyo）' },
  ];



  // State for slash search
  const [searchKeyword, setSearchKeyword] = useState('');

  // Command execution (English only)
  const handleCommand = (valRaw) => {
    let val = valRaw.replace(/[Ａ-Ｚａ-ｚ＠]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).toLowerCase();
    if (val.startsWith('/')) {
      if (val.startsWith('/task')) {
        setMarketView('taskList');
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
        // --- Slash search: /<keyword> ---
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
  // Track comment like/dislike state globally
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
  if (el) el.addEventListener('scroll', handleScroll, { passive: true });
  return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, []);


  const handleViewDetails = (item) => {
    alert(`View details for: ${item.title}`);
  };

  // Remove card from timeline when favorited
  const handleFavorite = (item) => {
    setArchivedIds(ids => [...ids, item.id]);
  };

  // Track "show more" state per timeline item
  const [showAllComments, setShowAllComments] = useState({});

  const renderTimeline = () => {
    // --- Filter when a search keyword is provided ---
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
    // Date formatting helper
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
          {/* Center line */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-200 -translate-x-1/2 z-0 rounded-full" />
          <div className="flex flex-col gap-20">
            {timelineItems.map((item, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={item.id} className="relative min-h-[140px]">
                  {/* Branch line */}
                  <div className={`hidden md:block absolute top-1/2 w-16 h-1 bg-indigo-200 z-0 rounded-full ${isLeft ? 'right-1/2 mr-2' : 'left-1/2 ml-2'}`}
                    style={{transform: 'translateY(-50%)'}} />
                  {/* Timeline node */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-white border-2 border-indigo-400 rounded-full shadow-md z-0">
                    <span className="text-indigo-400 text-lg">★</span>
                  </div>
                  {/* Zigzag: flex-row on desktop, flex-col on mobile */}
                  <div className={`flex flex-col md:flex-row w-full max-w-3xl mx-auto ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                    {/* Card body */}
                    <div className={`z-0 w-full max-w-xs md:w-[340px] md:max-w-md ${isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                      {/* User name/icon/date (aligned with bubble) */}
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        {item.byIcon && <span className="text-lg">{item.byIcon}</span>}
                        <span className="text-xs text-gray-600 font-semibold">{item.by}</span>
                        {item.date && (
                          <span className="text-[11px] text-gray-400 ml-2">{formatDate(item.date)}</span>
                        )}
                      </div>
                      <MarketCommandCardWrapper
                        item={item}
                        onAction={handleViewDetails}
                        onFavorite={handleFavorite}
                        size="sm"
                      />
                    </div>
                    {/* Comment bubbles */}
                    <div className={`flex flex-col gap-4 mt-2 w-full max-w-xs md:w-[360px] md:max-w-[600px] animate-fadein ${isLeft ? 'md:ml-12 md:ml-20' : 'md:mr-12 md:mr-20'}`}>
                      {Array.isArray(item.userComments) && item.userComments.length > 0 ? (() => {
                        // Sort by likes
                        const commentsWithLikes = item.userComments.map((commentObj, cidx) => {
                          let comment = commentObj;
                          let date = undefined;
                          let userIcon = undefined;
                          let userName = undefined;
                          if (typeof commentObj === 'object' && commentObj !== null) {
                            comment = commentObj.text || commentObj.comment || '';
                            date = commentObj.date;
                            userIcon = commentObj.userIcon;
                            userName = commentObj.userName;
                          }
                          return {
                            comment,
                            date,
                            userIcon,
                            userName,
                            cidx,
                            likes: commentLikesMap[item.id]?.[cidx]?.likes || 0,
                            dislikes: commentLikesMap[item.id]?.[cidx]?.dislikes || 0
                          };
                        });
                        commentsWithLikes.sort((a, b) => b.likes - a.likes);
                        const showAll = !!showAllComments[item.id];
                        const displayComments = showAll ? commentsWithLikes : commentsWithLikes.slice(0, 5);
                        return (
                          <div>
                            {displayComments.map(({ comment, date, cidx, likes, dislikes, userIcon, userName }) => (
                              <div key={cidx} className="relative">
                                {(userIcon || userName || date) && (
                                  <div className={`flex items-center gap-1 mb-0.5 ml-2 ${!isLeft ? 'justify-end' : 'justify-start'}`}>
                                    {userIcon && <span className="text-base mr-1">{userIcon}</span>}
                                    {userName && <span className="text-xs text-gray-600 font-semibold">{userName}</span>}
                                    {date && (
                                      <span className="text-[11px] text-gray-400 ml-2">{formatDate(date)}</span>
                                    )}
                                  </div>
                                )}
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
                              </div>
                            ))}
                            {commentsWithLikes.length > 5 && !showAll && (
                              <button className="mt-2 text-indigo-500 hover:underline text-sm" onClick={() => setShowAllComments(prev => ({ ...prev, [item.id]: true }))}>
                                もっと見る
                              </button>
                            )}
                          </div>
                        );
                      })() : (
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

  // Task list view
  const renderTaskListView = () => {
    const allTasks = getAllTasksByPriority(
      getMyProjectCards(loggedInUserDataGlobal.id),
      loggedInUserDataGlobal.role,
      loggedInUserDataGlobal.id
    );

    return (
      <PriorityTaskList
        projects={allTasks}
        userRole={loggedInUserDataGlobal.role}
        onTaskClick={handlePriorityTaskAction}
      />
    );
  };

  // Main view switch
  const renderMainView = () => {
    if (marketView === 'timeline') return renderTimeline();
    if (marketView === 'map') return renderMapView();
    if (marketView === 'taskList') return renderTaskListView();
    return null;
  };

  // Calculate today's priority task
  const priorityTask = getTodaysPriorityTask(
    getMyProjectCards(loggedInUserDataGlobal.id),
    loggedInUserDataGlobal.role,
    loggedInUserDataGlobal.id
  );

  const handlePriorityTaskAction = (project) => {
    // Navigate to project details or appropriate action
    alert(`Action clicked for project: ${project.title}`);
  };

  // Removed custom Sidebar logic; now uses App-wide Sidebar only
  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="relative px-4 md:px-8 py-6 flex flex-col gap-6 flex-1">
  <div className="sticky top-0 z-20 bg-slate-100 w-full max-w-3xl mx-auto rounded-full">
          <input
            type="text"
            placeholder="「@Sato Designにロゴ作成を依頼」のように、AIに話しかけてみてください..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
            value={prompt}
            onChange={e => {
              const val = e.target.value;
              setPrompt(val);
              // Show suggestion list whenever a slash command is being typed
              if (val.trim().startsWith('/')) {
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
                  // Tab: fill input with selection and close suggestions
                  setPrompt(suggestItems[suggestIdx].cmd);
                  setShowSuggest(false);
                  e.preventDefault();
                  return;
                } else if (e.key === 'Enter') {
                  // Enter: fill input with selection and execute command
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

        {/* Today's Priority Task */}
        <div className="w-full max-w-3xl mx-auto">
          <PriorityTaskCard
            project={priorityTask}
            userRole={loggedInUserDataGlobal.role}
            onActionClick={handlePriorityTaskAction}
          />
        </div>

        {/* Main View */}

        {renderMainView()}
      </div>
    </div>
  );
}

export default MarketCommandUIPage;
