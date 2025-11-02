// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import GameGrid from './components/GameGrid';
import GameDetail from './components/GameDetail';

const App = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [platforms, setPlatforms] = useState({ pc: false, playstation: false, xbox: false });
  const [sortBy, setSortBy] = useState('rating');

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
    const apiKey = import.meta.env.VITE_RAWG_API_KEY; // Ambil dari .env
    const baseUrl = import.meta.env.VITE_API_BASE_URL; // Ambil base URL dari .env

      const platformIds = [];
      if (platforms.pc) platformIds.push(4); // PC
      if (platforms.playstation) platformIds.push(187); // Ps5
      if (platforms.xbox) platformIds.push(1); // Xbox 

      const platformParam = platformIds.length ? `&parent_platforms=${platformIds.join(',')}` : '';
      const searchParam = searchQuery ? `&search=${searchQuery}` : '';
      const url = `${baseUrl}/games?key=${apiKey}&page_size=20${searchParam}${platformParam}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('API error');
      const { results } = await response.json();
      
      // Transform data
      const transformed = results.map(game => ({
        ...game,
        release_date: game.released || 'N/A',  // Dari "released"
        rating: game.rating || 0,  // Dari "rating"
      }));
// Lalu sort dan setGames(transformed);

      // Sort
      const sorted = [...transformed].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.release_date) - new Date(a.release_date);
      });

      setGames(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []); // Initial fetch

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGames();
  };

  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setPlatforms(prev => ({ ...prev, [name]: checked }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const openDetail = async (slug) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseUrl}/games/${slug}?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      setSelectedGame(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Game Database</h1>
      </header>
      <main>
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          platforms={platforms}
          handlePlatformChange={handlePlatformChange}
          sortBy={sortBy}
          handleSortChange={handleSortChange}
          handleSubmit={handleSubmit}
        />
        {loading && <p aria-live="polite">Loading...</p>}
        {error && <p aria-live="assertive">Error: {error}</p>}
        <GameGrid games={games} openDetail={openDetail} />
        {selectedGame && (
          <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} />
        )}
      </main>
      <footer>
        <p>&copy; 2025 Game App</p>
      </footer>
    </div>
  );
};

export default App;