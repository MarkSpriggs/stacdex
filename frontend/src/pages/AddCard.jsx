import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultCardImage from "../assets/default_card.png";
import "../styles/addCard.css";

export default function AddCard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Lookup data from API
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [gradingCompanies, setGradingCompanies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [teams, setTeams] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    status_id: "",
    grading_company_id: "",
    condition_id: "",
    player_name: "",
    team_name: "",
    year: "",
    brand: "",
    sub_brand: "",
    rookie: false,
    autograph: false,
    patch_count: "",
    numbered_to: "",
    grade_value: "",
    market_value: "",
    price_listed: "",
    ebay_url: "",
    tags: "",
    date_listed: "",
    date_sold: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultCardImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filteredTeams, setFilteredTeams] = useState([]);

  // Fetch lookup data on mount
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [categoriesRes, statusesRes, gradingCompaniesRes, conditionsRes, teamsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/lookups/categories`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/lookups/statuses`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/lookups/grading-companies`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/lookups/conditions`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/lookups/teams`, { headers }),
        ]);

        setCategories(await categoriesRes.json());
        setStatuses(await statusesRes.json());
        setGradingCompanies(await gradingCompaniesRes.json());
        setConditions(await conditionsRes.json());
        setTeams(await teamsRes.json());
      } catch (err) {
        console.error("Error fetching lookup data:", err);
        setError("Failed to load form data. Please refresh the page.");
      }
    };

    fetchLookupData();
  }, [token]);

  // Filter teams when category changes
  useEffect(() => {
    if (formData.category_id && teams.length > 0) {
      const filtered = teams.filter(team => team.category_id === parseInt(formData.category_id));
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams([]);
    }
  }, [formData.category_id, teams]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If category changes, reset team_name
    if (name === "category_id") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
        team_name: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Append image if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      // Required fields validation
      if (!formData.title || !formData.category_id || !formData.status_id) {
        throw new Error("Please fill in all required fields (Title, Category, Status)");
      }

      // Append all form fields with proper type handling
      Object.keys(formData).forEach((key) => {
        let value = formData[key];

        // Skip empty optional fields
        if (value === "" || value === null || value === undefined) {
          if (
            [
              "grading_company_id",
              "condition_id",
              "player_name",
              "team_name",
              "year",
              "brand",
              "sub_brand",
              "patch_count",
              "numbered_to",
              "grade_value",
              "market_value",
              "price_listed",
              "ebay_url",
              "date_listed",
              "date_sold",
              "tags",
            ].includes(key)
          ) {
            return; // Skip this field entirely
          }
        }

        // Convert tags string to PostgreSQL array format
        if (key === "tags" && value) {
          const tagsArray = value.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0);
          if (tagsArray.length > 0) {
            formDataToSend.append(key, `{${tagsArray.join(",")}}`);
          }
          return;
        }

        // Ensure booleans are sent as strings for FormData
        if (typeof value === "boolean") {
          formDataToSend.append(key, value.toString());
          return;
        }

        // Append the value
        formDataToSend.append(key, value);
      });

      console.log("Submitting form data:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create card");
      }

      const newCard = await res.json();
      navigate(`/dashboard/inventory/${newCard.id}`);
    } catch (err) {
      console.error("Error creating card:", err);
      setError(err.message || "Failed to create card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-card-page">
      <div className="add-card-header">
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Add New Card</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="add-card-form">
        {/* Image Upload Section */}
        <div className="form-section image-section">
          <h2>Card Image</h2>
          <div className="image-upload-container">
            <img src={imagePreview} alt="Card preview" className="image-preview" />
            <label htmlFor="image-upload" className="upload-label">
              {imageFile ? "Change Image" : "Upload Image"}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-file-input"
            />
          </div>
        </div>

        {/* Form Fields Container */}
        <div className="form-fields-container">
        {/* Basic Info Section */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., 2020 Panini Prizm Patrick Mahomes Silver"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category_id">
                Category <span className="required">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status_id">
                Status <span className="required">*</span>
              </label>
              <select
                id="status_id"
                name="status_id"
                value={formData.status_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="player_name">Player Name</label>
              <input
                type="text"
                id="player_name"
                name="player_name"
                value={formData.player_name}
                onChange={handleInputChange}
                placeholder="e.g., Patrick Mahomes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="team_name">Team Name</label>
              <select
                id="team_name"
                name="team_name"
                value={formData.team_name}
                onChange={handleInputChange}
                disabled={!formData.category_id}
              >
                <option value="">
                  {formData.category_id ? "Select Team" : "Select Category First"}
                </option>
                {filteredTeams.map((team) => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="e.g., 2020"
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g., Panini Prizm"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sub_brand">Sub Brand</label>
              <input
                type="text"
                id="sub_brand"
                name="sub_brand"
                value={formData.sub_brand}
                onChange={handleInputChange}
                placeholder="e.g., Silver Refractor"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numbered_to">Numbered To</label>
              <input
                type="number"
                id="numbered_to"
                name="numbered_to"
                value={formData.numbered_to}
                onChange={handleInputChange}
                placeholder="e.g., 99"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rookie"
                checked={formData.rookie}
                onChange={handleInputChange}
              />
              <span>Rookie Card</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="autograph"
                checked={formData.autograph}
                onChange={handleInputChange}
              />
              <span>Autograph</span>
            </label>
          </div>
        </div>

        {/* Grading & Condition Section */}
        <div className="form-section">
          <h2>Grading & Condition</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="grading_company_id">Grading Company</label>
              <select
                id="grading_company_id"
                name="grading_company_id"
                value={formData.grading_company_id}
                onChange={handleInputChange}
              >
                <option value="">None / Raw</option>
                {gradingCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="grade_value">Grade Value</label>
              <input
                type="number"
                step="0.5"
                id="grade_value"
                name="grade_value"
                value={formData.grade_value}
                onChange={handleInputChange}
                placeholder="e.g., 9.5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="condition_id">Condition</label>
              <select
                id="condition_id"
                name="condition_id"
                value={formData.condition_id}
                onChange={handleInputChange}
              >
                <option value="">Select Condition</option>
                {conditions.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="patch_count">Patch Count</label>
              <input
                type="number"
                id="patch_count"
                name="patch_count"
                value={formData.patch_count}
                onChange={handleInputChange}
                placeholder="e.g., 2"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Listing Section */}
        <div className="form-section">
          <h2>Pricing & Listing</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="market_value">Market Value ($)</label>
              <input
                type="number"
                step="0.01"
                id="market_value"
                name="market_value"
                value={formData.market_value}
                onChange={handleInputChange}
                placeholder="e.g., 1100.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price_listed">Price Listed ($)</label>
              <input
                type="number"
                step="0.01"
                id="price_listed"
                name="price_listed"
                value={formData.price_listed}
                onChange={handleInputChange}
                placeholder="e.g., 1200.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_listed">Date Listed</label>
              <input
                type="date"
                id="date_listed"
                name="date_listed"
                value={formData.date_listed}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_sold">Date Sold</label>
              <input
                type="date"
                id="date_sold"
                name="date_sold"
                value={formData.date_sold}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="ebay_url">eBay URL</label>
              <input
                type="url"
                id="ebay_url"
                name="ebay_url"
                value={formData.ebay_url}
                onChange={handleInputChange}
                placeholder="https://www.ebay.com/itm/..."
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., QB, Chiefs, Silver"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Card..." : "Create Card"}
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}
