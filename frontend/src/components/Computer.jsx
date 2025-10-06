

import Dictionary from "./Dictionary";
import generateBag from "./TileBag";


const canFormWordFromRack = (word, rack) => {
  const rackCopy = [...rack.map((t) => t.letter)];
  for (const letter of word) {
    const idx = rackCopy.indexOf(letter);
    if (idx === -1) return false;
    rackCopy.splice(idx, 1);
  }
  return true;
};


const findAnchors = (board) => {
  const anchors = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c].tile) {
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
          const nr = r + dr,
            nc = c + dc;
          if (
            nr >= 0 &&
            nr < 15 &&
            nc >= 0 &&
            nc < 15 &&
            !board[nr][nc].tile
          ) {
            anchors.push({ row: nr, col: nc });
          }
        });
      }
    }
  }
  if (anchors.length === 0) anchors.push({ row: 7, col: 7 });
  return anchors;
};


const tryPlaceWord = (board, word, row, col, direction) => {
  const placement = [];
  for (let i = 0; i < word.length; i++) {
    const r = direction === "H" ? row : row + i;
    const c = direction === "H" ? col + i : col;
    if (r < 0 || r >= 15 || c < 0 || c >= 15) return null;
    if (board[r][c].tile && board[r][c].tile.letter !== word[i]) return null;
    placement.push({
      row: r,
      col: c,
      tile: { letter: word[i], value: getLetterValue(word[i]) },
    });
  }
  return placement;
};


const scoreWord = (board, placement) => {
  let score = 0,
    wordMultiplier = 1;
  for (const p of placement) {
    const cell = board[p.row][p.col];
    const letterScore =
      p.tile.value *
      (!cell.tile
        ? cell.bonus === "DL"
          ? 2
          : cell.bonus === "TL"
          ? 3
          : 1
        : 1);
    if (!cell.tile) {
      if (cell.bonus === "DW") wordMultiplier *= 2;
      if (cell.bonus === "TW") wordMultiplier *= 3;
    }
    score += letterScore;
  }
  return score * wordMultiplier;
};


const getLetterValue = (letter) => {
  const bag = generateBag();
  const tile = bag.find((t) => t.letter === letter);
  return tile ? tile.value : 0;
};


export const Computer = async (game, rack, dictionary = Dictionary) => {
  let bestMove = null;
  let bestScore = 0;
  const anchors = findAnchors(game.board);
  const allWords = await dictionary.getAllWords(); 

  for (const word of allWords) {
    if (!canFormWordFromRack(word, rack)) continue;
    if (game.playedWords.includes(word)) continue;

    for (const anchor of anchors) {
      for (const dir of ["H", "V"]) {
        const placement = tryPlaceWord(
          game.board,
          word,
          anchor.row,
          anchor.col,
          dir
        );
        if (!placement) continue;
        const score = scoreWord(game.board, placement);
        if (score > bestScore) {
          bestScore = score;
          bestMove = { word, placement, score };
        }
      }
    }
  }

  return bestMove;
};
