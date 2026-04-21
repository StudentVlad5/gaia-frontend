import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import BoxesPage from "../pages/BoxesPage/BoxesPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import ReceiversPage from "../pages/ReceiversPage/ReceiversPage";
import ReportsPage from "../pages/ReportsPage/ReportsPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import UsersPage from "../pages/Auth/UsersPage";
import { AuthProvider } from "../auth/AuthContext";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { AdminRoute } from "../auth/AdminRoute";

export default function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<ReportsPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/boxes" element={<BoxesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/receivers" element={<ReceiversPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
