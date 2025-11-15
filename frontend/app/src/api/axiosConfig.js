// frontend/src/api/axiosConfig.js
import axios from "axios";

// 👇 change this if backend runs on a different port or server
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.headers.common["Content-Type"] = "application/json";

export default axios;
