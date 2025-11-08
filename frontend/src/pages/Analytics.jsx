import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/analytics.css";
import DefaultCard from "../assets/default_card.png";

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

  // Count by specific statuses
  const listedCount = items.filter((item) => item.status_name === "Listed").length;
  const unlistedCount = items.filter((item) => item.status_name === "Unlisted").length;
  const soldCount = items.filter((item) => item.status_name === "Sold").length;
  const shippingCount = items.filter((item) => item.status_name === "Shipping").length;
  const archivedCount = items.filter((item) => item.status_name === "Archived").length;

  // Count numbered and patch cards
  const numberedCount = items.filter((item) => item.numbered_to && item.numbered_to > 0).length;
  const patchCount = items.filter((item) => item.patch_count && item.patch_count > 0).length;

  // Top 5 most valuable cards
  const topCards = [...items]
    .sort((a, b) => (Number(b.market_value) || 0) - (Number(a.market_value) || 0))
    .slice(0, 5);

  // Navigation helper to go to inventory with filters
  const navigateToFilteredInventory = (filterType, filterValue) => {
    const params = new URLSearchParams();

    switch(filterType) {
      case 'status':
        params.set('status', filterValue);
        break;
      case 'rookie':
        params.set('rookieOnly', 'true');
        break;
      case 'autograph':
        params.set('autographOnly', 'true');
        break;
      case 'graded':
        params.set('graded', 'true');
        break;
      case 'numbered':
        params.set('numberedOnly', 'true');
        break;
      case 'patch':
        params.set('patchedOnly', 'true');
        break;
      case 'category':
        params.set('category', filterValue);
        break;
    }

    navigate(`/dashboard/inventory?${params.toString()}`);
  };

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
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <div className="stat-content">
            <h3>Total Collection Value</h3>
            <p className="stat-value">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/dashboard/inventory')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <div className="stat-content">
            <h3>Total Cards</h3>
            <p className="stat-value">{totalCards}</p>
          </div>
        </div>

        <div className="stat-card">
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <div className="stat-content">
            <h3>Average Value</h3>
            <p className="stat-value">${averageValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('status', 'Listed')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <div className="stat-content">
            <h3>Listed</h3>
            <p className="stat-value">{listedCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('status', 'Unlisted')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
          <div className="stat-content">
            <h3>Unlisted</h3>
            <p className="stat-value">{unlistedCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('status', 'Sold')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <div className="stat-content">
            <h3>Sold</h3>
            <p className="stat-value">{soldCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('status', 'Shipping')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 3h5v5" />
            <path d="M8 3H4v13a2 2 0 0 0 2 2h11" />
            <path d="M21 8l-5 5" />
            <circle cx="17.5" cy="17.5" r="3.5" />
          </svg>
          <div className="stat-content">
            <h3>Shipping</h3>
            <p className="stat-value">{shippingCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('status', 'Archived')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          <div className="stat-content">
            <h3>Archived</h3>
            <p className="stat-value">{archivedCount}</p>
          </div>
        </div>

        {/* Special Cards */}
        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('rookie')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <div className="stat-content">
            <h3>Rookie Cards</h3>
            <p className="stat-value">{rookieCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('autograph')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
          <div className="stat-content">
            <h3>Autographs</h3>
            <p className="stat-value">{autographCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('graded')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          <div className="stat-content">
            <h3>Graded Cards</h3>
            <p className="stat-value">{gradedCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('numbered')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
          </svg>
          <div className="stat-content">
            <h3>Numbered</h3>
            <p className="stat-value">{numberedCount}</p>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => navigateToFilteredInventory('patch')}>
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
          <div className="stat-content">
            <h3>Patch Cards</h3>
            <p className="stat-value">{patchCount}</p>
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
                    src={card.image_url || DefaultCard}
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
