import React from 'react';
import './scrabble-style.css';

function ScrabbleBoard({
  board,
  selectedTile,
  setSelectedTile,
  players,
  setPlayers,
  currentPlayerIndex,
  previewPlacement,
  setPreviewPlacement,
}) {
  const handleCellClick = (rowIndex, colIndex) => {
    if (!selectedTile) return;
    const cell = board[rowIndex][colIndex];
    if (cell.tile && !cell.tile.isNew) return;

    // Add to previewPlacement instead of board directly
    const existingIndex = previewPlacement.findIndex(
      (p) => p.row === rowIndex && p.col === colIndex
    );
    let newPreview = [...previewPlacement];

    if (existingIndex !== -1) {
      newPreview[existingIndex] = {
        row: rowIndex,
        col: colIndex,
        tile: { ...selectedTile, isNew: true },
      };
    } else {
      newPreview.push({
        row: rowIndex,
        col: colIndex,
        tile: { ...selectedTile, isNew: true },
      });
    }

    setPreviewPlacement(newPreview);

    
    const updatedPlayers = [...players];
    const rack = [...updatedPlayers[currentPlayerIndex].rack];
    const tileIndex = rack.findIndex(
      (t) => t.letter === selectedTile.letter && t.value === selectedTile.value
    );
    if (tileIndex !== -1) rack.splice(tileIndex, 1);
    updatedPlayers[currentPlayerIndex].rack = rack;

    setPlayers(updatedPlayers);
    setSelectedTile(null);
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const previewTile = previewPlacement.find(
            (p) => p.row === rowIndex && p.col === colIndex
          )?.tile;
          const tileToShow = previewTile || cell.tile;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${cell.bonus || ''}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {tileToShow
                ? `${tileToShow.letter} (${tileToShow.value})`
                : cell.bonus === '*'
                ? '★'
                : cell.bonus}
            </div>
          );
        })
      )}
    </div>
  );
}

export default ScrabbleBoard;
