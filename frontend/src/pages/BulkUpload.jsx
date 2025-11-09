import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/bulkUpload.css";

export default function BulkUpload() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResults(null);
      setValidationErrors([]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setResults(null);
      setValidationErrors([]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bulk-upload/template`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "KylesCards_Import_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading template:", err);
      setError("Failed to download template. Please try again.");
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setImporting(true);
    setError(null);
    setValidationErrors([]);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          setValidationErrors(data.details);
          setError(data.error || "Validation failed. Please fix the errors below and try again.");
        } else {
          setError(data.error || data.details || "Failed to import cards");
        }
        return;
      }

      setResults(data);
      setFile(null);
    } catch (err) {
      console.error("Error importing cards:", err);
      setError("Failed to import cards. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bulk-upload-page">
      <div className="bulk-upload-header">
        <button onClick={() => navigate("/dashboard")} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Bulk Import Cards</h1>
        <p className="subtitle">Upload an Excel or CSV file to import multiple cards at once</p>
      </div>

      {/* Download Template Section */}
      <div className="template-section">
        <h2>Step 1: Download Template</h2>
        <p>Download our Excel template with the correct column headers and an example row.</p>
        <button onClick={handleDownloadTemplate} className="btn-download-template">
          📥 Download Excel Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Step 2: Upload Your File</h2>
        <div
          className={`dropzone ${file ? "has-file" : ""}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="file-info">
              <p className="file-name">📄 {file.name}</p>
              <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
              <label htmlFor="file-input" className="btn-change-file">
                Change File
              </label>
            </div>
          ) : (
            <div className="dropzone-content">
              <p className="dropzone-text">Drag and drop your file here, or</p>
              <label htmlFor="file-input" className="btn-browse">
                Browse Files
              </label>
              <p className="dropzone-hint">Supports .xlsx, .xls, and .csv files (max 10MB)</p>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden-file-input"
          />
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors-section">
          <h3>❌ Validation Errors ({validationErrors.length})</h3>
          <p>Please fix the following errors in your spreadsheet and upload again:</p>
          <div className="errors-list">
            {validationErrors.map((err, index) => (
              <div key={index} className="error-item">
                <span className="error-row">Row {err.row}:</span>
                <span className="error-field">{err.field}</span>
                <span className="error-message">{err.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && !validationErrors.length && (
        <div className="error-banner">{error}</div>
      )}

      {/* Import Button */}
      <div className="import-actions">
        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="btn-import"
        >
          {importing ? "Importing..." : "Import Cards"}
        </button>
      </div>

      {/* Success Results */}
      {results && (
        <div className="results-section success">
          <h3>✅ Import Successful!</h3>
          <p className="results-message">{results.message}</p>
          <div className="results-details">
            <p><strong>Cards Imported:</strong> {results.imported}</p>
            {results.ignoredColumns && results.ignoredColumns.length > 0 && (
              <p className="ignored-columns">
                <strong>Ignored Columns:</strong> {results.ignoredColumns.join(", ")}
              </p>
            )}
          </div>
          <div className="results-actions">
            <button onClick={() => navigate("/dashboard/inventory")} className="btn-view-inventory">
              View Inventory
            </button>
            <button
              onClick={() => {
                setResults(null);
                setFile(null);
              }}
              className="btn-import-more"
            >
              Import More Cards
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions-section">
        <h3>📋 Important Notes</h3>
        <ul>
          <li><strong>Use the Template!</strong> We highly recommend downloading and using our template above. It's the easiest and most reliable way to ensure your import succeeds. The template includes all valid column names, example data, and helpful instructions.</li>
          <li><strong>Required Fields:</strong> Every row must have a <strong>Title</strong> and <strong>Category</strong>. Category must be one of: Football, Baseball, Basketball, Hockey, Soccer, or Other. If these are missing or invalid, the import will fail.</li>
          <li><strong>Optional Fields:</strong> All other fields are optional. If you provide invalid values for Status, Grading Company, or Condition, those specific fields will be set to null while the rest of your data imports successfully.</li>
          <li><strong>Flexible Column Names:</strong> Column headers are case-insensitive and flexible (e.g., "Player" works the same as "Player Name" or "PLAYER"). However, using the template guarantees the correct column names.</li>
          <li><strong>Teams:</strong> Team names should match existing teams in our database (e.g., "Kansas City Chiefs", "Los Angeles Lakers"). If a team name doesn't match, it will still be saved as text, but won't link to our team database.</li>
          <li><strong>Data Validation:</strong> Year must be between 1900-2025, and Grade Value must be between 0-10. Invalid values in these fields will cause those specific rows to be rejected.</li>
          <li><strong>Unknown Columns:</strong> Any columns not recognized will be safely ignored - your import will still proceed.</li>
          <li><strong>All-or-Nothing:</strong> If any row has validation errors in <strong>required fields</strong> (Title/Category) or <strong>data ranges</strong> (Year/Grade), the entire import will be rejected and you'll see specific error messages for each issue.</li>
          <li><strong>Images:</strong> Bulk import does not support images. You can add images to individual cards after importing by editing them from your inventory.</li>
        </ul>
      </div>
    </div>
  );
}
