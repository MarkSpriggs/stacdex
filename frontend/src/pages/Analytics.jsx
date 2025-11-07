import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/analytics.css";

export default function Analytics() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchItems();
    }
  }, [token]);

  // Calculate analytics
  const totalCards = items.length;
  const totalValue = items.reduce((sum, item) => sum + (Number(item.market_value) || 0), 0);
  const averageValue = totalCards > 0 ? totalValue / totalCards : 0;

  // Count by status
  const statusCounts = items.reduce((acc, item) => {
    const status = item.status_name || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Count by category
  const categoryCounts = items.reduce((acc, item) => {
    const category = item.category_name || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Calculate value by category
  const categoryValues = items.reduce((acc, item) => {
    const category = item.category_name || "Unknown";
    const value = Number(item.market_value) || 0;
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {});

  // Count rookie cards
  const rookieCount = items.filter((item) => item.rookie).length;

  // Count autographs
  const autographCount = items.filter((item) => item.autograph).length;

  // Count graded cards
  const gradedCount = items.filter((item) => item.grading_company_name).length;

  // Top 5 most valuable cards
  const topCards = [...items]
    .sort((a, b) => (Number(b.market_value) || 0) - (Number(a.market_value) || 0))
    .slice(0, 5);

  if (loading) {
    return <div className="analytics-page">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-message">
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Collection Analytics</h1>
      </div>

      <div className="analytics-grid">
        {/* Summary Stats */}
        <div className="stat-card featured">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Collection Value</h3>
            <p className="stat-value">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Cards</h3>
            <p className="stat-value">{totalCards}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Average Value</h3>
            <p className="stat-value">${averageValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Rookie Cards</h3>
            <p className="stat-value">{rookieCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-content">
            <h3>Autographs</h3>
            <p className="stat-value">{autographCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Graded Cards</h3>
            <p className="stat-value">{gradedCount}</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="analytics-section">
          <h2>Cards by Status</h2>
          <div className="breakdown-list">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="breakdown-item">
                <span className="breakdown-label">{status}</span>
                <div className="breakdown-bar-container">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${(count / totalCards) * 100}%` }}
                  ></div>
                </div>
                <span className="breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="analytics-section">
          <h2>Cards by Category</h2>
          <div className="breakdown-list">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category} className="breakdown-item">
                <span className="breakdown-label">{category}</span>
                <div className="breakdown-bar-container">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${(count / totalCards) * 100}%` }}
                  ></div>
                </div>
                <span className="breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Value by Category */}
        <div className="analytics-section">
          <h2>Value by Category</h2>
          <div className="breakdown-list">
            {Object.entries(categoryValues)
              .sort(([, a], [, b]) => b - a)
              .map(([category, value]) => (
                <div key={category} className="breakdown-item">
                  <span className="breakdown-label">{category}</span>
                  <div className="breakdown-bar-container">
                    <div
                      className="breakdown-bar value-bar"
                      style={{ width: `${(value / totalValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="breakdown-count">
                    ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Top 5 Most Valuable Cards */}
        <div className="analytics-section full-width">
          <h2>Top 5 Most Valuable Cards</h2>
          <div className="top-cards-list">
            {topCards.length > 0 ? (
              topCards.map((card, index) => (
                <div
                  key={card.id}
                  className="top-card-item"
                  onClick={() => navigate(`/dashboard/inventory/${card.id}`)}
                >
                  <div className="top-card-rank">#{index + 1}</div>
                  <img
                    src={card.image_url || "/default_card.png"}
                    alt={card.title}
                    className="top-card-image"
                  />
                  <div className="top-card-info">
                    <h4>{card.title}</h4>
                    <p className="top-card-details">
                      {card.player_name && <span>{card.player_name}</span>}
                      {card.year && <span> • {card.year}</span>}
                      {card.rookie && <span> • Rookie</span>}
                    </p>
                  </div>
                  <div className="top-card-value">
                    ${Number(card.market_value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No cards in collection yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
