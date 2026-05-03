import { api } from "./client";

export const getPackageProducts = () => api.get("/package-products");

export const createPackageProduct = (data) =>
  api.post("/package-products", data);

export const updatePackageProduct = (id, data) =>
  api.put(`/package-products/${id}`, data);

export const deletePackageProduct = (id) =>
  api.delete(`/package-products/${id}`);
