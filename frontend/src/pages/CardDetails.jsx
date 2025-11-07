import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/cardDetails.css";
import DefaultCard from "../assets/default_card.png";

export default function CardDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch card details");
        }

        const data = await res.json();
        setCard(data);
        setSelectedStatus(data.status_name || "");
      } catch (err) {
        console.error("Error fetching card:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchCard();
    }
  }, [id, token]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_name: selectedStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update card");
      }

      const updatedCard = await res.json();
      setCard(updatedCard);
      setIsEditing(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating card:", err);
      alert("Failed to update card. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedStatus(card.status_name || "");
    setIsEditing(false);
  };

  if (loading) {
    return <div className="card-details-page">Loading card details...</div>;
  }

  if (error || !card) {
    return (
      <div className="card-details-page">
        <div className="error-message">
          <h2>Card not found</h2>
          <p>{error || "Unable to load card details"}</p>
          <button onClick={() => navigate("/dashboard/inventory")}>
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-details-page">
      <button className="back-button" onClick={() => navigate("/dashboard/inventory")}>
        ← Back to Inventory
      </button>

      <div className="card-details-container">
        {/* Left side - Image */}
        <div className="card-image-section">
          <img
            src={card.image_url || DefaultCard}
            alt={card.title}
            className="card-detail-image"
          />
        </div>

        {/* Right side - Details */}
        <div className="card-info-section">
          <h1 className="card-detail-title">{card.title}</h1>

          <div className="detail-grid">
            {card.player_name && (
              <div className="detail-item">
                <span className="detail-label">Player:</span>
                <span className="detail-value">{card.player_name}</span>
              </div>
            )}

            {card.team_name && (
              <div className="detail-item">
                <span className="detail-label">Team:</span>
                <span className="detail-value">{card.team_name}</span>
              </div>
            )}

            {card.category_name && (
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{card.category_name}</span>
              </div>
            )}

            {card.year && (
              <div className="detail-item">
                <span className="detail-label">Year:</span>
                <span className="detail-value">{card.year}</span>
              </div>
            )}

            {card.manufacturer && (
              <div className="detail-item">
                <span className="detail-label">Manufacturer:</span>
                <span className="detail-value">{card.manufacturer}</span>
              </div>
            )}

            {card.card_number && (
              <div className="detail-item">
                <span className="detail-label">Card Number:</span>
                <span className="detail-value">{card.card_number}</span>
              </div>
            )}

            {card.market_value !== null && card.market_value !== undefined && (
              <div className="detail-item highlight">
                <span className="detail-label">Market Value:</span>
                <span className="detail-value price">
                  ${Number(card.market_value).toFixed(2)}
                </span>
              </div>
            )}

            <div className="detail-item">
              <span className="detail-label">Status:</span>
              {isEditing ? (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="status-dropdown"
                >
                  <option value="Unlisted">Unlisted</option>
                  <option value="Listed">Listed</option>
                  <option value="Sold">Sold</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Archived">Archived</option>
                </select>
              ) : (
                <span className={`detail-value status-badge status-${card.status_name?.toLowerCase()}`}>
                  {card.status_name}
                </span>
              )}
            </div>

            {card.description && (
              <div className="detail-item full-width">
                <span className="detail-label">Description:</span>
                <p className="detail-value description">{card.description}</p>
              </div>
            )}

            {card.date_created && (
              <div className="detail-item">
                <span className="detail-label">Added:</span>
                <span className="detail-value">
                  {new Date(card.date_created).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {saveSuccess && (
            <div className="save-success-message-main">
              Card updated successfully!
            </div>
          )}

          <div className="card-actions">
            {isEditing ? (
              <>
                <button
                  className="action-button save-button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="action-button cancel-button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="action-button edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Card
                </button>
                <button className="action-button delete-button">
                  Delete Card
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
