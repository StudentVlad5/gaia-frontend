import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};
