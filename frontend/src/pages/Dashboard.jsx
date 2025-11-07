import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <main className="dashboard-container">
      {user && (
        <div className="dashboard-greeting">
          {getGreeting()}, {user.name || "User"}
        </div>
      )}

      <div className="dashboard-grid">
        <div
          className="dashboard-card featured-card"
          onClick={() => navigate("/dashboard/inventory")}
        >
          <div className="card-icon">📦</div>
          <h2>Inventory Search</h2>
          <p>View and filter your entire card collection.</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/dashboard/add")}
        >
          <div className="card-icon">➕</div>
          <h2>Add New Card</h2>
          <p>Quickly add new cards to your inventory.</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/dashboard/analytics")}
        >
          <div className="card-icon">📊</div>
          <h2>Analytics</h2>
          <p>Track total value and stats of your collection.</p>
        </div>

        <div className="dashboard-card coming-soon-card">
          <div className="card-icon">👥</div>
          <h2>Friends List</h2>
          <p>Connect with friends and compare collections.</p>
          <span className="coming-soon-badge">Coming Soon</span>
        </div>
      </div>
    </main>
  );
}
