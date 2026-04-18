import { api } from "./client";

export const getBoxes = (params) => api.get("/boxes", { params });

export const createBox = (data) => api.post("/boxes", data);

export const updateBox = (id, data) => api.put(`/boxes/${id}`, data);

export const deleteBox = (id) => api.delete(`/boxes/${id}`);
