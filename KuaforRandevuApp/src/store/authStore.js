import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

// Cihaz hafızasında (AsyncStorage) verileri saklamak için benzersiz anahtarlar
const TOKEN_KEY = '@kuafor_tokens';
const USER_KEY = '@kuafor_user';

/**
 * Zustand Store: Uygulama genelinde paylaşılan verileri (state) yönetir. 
 * Redux'a göre çok daha basit ve hafif bir alternatiftir.
 */
const authStore = create((set, get) => ({
  accessToken: null, // API istekleri için gereken jeton
  refreshToken: null, // Jeton yenilemek için gereken anahtar
  user: null, // Giriş yapan kullanıcının bilgileri
  isLoading: true, // Uygulama ilk açıldığında bilgilerin yüklenip yüklenmediği
  isAuthenticated: false, // Kullanıcının giriş yapıp yapmadığı durumu

  // Jetonları hem hafızaya (state) hem de cihaz belleğine (AsyncStorage) kaydeder
  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
    // nurdaki syntax: !!accessToken -> accessToken null değilse true döner
    if (accessToken && refreshToken) {
      AsyncStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({ accessToken, refreshToken })
      );
    }
  },

  // Kullanıcı bilgilerini kaydeder
  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Giriş yapma fonksiyonu
  login: async (email, password) => {
    const { data } = await api.post(API_ENDPOINTS.login, { email, password });
    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      isAuthenticated: true,
    });
    // Bilgileri cihaz hafızasına kalıcı olarak kaydet
    await AsyncStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
    );
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  // Kayıt olma fonksiyonu
  register: async (userData) => {
    const { data } = await api.post(API_ENDPOINTS.register, userData);
    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      isAuthenticated: true,
    });
    await AsyncStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
    );
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  // Çıkış yapma fonksiyonu: Hem hafızayı sıfırlar hem cihazdaki kayıtları siler
  logout: async () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  forgotPassword: async (email) => {
    await api.post(API_ENDPOINTS.forgotPassword, { email });
  },

  // Uygulama her açıldığında cihaz hafızasındaki eski oturumu kontrol eder
  loadStoredAuth: async () => {
    try {
      const [tokensJson, userJson] = await AsyncStorage.multiGet([
        TOKEN_KEY,
        USER_KEY,
      ]);

      const tokens = tokensJson[1]
        ? JSON.parse(tokensJson[1])
        : null;
      const user = userJson[1] ? JSON.parse(userJson[1]) : null;

      if (tokens?.accessToken) {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.warn('Stored auth load error:', e);
    } finally {
      set({ isLoading: false }); // Yükleme işlemi bittiğinde spinner'ı kapatır
    }
  },
}));

export default authStore;
