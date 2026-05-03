import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  console.log("Current user in AdminRoute:", user);

  const isAdmin = user && String(user.role).toUpperCase() === "ADMIN";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};
