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
    <form onSubmit={handleSubmit} aria-label="Search Form">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search games..."
        required
        pattern=".{3,}" // Minimal 3 char
        title="Minimal 3 karakter"
      />
      <label>
        <input
          type="checkbox"
          name="pc"
          checked={platforms.pc}
          onChange={handlePlatformChange}
        />
        PC
      </label>
      <label>
        <input
          type="checkbox"
          name="playstation"
          checked={platforms.playstation}
          onChange={handlePlatformChange}
        />
        PlayStation
      </label>
      <label>
        <input
          type="checkbox"
          name="xbox"
          checked={platforms.xbox}
          onChange={handlePlatformChange}
        />
        Xbox
      </label>
      <select value={sortBy} onChange={handleSortChange}>
        <option value="rating">Sort by Rating</option>
        <option value="release">Sort by Release Date</option>
      </select>
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchForm;