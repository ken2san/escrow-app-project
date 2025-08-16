import React, { useState } from 'react';



const MarketCommandCard = ({ item, onAction, onFavorite, size = 'md', disableAnimation }) => {
  const isRequest = item.type === 'request';
  const [heartBurst, setHeartBurst] = useState(false);
  // Heart burst animation
  const handleFavorite = (item) => {
    setHeartBurst(true);
    setTimeout(() => {
      setHeartBurst(false);
      onFavorite && onFavorite(item);
    }, 500);
  };
  // Hover effect: lift and glow
  const [hovered, setHovered] = useState(false);
  // Show work image if available
  const workImage = item.workImage;
  return (
    <div
      className={`rounded-xl flex flex-col gap-2 border transition-all duration-500 ease-out
        ${isRequest ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}
        ${hovered ? 'scale-105 shadow-[0_8px_32px_0_rgba(0,180,255,0.18)] z-10' : ''}
        p-7 text-base shadow-xl`}
      style={{ filter: hovered ? 'brightness(1.08) saturate(1.15)' : 'none', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Work image section */}
      <div className="w-full aspect-[4/2.2] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-2 border border-gray-200">
        {workImage ? (
          <img src={workImage} alt="Work" className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400 text-sm text-center">No work image<br />Add a photo to attract more clients!</span>
        )}
      </div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide shadow-sm
            ${isRequest ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}
          >
            {isRequest ? 'REQUEST' : 'OFFER'}
          </span>
          {/* Recommended badge example */}
          {item.nature > 0.7 && (
            <span className="text-xxs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-bold animate-pulse">Recommended</span>
          )}
        </div>
        <button
          className={`relative transition text-lg text-gray-300 hover:text-pink-400`}
          title={'Add to favorites & archive'}
          onClick={() => handleFavorite(item)}
        >
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.343l-6.828-6.829a4 4 0 010-5.656z"/>
          </svg>
          {heartBurst && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-heart-burst">
              <svg width="40" height="40" fill="#f472b6" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.343l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
            </span>
          )}
        </button>

      </div>
      <h3 className="text-xl font-extrabold text-gray-800 leading-tight mb-1">
        {item.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2" title={item.description}>
        {item.description}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-base font-bold ${isRequest ? 'text-blue-700' : 'text-green-700'}`}>
          ¥{item.reward.toLocaleString()}
        </span>
        <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
          {item.popularity}/10
        </span>
      </div>
      <button
        className={`mt-3 py-2 rounded-lg font-semibold text-sm shadow-sm transition-colors
          ${isRequest ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
        onClick={() => onAction(item)}
      >
        {isRequest ? 'Apply' : 'Purchase'}
      </button>
    </div>
  );
};

export default MarketCommandCard;
