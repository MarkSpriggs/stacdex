import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import { useAuth } from "./context/AuthContext";
import InventorySearch from "./pages/InventorySearch";
import "./index.css";

export default function App() {
  const { token } = useAuth();

  return (
    <div className="app-container">
      {token && <Navbar/>}
      <Routes>
        {/* ===== Public routes ===== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== Protected routes ===== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account/>} />
          <Route path="/dashboard/inventory" element={<InventorySearch/>} />
        </Route>

        {/* ===== Catch-all redirect ===== */}
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/"} />}
        />
      </Routes>
    </div>
  );
}
