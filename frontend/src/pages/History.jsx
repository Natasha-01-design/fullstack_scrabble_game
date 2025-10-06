import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

function HistoryPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [showPlayers, setShowPlayers] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("/game/all_players_history", { withCredentials: true });
      setLeaderboard(res.data.leaderboard || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePlayers = async () => {
    if (showPlayers) return setShowPlayers(false);

    try {
      const res = await axios.get("/player/list", { withCredentials: true });
      if (res.status === 200 && res.data.players) {
        setPlayers(res.data.players);
        setShowPlayers(true);
      }
    } catch (err) {
      console.error("Error loading player data:", err);
    }
  };

  if (loading) return <p className="history-container">Loading leaderboard...</p>;
  if (leaderboard.length === 0)
    return <p className="history-container">No players or completed games yet.</p>;

  return (
    <div className="history-container">
      <h2> Players Board (Total Scores)</h2>

      {leaderboard.map((player) => (
        <div key={player.player_id} className="leaderboard-card">
          <h3>
            {player.username}     ({player.country})
          </h3>
          <p>Email: {player.email}</p>
          <p style={{ fontWeight: "bold", color: "#047857" }}>
             Total Accumulated Score: {player.total_score || 0}
          </p>

          {player.games.length === 0 ? (
            <p>No completed games yet.</p>
          ) : (
            <table className="table-auto">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Human Score</th>
                  <th>Computer Score</th>
                  <th>Played Words</th>
                </tr>
              </thead>
              <tbody>
                {player.games.map((game) => (
                  <tr key={game.game_id}>
                    <td>{new Date(game.created_at).toLocaleString()}</td>
                    <td>{game.human_score}</td>
                    <td>{game.computer_score}</td>
                    <td>
                      {game.played_words.length > 0
                        ? game.played_words.join(", ")
                        : "No words"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}

      <button onClick={handleTogglePlayers} className="toggle-btn">
        {showPlayers ? "Hide Player Data" : "Show Player Data"}
      </button>

      {showPlayers && (
        <div className="leaderboard-card">
          <h3>Registered Players</h3>
          <table className="table-auto">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Country</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.username}</td>
                  <td>{p.email}</td>
                  <td>{p.country}</td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
