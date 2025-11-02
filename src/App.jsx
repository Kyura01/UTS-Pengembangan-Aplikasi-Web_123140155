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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [platforms, setPlatforms] = useState({ pc: false, playstation: false, xbox: false });
  const [sortBy, setSortBy] = useState('rating');
  const [showTable, setShowTable] = useState(false);

  const fetchGames = async (p = page) => {
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
  const url = `${baseUrl}/games?key=${apiKey}&page=${p}&page_size=${pageSize}${searchParam}${platformParam}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('API error');
  const data = await response.json();
  const { results, count } = data;
  // Compute total pages from count and pageSize if available
  if (typeof count === 'number') setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
      
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
    // Fetch whenever page changes
    fetchGames(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // reset to first page when submitting a new search
    setPage(1);
    fetchGames(1);
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
        <h1>Kioku Games</h1>
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

        <div className="results-controls">
          <h2 className="results-title">Results</h2>
          <div className="view-toggle" role="tablist" aria-label="View toggle">
            <button
              className={`toggle-btn ${!showTable ? 'active' : ''}`}
              onClick={() => setShowTable(false)}
              role="tab"
              aria-selected={!showTable}
            >
              Cards
            </button>
            <button
              className={`toggle-btn ${showTable ? 'active' : ''}`}
              onClick={() => setShowTable(true)}
              role="tab"
              aria-selected={showTable}
            >
              Table
            </button>
          </div>
        </div>

        {showTable ? (
          <section aria-label="Games Table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Rating</th>
                  <th>Release</th>
                </tr>
              </thead>
              <tbody>
                {games.map(g => (
                  <tr key={g.id} onClick={() => openDetail(g.slug)} style={{ cursor: 'pointer' }} role="button">
                    <td>{g.id}</td>
                    <td>{g.name}</td>
                    <td>{g.rating}</td>
                    <td>{g.release_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <GameGrid games={games} openDetail={openDetail} />
        )}
        {/* Pagination controls */}
        <nav className="pagination" aria-label="Pagination">
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>

          <div className="page-list" aria-hidden>
            Page {page} / {totalPages}
          </div>

          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next ›
          </button>
        </nav>
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