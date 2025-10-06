import { Link } from "react-router-dom";
import "./component.css";

function NavBar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/">Home</Link> |{" "}
        <Link to="/game">Game</Link> |{" "}
        <Link to="/history">History</Link>
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <span>Hi, {user.username}</span>
            <button className="logout" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link> |{" "}
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
