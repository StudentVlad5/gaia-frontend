import { api } from "./client";

export const getSummary = (params) => api.get("/reports/summary", { params });

export const getByDays = (params) => api.get("/reports/by-days", { params });

export const getByProducts = () => api.get("/reports/by-products");

export const getByReceivers = () => api.get("/reports/by-receivers");

export const getBoxes = (params) => {
  return api.get("/boxes", {
    params: {
      date_from: params.from,
      date_to: params.to,
    },
  });
};

export const getTodayReceivers = () => {
  return api.get("/reports/today-receivers");
};
