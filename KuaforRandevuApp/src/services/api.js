import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Döngüsel bağımlılığı (circular dependency) önlemek için store'u ihtiyaç anında çağırıyoruz
const getAuthStore = () => require('../store/authStore').default;

/**
 * Axios Instance: API isteklerini merkezi bir yerden yönetmek için bir örnek oluşturuyoruz.
 * baseURL, timeout gibi her istekte ortak olacak ayarları burada tanımlarız.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Her istek gönderilmeden hemen önce bu araya girer.
// Eğer kullanıcı giriş yapmışsa, isteğin başına "Authorization" başlığını (token) ekler.
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

// Response Interceptor: API'den cevap geldiğinde (veya hata oluştuğunda) ilk burası çalışır.
api.interceptors.response.use(
  (response) => response, // Başarılı cevapları olduğu gibi döndür
  async (error) => {
    const originalRequest = error.config;

    // Eğer hata 401 (Yetkisiz/Oturum Süresi Dolmuş) ise ve henüz yeniden deneme yapılmadıysa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getAuthStore().getState().refreshToken;
        if (refreshToken) {
          // Token yenilemek için refresh-token endpoint'ine istek at
          const { data } = await axios.post(
            `${API_BASE_URL}/api/auth/refresh-token`,
            JSON.stringify(refreshToken),
            { headers: { 'Content-Type': 'application/json' } }
          );

          // Yeni gelen token'ları store'a kaydet
          const store = getAuthStore().getState();
          store.setTokens(data.accessToken, data.refreshToken);
          if (data.user) store.setUser(data.user);
          
          // Başarısız olan ilk isteği yeni token ile tekrar dene
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Eğer token yenileme de başarısız olursa kullanıcıyı oturumdan at
        getAuthStore().getState().logout();
      }
    }

    // Kullanıcıya dostça bir hata mesajı göster
    const message =
      error.response?.data?.message ||
      error.message ||
      'Bir hata oluştu. Lütfen tekrar deneyin.';

    return Promise.reject(new Error(message));
  }
);

export default api;
