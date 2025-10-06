import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import Game from "./pages/Game";
import Home from './pages/Home';
import WinnerPage from './pages/Winner';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GameMenu from './pages/GameMenu';
import HistoryPage from './pages/History';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/player/check_loggedin")
      .then(r => {
        if (r.ok) {
          return r.json();
        } else {
          return null;
        }
      })
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = (user) => setUser(user);
  const handleLogout = () => {
    fetch("/player/logout", { method: "DELETE" }).then(() => setUser(null));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<GameMenu />} />
            <Route path="/game" element={<Game />} />
            <Route path="/winner" element={<WinnerPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
