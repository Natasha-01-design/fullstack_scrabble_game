import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GameMenu() {
  const [ongoingGame, setOngoingGame] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/game/load_game", { credentials: "include" })
      .then(r => {
        if (r.ok) return r.json();
        return null;
      })
      .then(game => setOngoingGame(game))
      .catch(() => setOngoingGame(null));
  }, []);

  const handleResume = () => {
    navigate("/game", { state: { game: ongoingGame } });
  };

  const handleNewGame = (mode) => {
    if (ongoingGame) {
      fetch("/game/complete_game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: ongoingGame.id }),
      });
    }
    navigate("/game", { state: { newGame: true, mode } });
  };

  return (
    <div className="menu-container">
      {ongoingGame ? (
        <div>
          <h2>You have an unfinished game.</h2>
          <button onClick={handleResume}>Resume Game</button>
          <button onClick={() => setOngoingGame(null)}>Start New Game</button>
        </div>
      ) : (
        <div>
          <h2>Start a New Game</h2>
          <button onClick={() => handleNewGame("computer")}>Play vs Computer</button>
          <button onClick={() => handleNewGame("human")}> Human Player</button>
        </div>
      )}
    </div>
  );
}

export default GameMenu;
