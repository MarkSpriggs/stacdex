// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import avatar from "../assets/default-avatar.png"
import "../styles/navbar.css";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    navigate("/account");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <nav className="navbar">
      {/* Logo on left */}
      <Link to="/dashboard" className="navbar-logo">
        <img src={logo} alt="StacDex Logo" />
      </Link>

      {/* Greeting in center */}
      {user && (
        <div className="navbar-greeting">
          {getGreeting()}, {user.name || "User"}
        </div>
      )}

      {/* Profile / Account on right */}
      {user && (
        <div className="navbar-account" onClick={handleAccountClick}>
          <img
            src={user.profile_picture || avatar}
            alt="Account"
            className="navbar-avatar"
          />
        </div>
      )}
    </nav>
  );
}
