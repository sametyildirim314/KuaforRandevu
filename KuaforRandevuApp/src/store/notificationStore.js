import { create } from 'zustand';
import api from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Backend'den bildirim listesini çek
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/notifications');
      set({ notifications: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Backend'den okunmamış sayısını çek
  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/api/notifications/unread-count');
      set({ unreadCount: data.count });
    } catch (error) {
      console.error('Unread count fetch error:', error);
    }
  },

  // Tek bildirimi okundu yap
  markAsRead: async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  // Tümünü okundu yap
  markAllAsRead: async () => {
    try {
      await api.put('/api/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  },

  // SignalR'dan gelen yeni bildirimi ekle
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      // unreadCount update işlemi SignalR'ın UnreadCountUpdated event'i ile yapılıyor
    }));
  },

  // Okunmamış sayısını doğrudan güncelle
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  // Çıkış yapıldığında store'u temizle
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export default useNotificationStore;
