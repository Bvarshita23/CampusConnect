import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

// 🔥 Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⭐ Bring back authFetch so old code works perfectly
export const authFetch = async (url, options = {}) => {
  try {
    const response = await api({
      url,
      method: options.method || "GET",
      data: options.body || null,
      params: options.params || null,
      headers: options.headers || {},
    });

    return response.data;
  } catch (err) {
    console.error("authFetch Error:", err);
    throw err;
  }
};

export default api;
