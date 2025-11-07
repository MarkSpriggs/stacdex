import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../assets/default-avatar.png"; // keep spelling consistent
import "../styles/account.css";

export default function Account() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
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
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/users/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  if (!user) return <div className="account-page">Loading...</div>;

  return (
    <div className="account-page">
      {/* ===== PROFILE HEADER ===== */}
      <section className="account-header">
        <div className="avatar-wrapper">
          <img
            src={avatarPreview || user.avatar_url || defaultAvatar}
            alt="avatar"
            className="avatar-img"
            onError={(e) => (e.target.src = defaultAvatar)}
          />
          <label htmlFor="avatar-upload" className="avatar-overlay">
            Change
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />
        </div>

        <div className="user-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </section>

      {/* ===== SETTINGS SECTION ===== */}
      <section className="account-settings">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange} className="password-form">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Update Password</button>
        </form>

        {message && <p className="account-message">{message}</p>}
      </section>

      {/* ===== DANGER ZONE ===== */}
      <section className="danger-zone">
        <h3>Delete Account</h3>
        <p>This action cannot be undone.</p>
        <button className="delete-btn" onClick={handleDeleteAccount}>
          Delete My Account
        </button>
      </section>
    </div>
  );
}
