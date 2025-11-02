// src/components/SearchForm.jsx
import React from 'react';

const SearchForm = ({
  searchQuery,
  setSearchQuery,
  platforms,
  handlePlatformChange,
  sortBy,
  handleSortChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} aria-label="Search Form" className="search-controls">
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search games..."
          aria-label="Search games"
        />
        <button type="submit" className="search-btn">Search</button>
      </div>

      <div className="filters" role="group" aria-label="Platform filters">
        <label className="filter-chip">
          <input
            type="checkbox"
            name="pc"
            checked={platforms.pc}
            onChange={handlePlatformChange}
          />
          <span>PC</span>
        </label>

        <label className="filter-chip">
          <input
            type="checkbox"
            name="playstation"
            checked={platforms.playstation}
            onChange={handlePlatformChange}
          />
          <span>PlayStation</span>
        </label>

        <label className="filter-chip">
          <input
            type="checkbox"
            name="xbox"
            checked={platforms.xbox}
            onChange={handlePlatformChange}
          />
          <span>Xbox</span>
        </label>
      </div>

      <div className="sort-wrap">
        <select value={sortBy} onChange={handleSortChange} className="sort-select">
          <option value="rating">Sort by Rating</option>
          <option value="release">Sort by Release Date</option>
        </select>
      </div>
    </form>
  );
};

export default SearchForm;