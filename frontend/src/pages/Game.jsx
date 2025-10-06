import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ScrabbleBoard from "../components/ScrabbleBoard";
import TileRack from "../components/TileRack";
import WordValidator from "../components/WordValidator";
import generateBag from "../components/TileBag";
import { Computer } from "../components/Computer";
import Dictionary from "../components/Dictionary";
import "../components/scrabble-style.css";

const BONUS_TEMPLATE = [
  ["TW","","","DL","","","","TW","","","","DL","","","TW"],
  ["","DW","","","","TL","","","","TL","","","","DW",""],
  ["","","DW","","","","DL","","DL","","","","DW","",""],
  ["DL","","","DW","","","","DL","","","","DW","","","DL"],
  ["","","","","DW","","","","","","DW","","","",""],
  ["","TL","","","","TL","","","","TL","","","","TL",""],
  ["","","DL","","","","DL","","DL","","","","DL","",""],
  ["TW","","","DL","","","","*","","","","DL","","","TW"],
  ["","","DL","","","","DL","","DL","","","","DL","",""],
  ["","TL","","","","TL","","","","TL","","","","TL",""],
  ["","","","","DW","","","","","","DW","","","",""],
  ["DL","","","DW","","","","DL","","","","DW","","","DL"],
  ["","","DW","","","","DL","","DL","","","","DW","",""],
  ["","DW","","","","TL","","","","TL","","","","DW",""],
  ["TW","","","DL","","","","TW","","","","DL","","","TW"]
];

const generateEmptyBoard = () =>
  BONUS_TEMPLATE.map(row => row.map(b => ({ tile: null, bonus: b || null })));

