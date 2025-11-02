// src/components/GameGrid.jsx
import React from 'react';

const GameGrid = ({ games, openDetail }) => {
  return (
    <section aria-label="Game List">
      <table>
        <thead>
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Rating</th>
            <th>Release Date</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id} onClick={() => openDetail(game.slug)} role="button" tabIndex={0}>
              <td><img src={game.background_image} alt={`${game.name} cover`} /></td>
              <td>{game.name}</td>
              <td>{game.rating}/5</td>
              <td>{game.release_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default GameGrid;