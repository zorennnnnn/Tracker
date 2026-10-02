import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Turn Laravel validation errors into a flat array of messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422 && error.response.data?.errors) {
      error.validationErrors = Object.values(error.response.data.errors).flat();
    }
    return Promise.reject(error);
  }
);

export default api;