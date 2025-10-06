import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/player/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        country,
        password,
        password_confirmation: passwordConfirmation
      }),
    })
      .then(r => r.json().then(data => {
        if (r.ok) {
          alert("Signup successful! Please log in.");
          navigate("/login");
        } else setErrors(data.error || ["Signup failed"]);
      }))
      .catch(err => console.error(err));
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      {errors.length > 0 && <ul>{errors.map((e,i)=> <li key={i}>{e}</li>)}</ul>}
      <form onSubmit={handleSubmit}>
        <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required />
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input type="text" value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
        <input type="password" value={passwordConfirmation} onChange={e=>setPasswordConfirmation(e.target.value)} placeholder="Confirm Password" required />
        <button type="submit">Signup</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Signup;
