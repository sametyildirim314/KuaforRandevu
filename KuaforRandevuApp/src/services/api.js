import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Döngüsel bağımlılığı önlemek için lazy import
const getAuthStore = () => require('../store/authStore').default;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  async (config) => {
    const token = getAuthStore().getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - hata yönetimi ve token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 ve henüz retry yapılmamışsa refresh token dene
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getAuthStore().getState().refreshToken;
        if (refreshToken) {
          // Backend [FromBody] string beklediği için JSON string gönder
          const { data } = await axios.post(
            `${API_BASE_URL}/api/auth/refresh-token`,
            JSON.stringify(refreshToken),
            { headers: { 'Content-Type': 'application/json' } }
          );

          const store = getAuthStore().getState();
          store.setTokens(data.accessToken, data.refreshToken);
          if (data.user) store.setUser(data.user);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        getAuthStore().getState().logout();
      }
    }

    // API'den gelen hata mesajını ayıkla
    const message =
      error.response?.data?.message ||
      error.message ||
      'Bir hata oluştu. Lütfen tekrar deneyin.';

    return Promise.reject(new Error(message));
  }
);

export default api;
