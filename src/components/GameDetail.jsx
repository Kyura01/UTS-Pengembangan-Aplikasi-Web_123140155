// src/components/GameDetail.jsx
import React, { useState, useEffect, useRef } from 'react';

const GameDetail = ({ game, onClose }) => {
  const [screenshots, setScreenshots] = useState([]);
  const [index, setIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const startX = useRef(null);
  const viewportRef = useRef(null);

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
  const onPointerDown = (e) => {
    startX.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    viewportRef.current && viewportRef.current.setPointerCapture?.(e.pointerId);
  };

  const onPointerUp = (e) => {
    const endX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
    const dx = endX - (startX.current || 0);
    const threshold = 50; // px
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
    startX.current = null;
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
                onPointerUp={onPointerUp}
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
              <p>{game.description_raw || 'No description available.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;