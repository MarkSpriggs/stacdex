import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../assets/default-avatar.png";
import DefaultCard from "../assets/default_card.png";
import "../styles/account.css";

export default function Account() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchItems = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [token, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload avatar");

      setMessage("✅ Avatar updated successfully.");
      setAvatarFile(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 6) {
      setMessage("❌ Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setMessage("✅ Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = "DELETE";
    const userInput = prompt(
      `This will permanently delete your account and all your cards. This action cannot be undone.\n\nType "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      if (userInput !== null) {
        alert("Account deletion cancelled. Text did not match.");
      }
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/users/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      setMessage("❌ Failed to delete account. Please try again.");
    }
  };

  // Calculate stats
  const totalCards = items.length;
  const totalValue = items.reduce((sum, item) => sum + (Number(item.market_value) || 0), 0);
  const topCards = [...items]
    .sort((a, b) => (Number(b.market_value) || 0) - (Number(a.market_value) || 0))
    .slice(0, 5);

  if (!user || loading) return <div className="account-page">Loading...</div>;

  return (
    <div className="account-page">
      {/* ===== PROFILE SECTION (MOVED TO TOP) ===== */}
      <section className="account-section">
        <h2 className="section-title">Profile Settings</h2>

        <div className="profile-card">
          <div className="profile-row">
            <div className="avatar-section">
              <img
                src={avatarPreview || user.profile_picture || defaultAvatar}
                alt="avatar"
                className="avatar-img"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
              <div className="avatar-controls">
                <label htmlFor="avatar-upload" className="avatar-btn">
                  Choose Photo
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
                {avatarFile && (
                  <button onClick={handleAvatarUpload} className="avatar-save-btn">
                    Save Photo
                  </button>
                )}
              </div>
            </div>

            <div className="user-details">
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-value">{user.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS GRID ===== */}
      <div className="account-stats-grid">
        <div className="stat-card">
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
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <div className="stat-content">
            <h3>Collection Value</h3>
            <p className="stat-value">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* ===== TOP 5 CARDS (HORIZONTAL) ===== */}
      {topCards.length > 0 && (
        <section className="account-section">
          <h2 className="section-title">Your Most Valuable Cards</h2>
          <div className="top-cards-horizontal">
            {topCards.map((card, index) => (
              <div
                key={card.id}
                className="horizontal-card-item"
                onClick={() => navigate(`/dashboard/inventory/${card.id}`)}
              >
                <div className="horizontal-card-rank">#{index + 1}</div>
                <img
                  src={card.image_url || DefaultCard}
                  alt={card.title}
                  className="horizontal-card-image"
                />
                <div className="horizontal-card-info">
                  <h4>{card.title}</h4>
                  <p className="horizontal-card-player">{card.player_name || "—"}</p>
                  <p className="horizontal-card-value">
                    ${Number(card.market_value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== SECURITY SECTION ===== */}
      <section className="account-section">
        <h2 className="section-title">Security</h2>

        <div className="security-card">
          {!showPasswordForm ? (
            <button
              className="security-action-btn"
              onClick={() => setShowPasswordForm(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Change Password
            </button>
          ) : (
            <div className="password-form-container">
              <form onSubmit={handlePasswordChange} className="password-form">
                <input
                  type="password"
                  placeholder="New password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div className="form-actions">
                  <button type="submit" className="submit-btn">Update Password</button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setMessage("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <button className="security-action-btn logout-action" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </section>

      {/* ===== MESSAGE ===== */}
      {message && (
        <div className={`account-message ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {/* ===== DANGER ZONE ===== */}
      <section className="account-section danger-section">
        <h2 className="section-title danger-title">Danger Zone</h2>

        <div className="danger-card">
          {!showDeleteConfirm ? (
            <button
              className="danger-reveal-btn"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className="delete-confirm-container">
              <div className="warning-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <h3>Warning: Account Deletion</h3>
                  <p>This will permanently delete your account and all {totalCards} cards in your collection. This action cannot be undone.</p>
                </div>
              </div>
              <div className="danger-actions">
                <button className="delete-confirm-btn" onClick={handleDeleteAccount}>
                  Yes, Delete My Account
                </button>
                <button
                  className="delete-cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
