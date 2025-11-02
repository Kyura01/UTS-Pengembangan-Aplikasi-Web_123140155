// src/components/GameDetail.jsx
import React, { useState, useEffect } from 'react';

const GameDetail = ({ game, onClose }) => {
  const [screenshots, setScreenshots] = useState([]);

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
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { mounted = false; window.removeEventListener('keydown', onKey); };
  }, [game.slug, onClose]);

  const genres = game.genres?.map((g) => g.name).join(', ') || 'N/A';

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${game.name} details`}>
        <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-grid">
          <div className="left">
            <img src={game.background_image} alt={`${game.name} cover`} className="detail-cover" />
            <div className="screenshots">
              {screenshots.slice(0, 4).map((img, idx) => (
                <img key={idx} src={img} alt={`Screenshot ${idx + 1}`} />
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