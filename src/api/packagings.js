import { api } from "./client";

export const getPackagings = (params) => api.get("/packagings", { params });

export const createPackaging = (data) => api.post("/packagings", data);

export const updatePackaging = (id, data) => api.put(`/packagings/${id}`, data);

export const deletePackaging = (id) => api.delete(`/packagings/${id}`);
