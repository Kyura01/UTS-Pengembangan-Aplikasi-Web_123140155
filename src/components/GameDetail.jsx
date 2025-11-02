// src/components/GameDetail.jsx
import React, { useState, useEffect } from 'react';

const GameDetail = ({ game, onClose }) => {
  const [screenshots, setScreenshots] = useState([]);

  useEffect(() => {
    const fetchScreenshots = async () => {
      const url = `https://api.rawg.io/api/games/${game.slug}/screenshots?key=YOUR_API_KEY`;
      const response = await fetch(url);
      const { results } = await response.json();
      setScreenshots(results.map((shot) => shot.image));
    };
    fetchScreenshots();
  }, [game.slug]);

  const genres = game.genres?.map((g) => g.name).join(', ') || 'N/A';

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <button onClick={onClose} aria-label="Close">Close</button>
      <h2>{game.name}</h2>
      <p>{game.description_raw || 'No description'}</p>
      <p>Genres: {genres}</p>
      <div>
        {screenshots.map((img, idx) => (
          <img key={idx} src={img} alt={`Screenshot ${idx + 1}`} />
        ))}
      </div>
    </div>
  );
};

export default GameDetail;