import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import BoxesPage from "../pages/BoxesPage/BoxesPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import ReceiversPage from "../pages/ReceiversPage/ReceiversPage";
import ReportsPage from "../pages/ReportsPage/ReportsPage";
import Dashboard from "../pages/Dashboard/Dashboard";

export default function AppRouter() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/boxes" element={<BoxesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/receivers" element={<ReceiversPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </MainLayout>
  );
}
