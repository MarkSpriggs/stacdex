import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="dashboard-container">
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
      </div>
    </main>
  );
}
