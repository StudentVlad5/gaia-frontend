import axios from "axios";

export const api = axios.create({
  baseURL: "https://gaia-server-gayu.onrender.com",
  withCredentials: true,
});
