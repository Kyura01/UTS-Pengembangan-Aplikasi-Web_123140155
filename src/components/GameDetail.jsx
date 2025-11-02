// src/components/GameDetail.jsx
import React, { useState, useEffect, useRef } from 'react';

const GameDetail = ({ game, onClose }) => {
  const [screenshots, setScreenshots] = useState([]);
  const [index, setIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const startX = useRef(null);
  const startTime = useRef(null);
  const velocity = useRef(0);
  const viewportRef = useRef(null);
  const autoplayTimerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchScreenshots = async () => {
      try {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const url = `${baseUrl}/games/${game.slug}/screenshots?key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) return;
        const { results } = await response.json();
        if (mounted) setScreenshots(results.map((shot) => shot.image));
      } catch (err) {
        // ignore screenshot errors silently
      }
    };
    fetchScreenshots();

    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, Math.max(0, screenshots.length - 1)));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => { mounted = false; window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.slug]);

  useEffect(() => { setIndex(0); setImgLoaded(false); }, [game.slug]);

  useEffect(() => { setImgLoaded(false); }, [index, screenshots]);

  const genres = game.genres?.map((g) => g.name).join(', ') || 'N/A';

  const items = screenshots.length ? screenshots : [game.background_image];
  const current = items[index] || game.background_image;

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, Math.max(0, items.length - 1)));

  // Pointer/touch handlers for swipe support
  // Handle autoplay
  useEffect(() => {
    const startAutoplay = () => {
      if (!isAutoPlaying) return;
      autoplayTimerRef.current = setInterval(() => {
        setIndex(i => (i + 1) % items.length);
      }, 5000); // Change image every 5 seconds
    };

    const stopAutoplay = () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };

    startAutoplay();
    return () => stopAutoplay();
  }, [isAutoPlaying, items.length]);

  const onPointerDown = (e) => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      setIsAutoPlaying(false);
    }
    startX.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    startTime.current = Date.now();
    velocity.current = 0;
    viewportRef.current && viewportRef.current.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!startX.current) return;
    const currentX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const deltaX = currentX - startX.current;
    const deltaTime = Date.now() - startTime.current;
    velocity.current = deltaX / deltaTime; // pixels per millisecond
  };

  const onPointerUp = (e) => {
    const endX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
    const dx = endX - (startX.current || 0);
    const deltaTime = Date.now() - startTime.current;
    
    // Calculate final velocity (pixels per millisecond)
    const finalVelocity = dx / deltaTime;
    
    // Thresholds for swipe detection
    const distanceThreshold = 50; // px
    const velocityThreshold = 0.5; // px/ms
    const timeThreshold = 300; // ms

    // Determine if swipe should trigger based on distance, velocity, and time
    if (Math.abs(finalVelocity) > velocityThreshold && deltaTime < timeThreshold) {
      // Fast swipe - use velocity direction
      finalVelocity > 0 ? prev() : next();
    } else if (Math.abs(dx) > distanceThreshold) {
      // Slow swipe - use distance direction
      dx > 0 ? prev() : next();
    }

    startX.current = null;
    startTime.current = null;
    velocity.current = 0;
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${game.name} details`}>
        <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-grid">
          <div className="left">
            <div className="carousel">
              <button className="carousel-btn prev" onClick={prev} aria-label="Previous">‹</button>
              <div
                className="carousel-viewport"
                ref={viewportRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                style={{ touchAction: 'pan-y pinch-zoom' }}
              >
                {!imgLoaded && <div className="skeleton carousel-skeleton" aria-hidden="true" />}
                <img
                  src={current}
                  alt={`${game.name} screenshot`}
                  className={`carousel-img ${imgLoaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setImgLoaded(true)}
                  loading="lazy"
                />
              </div>
              <button className="carousel-btn next" onClick={next} aria-label="Next">›</button>
            </div>

            <div className="thumbs">
              {items.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb ${idx === index ? 'active' : ''}`}
                  onClick={() => setIndex(idx)}
                  aria-label={`Show screenshot ${idx + 1}`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
          <div className="right">
            <h2>{game.name}</h2>
            <p className="meta-line"><strong>Released:</strong> {game.released || 'N/A'}</p>
            <p className="meta-line"><strong>Rating:</strong> {game.rating ? `${game.rating}/5` : '—'}</p>
            <p className="meta-line"><strong>Genres:</strong> {genres}</p>
            <hr />
            <div className="description">
              {game.description_raw ? (
                <p>{game.description_raw}</p>
              ) : (
                <div className="description-skeleton">
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line" style={{ width: '75%' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;