import api from './api';

const adminService = {
  getUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(`/api/admin/users/${userId}/status`);
    return response.data;
  },

  getSalons: async () => {
    const response = await api.get('/api/admin/salons');
    return response.data;
  },

  updateSalonStatus: async (salonId, statusInt) => {
    const response = await api.put(`/api/admin/salons/${salonId}/approve`, statusInt, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/api/admin/statistics');
    return response.data;
  }
};

export default adminService;
