import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "./Winner.css";

function WinnerPage() {
  const location = useLocation();
  const { players, winner, gameId } = location.state || {};

  useEffect(() => {
    if (gameId) {
      fetch("/game/complete_game", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      })
        .then(res => res.json())
        .then(data => console.log("✅ Game marked completed:", data))
        .catch(err => console.error("Error completing game:", err));
    }
  }, [gameId]);

  if (!players || !winner) {
    return (
      <div className="winner-container">
        <h1>No game data available</h1>
        <p>Please play a game to view results.</p>
        <Link to="/">
          <button className="new-game-button">Back to Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="winner-container">
      <div className="score-box">
        <h2>Final Scores</h2>
        <div className="score-row">
          {players.map((player, index) => (
            <div key={index}>
              <strong>{player.name}</strong>
              <div className="score-value">{player.score}</div>
            </div>
          ))}
        </div>
      </div>

      {winner === "It's a tie!" ? (
        <h1 className="winner-text">It's a Tie!</h1>
      ) : (
        <h1 className="winner-text">{winner} Wins!</h1>
      )}

      <Link to="/">
        <button className="new-game-button">New Game</button>
      </Link>
    </div>
  );
}

export default WinnerPage;
