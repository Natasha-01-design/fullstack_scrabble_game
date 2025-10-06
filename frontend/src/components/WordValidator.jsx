import isWordValid from "./index";

function WordValidator({
  board,
  currentPlayer,
  setBoard,
  setPlayers,
  currentPlayerIndex,
  tileBag,
  setTileBag,
  setSelectedTile,
  setWordScore,
  children,
  previewPlacement = [],
  validateWord = isWordValid,
  handleTurnAdvance
}) {
  const playWord = async () => {
    if (previewPlacement.length === 0) {
      alert("Place at least one tile before submitting a word.");
      return;
    }

    
    const newTiles = previewPlacement.map(p => ({
      row: p.row,
      col: p.col,
      ...p.tile,
      bonus: board[p.row][p.col].bonus,
      isNew: true
    }));

    const undoPlacedTiles = () => {
      setBoard(prev => prev.map(row =>
        row.map(cell => {
          const placed = newTiles.find(t => t.row === cell.row && t.col === cell.col);
          if (placed) return { ...cell, tile: null };
          return cell;
        })
      ));

      setPlayers(prev => {
        const updated = [...prev];
        const rack = [...updated[currentPlayerIndex].rack];
        newTiles.forEach(t => rack.push({ letter: t.letter, value: t.value }));
        updated[currentPlayerIndex].rack = rack.slice(0, 7);
        return updated;
      });

      setSelectedTile(null);
    };

    
    const rows = newTiles.map(t => t.row);
    const cols = newTiles.map(t => t.col);
    const isSameRow = rows.every(r => r === rows[0]);
    const isSameCol = cols.every(c => c === cols[0]);

    if (!(isSameRow || isSameCol)) {
      alert("All tiles must be in the same row or same column.");
      undoPlacedTiles();
      return;
    }

    
    const isFirstMove = board.every(row => row.every(cell => !cell.tile));
    if (isFirstMove && !newTiles.some(t => t.row === 7 && t.col === 7)) {
      alert("First word must cover the center tile (★ at H8).");
      undoPlacedTiles();
      return;
    }

  
    if (!isFirstMove) {
      const isConnected = newTiles.some(({ row, col }) => {
        const neighbors = [
          board[row - 1]?.[col],
          board[row + 1]?.[col],
          board[row]?.[col - 1],
          board[row]?.[col + 1]
        ];
        return neighbors.some(n => n?.tile && !n.tile.isNew);
      });
      if (!isConnected) {
        alert("New word must connect to existing tiles.");
        undoPlacedTiles();
        return;
      }
    }

    
    const getWord = (row, col, horizontal) => {
      let word = "";
      let r = row, c = col;

      
      while (
        board[r - (horizontal ? 0 : 1)]?.[c - (horizontal ? 1 : 0)]?.tile ||
        newTiles.some(t => t.row === r - (horizontal ? 0 : 1) && t.col === c - (horizontal ? 1 : 0))
      ) {
        r -= horizontal ? 0 : 1;
        c -= horizontal ? 1 : 0;
      }

      
      while (board[r]?.[c]?.tile || newTiles.some(t => t.row === r && t.col === c)) {
        const tile = board[r]?.[c]?.tile || newTiles.find(t => t.row === r && t.col === c);
        word += tile.letter;
        r += horizontal ? 0 : 1;
        c += horizontal ? 1 : 0;
      }
      return word;
    };

    
    const words = [];
    const isHorizontal = isSameRow;
    const mainTile = isHorizontal
      ? newTiles.reduce((min, t) => (t.col < min.col ? t : min), newTiles[0])
      : newTiles.reduce((min, t) => (t.row < min.row ? t : min), newTiles[0]);
    const mainWord = getWord(mainTile.row, mainTile.col, isHorizontal);
    if (mainWord.length > 1) words.push(mainWord);

    newTiles.forEach(t => {
      const crossWord = getWord(t.row, t.col, !isHorizontal);
      if (crossWord.length > 1) words.push(crossWord);
    });

    
    for (const w of words) {
      const valid = await validateWord(w);
      if (!valid) {
        alert(`"${w}" is not a valid word.`);
        undoPlacedTiles();
        return;
      }
    }

    
    let totalScore = 0;
    newTiles.forEach(t => {
      if (t.bonus === "DL") totalScore += t.value * 2;
      else if (t.bonus === "TL") totalScore += t.value * 3;
      else totalScore += t.value;
    });

    let wordMultiplier = 1;
    newTiles.forEach(t => {
      if (t.bonus === "DW") wordMultiplier *= 2;
      if (t.bonus === "TW") wordMultiplier *= 3;
    });

    const finalScore = totalScore * wordMultiplier;


    setBoard(prev =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          const tile = newTiles.find(t => t.row === r && t.col === c);
          if (tile) {
            const copy = { ...tile };
            delete copy.isNew;
            return { ...cell, tile: copy };
          }
          return cell;
        })
      )
    );

    setPlayers(prev => {
      const updated = [...prev];
      updated[currentPlayerIndex].score += finalScore;

      const rack = [...updated[currentPlayerIndex].rack];
      newTiles.forEach(t => {
        const idx = rack.findIndex(tile => tile.letter === t.letter);
        if (idx !== -1) rack.splice(idx, 1);
      });

      while (rack.length < 7 && tileBag.length > 0) rack.push(tileBag.pop());
      updated[currentPlayerIndex].rack = rack;

      return updated;
    });

    setTileBag([...tileBag]);
    setWordScore(finalScore);
    setSelectedTile(null);
    if (handleTurnAdvance) handleTurnAdvance();

    return { placement: newTiles, score: finalScore };
  };

  return <>{children({ playWord })}</>;
}

export default WordValidator;
