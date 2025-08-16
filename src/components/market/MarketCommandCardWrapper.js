import React, { useState, useEffect } from 'react';
import MarketCommandCard from './MarketCommandCard';

const MarketCommandCardWrapper = ({ item, onAction, onFavorite, minHeight, scrollSnapAlign, size = 'md' }) => {
  // Animation state: mount (visible) and remove (favorited)
  const [visible, setVisible] = useState(false);
  const [removed, setRemoved] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 80 + Math.random() * 200);
    return () => clearTimeout(timeout);
  }, []);

  const handleFavoriteWithAnim = (item) => {
    setRemoved(true);
    setTimeout(() => {
      onFavorite && onFavorite(item);
    }, 350);
  };

  // Card size style
  const sizeStyle = {
    maxWidth: '720px',
    minWidth: '320px',
    width: '100%',
    fontSize: '1rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: '1.1rem',
    background: 'rgba(255,255,255,0.97)',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  // Animation: mount (slide/rotate in), remove (scale out)
  const transition = 'all 0.5s cubic-bezier(.4,2,.6,1)';
  const style = {
    minHeight,
    scrollSnapAlign,
    display: 'flex',
    margin: '0',
    ...sizeStyle,
    transition,
    opacity: removed ? 0 : (visible ? 1 : 0),
    transform: removed
      ? 'scale(0.85)'
      : (visible ? 'translateY(0) rotate(0deg) scale(1)' : 'translateY(48px) rotate(-6deg) scale(0.96)'),
    zIndex: removed ? 0 : (visible ? 1 : 0),
  };

  // Workaround: force reflow on transition end to avoid stuck width
  const divRef = React.useRef(null);
  useEffect(() => {
    if (!visible && divRef.current) {
      // Force reflow
      void divRef.current.offsetWidth;
    }
  }, [visible]);

  return (
    <div style={style} ref={divRef}>
      <MarketCommandCard item={item} onAction={onAction} onFavorite={handleFavoriteWithAnim} size={size} disableAnimation />
    </div>
  );
};

export default MarketCommandCardWrapper;
