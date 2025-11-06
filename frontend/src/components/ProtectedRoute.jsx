import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  // Optional loading state
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "4rem" }}>Loading...</div>;
  }

  // If not logged in, redirect to landing page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If logged in, show the protected page
  return <Outlet />;
}