function Game() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnCounts, setTurnCounts] = useState([0, 0]);
  const [board, setBoard] = useState(generateEmptyBoard());
  const [tileBag, setTileBag] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [previewPlacement, setPreviewPlacement] = useState([]);
  const [choiceMade, setChoiceMade] = useState(false);
  const [playedWords, setPlayedWords] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passCount, setPassCount] = useState(0);

  const [lastSavedWords, setLastSavedWords] = useState([]);
  const [lastSavedScores, setLastSavedScores] = useState({ human: 0, computer: 0 });

  const currentPlayer = players[currentPlayerIndex];
  const MAX_TURNS = 5;

  
  useEffect(() => {
    const loadLastGame = async () => {
      try {
        const res = await axios.get("/game/load_game", { withCredentials: true });
        const data = res.data;

        if (data && data.status === "ongoing") {
          setBoard(data.board || generateEmptyBoard());
          setPlayers([
            { name: "User", score: data.human_score || 0, rack: data.player1_rack || [] },
            { name: "Computer", score: data.computer_score || 0, rack: data.player2_rack || [] },
          ]);
          setPlayedWords(data.played_words || []);
          setLastSavedWords(data.played_words || []);
          setLastSavedScores({
            human: data.human_score || 0,
            computer: data.computer_score || 0,
          });
          setTileBag(data.tile_bag || []);
          setGameId(data.id);
          setChoiceMade(true);
          setCurrentPlayerIndex(data.is_player_turn ? 0 : 1);
          return;
        }
      } catch (err) {
        console.error(" Error loading previous game:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLastGame();
  }, []);

  
  const saveGameState = async (status = "ongoing") => {
    if (!players.length) return;

    try {
      const newHumanScore = players[0]?.score || 0;
      const newComputerScore = players[1]?.score || 0;

      // Add new round’s score to previous totals
      const totalHumanScore = lastSavedScores.human + newHumanScore;
      const totalComputerScore = lastSavedScores.computer + newComputerScore;

      // Only send new words not already saved
      const newWords = playedWords.filter(w => !lastSavedWords.includes(w));

      const res = await axios.post(
        "/game/save_game",
        {
          game_id: gameId,
          board,
          is_player_turn: currentPlayerIndex === 0,
          player1_rack: players[0]?.rack || [],
          player2_rack: players[1]?.rack || [],
          played_words: newWords,
          human_score: totalHumanScore,
          computer_score: totalComputerScore,
          status,
        },
        { withCredentials: true }
      );

      const data = res.data;
      if (data?.game_id) setGameId(data.game_id);
      setLastSavedWords(prev => [...prev, ...newWords]);
      setLastSavedScores({ human: totalHumanScore, computer: totalComputerScore });
    } catch (err) {
      console.error(" Error saving game:", err);
    }
  };

  
  const refillRack = (rack, bag) => {
    const newRack = [...rack];
    while (newRack.length < 7 && bag.length > 0) {
      newRack.push(bag.shift());
    }
    return [newRack, bag];
  };

  
  const handleTurnAdvance = async () => {
    if (!players.length) return;

    const newCounts = [...turnCounts];
    newCounts[currentPlayerIndex] += 1;

    
    if (passCount >= 4 || (tileBag.length === 0 && currentPlayer.rack.length === 0)) {
      const winner =
        players[0].score > players[1]?.score
          ? players[0].name
          : players[1]?.score > players[0].score
          ? players[1].name
          : "It's a tie!";

      await saveGameState("completed");
      await axios.post("/game/complete_game", { game_id: gameId }, { withCredentials: true });

      navigate("/winner", { state: { players, winner, gameId } });
      return;
    }

    await saveGameState("ongoing");
    setTurnCounts(newCounts);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    setSelectedTile(null);
    setPreviewPlacement([]);
  };

  const handlePass = async () => {
    setPassCount(prev => prev + 1);
    await handleTurnAdvance();
  };

  
  const startNewGame = async (mode) => {
    if (gameId) {
      alert("Resuming your existing game!");
      setChoiceMade(true);
      return;
    }

    const bag = generateBag();
    const setupPlayers =
      mode === "computer"
        ? [
            { name: "User", score: 0, rack: bag.splice(0, 7) },
            { name: "Computer", score: 0, rack: bag.splice(0, 7) },
          ]
        : [
            { name: "Player 1", score: 0, rack: bag.splice(0, 7) },
            { name: "Player 2", score: 0, rack: bag.splice(0, 7) },
          ];

    setPlayers(setupPlayers);
    setBoard(generateEmptyBoard());
    setTileBag(bag);
    setCurrentPlayerIndex(0);
    setTurnCounts([0, 0]);
    setPlayedWords([]);
    setChoiceMade(true);
    setPreviewPlacement([]);
    setPassCount(0);

    try {
      const res = await axios.post(
        "/game/save_game",
        {
          board: generateEmptyBoard(),
          is_player_turn: true,
          player1_rack: setupPlayers[0]?.rack || [],
          player2_rack: setupPlayers[1]?.rack || [],
          played_words: [],
          human_score: 0,
          computer_score: 0,
          status: "ongoing",
        },
        { withCredentials: true }
      );

      if (res.data?.game_id) setGameId(res.data.game_id);
    } catch (err) {
      console.error("Error creating game:", err);
    }
  };

  // Computer
  useEffect(() => {
    if (!choiceMade) return;
    if (currentPlayer?.name === "Computer") {
      const runAI = async () => {
        const bestMove = await Computer(
          { board, playedWords, tileBag },
          currentPlayer.rack,
          Dictionary
        );

        if (!bestMove) return handlePass();

        const { word, placement, score } = bestMove;

        const newBoard = board.map((row, r) =>
          row.map((cell, c) =>
            placement.find(p => p.row === r && p.col === c)
              ? { ...cell, tile: placement.find(p => p.row === r && p.col === c).tile }
              : cell
          )
        );

        let newRack = [...currentPlayer.rack];
        placement.forEach(p => {
          const idx = newRack.findIndex(t => t.letter === p.tile.letter);
          if (idx !== -1) newRack.splice(idx, 1);
        });

        const [refilledRack, newBag] = refillRack(newRack, tileBag);

        setBoard(newBoard);
        setPlayers(prev => {
          const copy = [...prev];
          copy[currentPlayerIndex].score += score;
          copy[currentPlayerIndex].rack = refilledRack;
          return copy;
        });
        setTileBag([...newBag]);
        setPlayedWords(prev => [...prev, word]);
        setPassCount(0);
        setPreviewPlacement([]);
        await saveGameState("ongoing");
        handleTurnAdvance();
      };
      setTimeout(runAI, 300);
    }
  }, [currentPlayerIndex, choiceMade]);

  // human 
  const handlePlayWord = async (playWordFn) => {
    const move = await playWordFn();
    if (!move || move.error) {
      alert(move?.error || "Invalid move!");
      setPreviewPlacement([]);
      return;
    }

    const { word, placement, score } = move;

    const newBoard = board.map((row, r) =>
      row.map((cell, c) =>
        placement.find(p => p.row === r && p.col === c)
          ? { ...cell, tile: placement.find(p => p.row === r && p.col === c).tile }
          : cell
      )
    );

    let newRack = [...currentPlayer.rack];
    placement.forEach(p => {
      const idx = newRack.findIndex(t => t.letter === p.tile.letter);
      if (idx !== -1) newRack.splice(idx, 1);
    });

    const [refilledRack, newBag] = refillRack(newRack, tileBag);

    setBoard(newBoard);
    setPlayers(prev => {
      const copy = [...prev];
      copy[currentPlayerIndex].score += score;
      copy[currentPlayerIndex].rack = refilledRack;
      return copy;
    });
    setTileBag([...newBag]);
    setPlayedWords(prev => [...prev, word]);
    setPassCount(0);
    await saveGameState("ongoing");
    setPreviewPlacement([]);
    handleTurnAdvance();
  };

  if (loading) return <div className="loading-screen">Loading game...</div>;

  if (!choiceMade) {
    return (
      <div className="game-choice">
        <h2>Welcome to Scrabble</h2>
        <button onClick={() => startNewGame("computer")}>Play vs Computer</button>
        <button onClick={() => startNewGame("human")}>Play vs Yourself</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <ScrabbleBoard
        board={board}
        selectedTile={selectedTile}
        setSelectedTile={setSelectedTile}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        previewPlacement={previewPlacement}
        setPreviewPlacement={setPreviewPlacement}
      />

      <TileRack
        player={currentPlayer}
        selectedTile={selectedTile}
        setSelectedTile={setSelectedTile}
        previewPlacement={previewPlacement}
        setPreviewPlacement={setPreviewPlacement}
      />

      <div className="sidebar">
        <h2>{currentPlayer?.name}'s Turn</h2>
        <p>Score: {currentPlayer?.score}</p>

        <WordValidator
          board={board}
          previewPlacement={previewPlacement}
          currentPlayer={currentPlayer}
          setBoard={setBoard}
          setPlayers={setPlayers}
          currentPlayerIndex={currentPlayerIndex}
          tileBag={tileBag}
          setTileBag={setTileBag}
        >
          {({ playWord }) => (
            <button
              className="play-button"
              onClick={() => handlePlayWord(playWord)}
              disabled={previewPlacement.length === 0}
            >
              Play Word
            </button>
          )}
        </WordValidator>

        <button className="pass-button" onClick={handlePass}>PASS</button>
      </div>
    </div>
  );
}

export default Game;
