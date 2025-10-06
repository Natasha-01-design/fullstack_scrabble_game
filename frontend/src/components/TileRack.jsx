

import React from "react";
import "./scrabble-style.css";

function TileRack({
  player,
  selectedTile,
  setSelectedTile,
  previewPlacement,
  setPreviewPlacement,
}) {
  const handleTileClick = (tile) => {
    setSelectedTile(tile);
  };

  const getRackTiles = () => {
    if (!previewPlacement || previewPlacement.length === 0) return player.rack;
    const usedLetters = previewPlacement.map((p) => p.tile.letter);
    const rackCopy = [...player.rack];
    usedLetters.forEach((letter) => {
      const idx = rackCopy.findIndex((t) => t.letter === letter);
      if (idx !== -1) rackCopy.splice(idx, 1);
    });
    return rackCopy;
  };

  const rackTiles = getRackTiles();

  return (
    <div className="tile-rack">
      <div className="tile-row">
        {rackTiles.map((tile, index) => (
          <div
            key={index}
            className={`tile ${selectedTile === tile ? "selected" : ""}`}
            onClick={() => handleTileClick(tile)}
          >
            {tile.letter} <span className="value">({tile.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TileRack;
