import axios from 'axios';
import { CONFIG } from 'src/config';
import { AUTH_STORAGE_KEY } from 'src/auth/auth-storage';

export const api = axios.create({
  baseURL: CONFIG.apiUrl,
});

api.interceptors.request.use((config) => {

  const auth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (auth) {
    const { token } = JSON.parse(auth);

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      console.log("Token expirado");
    }

    return Promise.reject(error);
  }
);