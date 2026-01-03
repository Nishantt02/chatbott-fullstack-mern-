

import axios from "axios";

console.log("ENV BASE URL 👉", import.meta.env.VITE_SERVER);

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
  withCredentials: true,
});
