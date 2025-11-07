import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/inventorySearch.css";
import DefaultCard from "../assets/default_card.png";

export default function InventorySearch() {
  const { token } = useAuth();
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user’s items
  useEffect(() => {
    if (!token) return;
    const fetchItems = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCards(data);
        setFilteredCards(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [token]);

  // Filter + sort
  useEffect(() => {
    let results = [...cards];

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.title?.toLowerCase().includes(s) ||
          c.player_name?.toLowerCase().includes(s) ||
          c.team_name?.toLowerCase().includes(s)
      );
    }

    if (category) results = results.filter((c) => c.category_name === category);
    if (status) results = results.filter((c) => c.status_name === status);

    if (sort === "value-high") results.sort((a, b) => b.market_value - a.market_value);
    if (sort === "value-low") results.sort((a, b) => a.market_value - b.market_value);
    if (sort === "newest") results.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    if (sort === "oldest") results.sort((a, b) => new Date(a.date_created) - new Date(b.date_created));

    setFilteredCards(results);
  }, [search, category, status, sort, cards]);

  // determine value tier for glows
  const getValueTier = (value) => {
    if (value >= 1000) return "tier-gold";
    if (value >= 500) return "tier-red";
    if (value >= 200) return "tier-blue";
    return "tier-common";
  };

  if (loading) return <div className="inventory-page">Loading your cards...</div>;

  return (
    <div className="inventory-page">
      <h1 className="inventory-title">My Inventory</h1>

      {/* ===== Search & Filters ===== */}
      <div className="inventory-filters">
        <input
          type="text"
          placeholder="Search by player, team, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Football">Football</option>
          <option value="Baseball">Baseball</option>
          <option value="Basketball">Basketball</option>
          <option value="Hockey">Hockey</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Unlisted">Unlisted</option>
          <option value="Listed">Listed</option>
          <option value="Sold">Sold</option>
          <option value="Shipping">Shipping</option>
          <option value="Archived">Archived</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="value-high">Value: High → Low</option>
          <option value="value-low">Value: Low → High</option>
        </select>
      </div>

      {/* ===== Card Grid ===== */}
      <div className="inventory-grid">
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <div key={card.id} className="inventory-card-wrapper">
              <div
                className={`inventory-card ${getValueTier(card.market_value)}`}
                onClick={() => navigate(`/dashboard/inventory/${card.id}`)}
              >
                <img
                  src={card.image_url || DefaultCard}
                  alt={card.title}
                  className="inventory-card-img"
                />

                {/* Hover info (player/value/status) */}
                <div className="card-hover-info">
                  <p>{card.player_name}</p>
                  <p className="value">
                    ${card.market_value ? Number(card.market_value).toFixed(2) : "—"}
                  </p>
                  <p>{card.status_name}</p>
                </div>
              </div>

              {/* Title below the card */}
              <p className="card-title">{card.title}</p>
            </div>
          ))
        ) : (
          <p className="no-results">No cards found.</p>
        )}
      </div>
    </div>
  );
}
