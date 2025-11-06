import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-container">
        <h1 className="dashboard-title">
          Welcome, {user?.name || "User"} 👋
        </h1>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Inventory Search</h2>
            <p>View and filter your entire card collection.</p>
          </div>

          <div className="dashboard-card">
            <h2>Add New Card</h2>
            <p>Quickly add new cards to your inventory.</p>
          </div>

          <div className="dashboard-card">
            <h2>Analytics</h2>
            <p>Track total value and stats of your collection.</p>
          </div>
        </div>
      </main>
    </>
  );
}
