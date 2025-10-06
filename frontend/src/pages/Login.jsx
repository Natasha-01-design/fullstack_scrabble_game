import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";


function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/player/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (res.status === 404) {
        alert("Email not found, please sign up!");
        navigate("/signup");
        return;
      }

      if (!res.ok) throw new Error("Login failed");

      const user = await res.json();
      onLogin(user);

      
      const gameRes = await fetch("/game/load_game", { credentials: "include" });
      const gameData = await gameRes.json();

      if (gameRes.ok && gameData?.status === "ongoing") {
        console.log("Resuming ongoing game:", gameData);
        navigate("/game");
      } else {
        navigate("/menu");
      }

    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}

export default Login;
