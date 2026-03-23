import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

const TOKEN_KEY = '@kuafor_tokens';
const USER_KEY = '@kuafor_user';

const authStore = create((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
    if (accessToken && refreshToken) {
      AsyncStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({ accessToken, refreshToken })
      );
    }
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  login: async (email, password) => {
    const { data } = await api.post(API_ENDPOINTS.login, { email, password });
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
      set({ isLoading: false });
    }
  },
}));

export default authStore;
