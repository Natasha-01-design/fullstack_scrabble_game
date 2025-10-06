import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import isWordValid from "../components/index";
import "./home-style.css";

const Home = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  
  useEffect(() => {
    console.log("--- Running word validation test ---");

    const runTest = async (word) => {
      const isValid = await isWordValid(word);
      console.log(`Is '${word}' a valid word? -> ${isValid}`);
    };

    runTest("hello");
    runTest("react");
    runTest("scrabble");

    fetch("http://127.0.0.1:5555/users")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);


  const newGame = async () => {
    try {
      const res = await fetch("http://localhost:5000/new-game", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create new game");
      const data = await res.json();
      navigate(`/game/${data.gameId}`, { state: data });
    } catch (error) {
      console.error(error);
      alert("Oops! Couldn't start a new game. Try again.");
    }
  };

  return (
    <div className="home-bg">
      <h1 className="home-title">Scrabble Game</h1>

      <Link to="/game" state={{ mode: "human" }}>
        <button className="home-btn">Play vs Human</button>
      </Link>

      <Link to="/game" state={{ mode: "computer" }}>
        <button className="home-btn">Play vs Computer</button>
      </Link>

      <div className="users-list">
        <h3>Registered Users:</h3>
        {users.length > 0 ? (
          <ul>
            {users.map((u) => (
              <li key={u.id}>{u.username}</li>
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
