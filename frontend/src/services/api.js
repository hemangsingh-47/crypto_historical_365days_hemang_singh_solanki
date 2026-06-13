import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  // Point to the backend server. 
  // We can use an environment variable VITE_API_URL if needed, but the default backend is on port 5000.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout of 10 seconds for standard requests
  timeout: 10000,
});

// Response interceptor for generic error handling
api.interceptors.response.use(
  (response) => {
    // Return the response data directly so we don't have to call .data everywhere
    return response.data;
  },
  (error) => {
    // Log the error globally or trigger a notification toast here later
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
