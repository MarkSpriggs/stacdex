import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/landing.css";
import logo from "../assets/logo.png";

export default function Landing() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  return (
    <div className="landing-container">
      <div className="landing-box">
        <img src={logo} alt="StacDex logo" className="landing-logo" />
        <h1 className="landing-title">Welcome</h1>
        <p className="landing-subtitle">
          Manage, track, and value your sports card collection in one place.
        </p>
        <button className="landing-btn" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    </div>
  );
}
