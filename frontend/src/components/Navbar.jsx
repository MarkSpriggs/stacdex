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
    if (hour < 12) return "good morning";
    if (hour < 18) return "good afternoon";
    return "good evening";
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return (
        <svg className="navbar-greeting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    }
    if (hour < 18) {
      return (
        <svg className="navbar-greeting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    }
    return (
      <svg className="navbar-greeting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  };

  return (
    <nav className="navbar">
      {/* Logo on left */}
      <Link to="/dashboard" className="navbar-logo">
        <img src={logo} alt="StacDex Logo" />
      </Link>

      {/* Greeting and Profile on right */}
      {user && (
        <div className="navbar-right">
          <div className="navbar-greeting">
            {getGreetingIcon()}
            <div className="navbar-greeting-text">
              <span className="greeting-message">{getGreeting()}</span>
              <span className="greeting-name">{user.name || "User"}</span>
            </div>
          </div>
          <div className="navbar-account" onClick={handleAccountClick}>
            <img
              src={user.profile_picture || avatar}
              alt="Account"
              className="navbar-avatar"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
