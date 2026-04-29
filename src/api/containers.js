import { api } from "./client";

export const getContainers = () => api.get("/containers/state");

export const getFactories = () => api.get("/containers/factories");
export const addFactory = (name) => api.post("/containers/factories", { name });
export const updateFactory = (id, name) =>
  api.put(`/containers/factories/${id}`, { name });

export const updateLimit = (type, total) =>
  api.put("/containers/limit", { type, total });

export const addContainer = (data) => api.post("/containers", data);
export const removeContainer = (id) => api.delete(`/containers/${id}`);
