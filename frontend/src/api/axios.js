import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
});

// Function to get Clerk token
let getClerkToken = null;

// This will be set by the AuthContext or a Clerk hook
export const setClerkTokenGetter = (tokenGetter) => {
  getClerkToken = tokenGetter;
};

// Add request interceptor
api.interceptors.request.use(async (config) => {
  if (getClerkToken) {
    try {
      const token = await getClerkToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get Clerk token:", error);
    }
  } else {
    // Fallback to localStorage for backward compatibility during migration
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
