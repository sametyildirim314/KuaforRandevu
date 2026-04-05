import { create } from 'zustand';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

// Randevu yönetimi için global state (Zustand store)
const appointmentStore = create((set) => ({
  appointments: [],
  loading: false,
  error: null,

  // Kullanıcının randevularını API'den çek
  fetchMyAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`${API_ENDPOINTS.appointments}/my`);
      set({ appointments: data });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  // Yeni randevu oluştur
  createAppointment: async (payload) => {
    const { data } = await api.post(API_ENDPOINTS.appointments, payload);
    // Yeni randevu listeye eklenir
    set((state) => ({ appointments: [data, ...state.appointments] }));
    return data;
  },

  // Randevuyu iptal et
  cancelAppointment: async (id) => {
    await api.put(`${API_ENDPOINTS.appointments}/${id}/cancel`);
    // Store'daki randevunun durumunu güncelle
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'Cancelled', statusLabel: 'İptal Edildi' } : a
      ),
    }));
  },

  // Store'u sıfırla (logout sırasında çağrılır)
  reset: () => set({ appointments: [], loading: false, error: null }),
}));

export default appointmentStore;
