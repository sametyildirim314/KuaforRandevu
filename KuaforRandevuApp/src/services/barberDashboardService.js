import api from './api';

const barberDashboardService = {
  getDashboardSummary: async (barberId) => {
    const response = await api.get(`/api/barbers/${barberId}/dashboard`);
    return response.data;
  },

  getDailySchedule: async (barberId, date) => {
    // date: YYYY-MM-DD
    const response = await api.get(`/api/barbers/${barberId}/schedule`, { params: { date } });
    return response.data;
  },

  getEarnings: async (barberId) => {
    const response = await api.get(`/api/barbers/${barberId}/earnings`);
    return response.data;
  },

  getWorkingHours: async (barberId) => {
    const response = await api.get(`/api/barbers/${barberId}/working-hours`);
    return response.data;
  },

  updateWorkingHours: async (barberId, data) => {
    const response = await api.put(`/api/barbers/${barberId}/working-hours`, data);
    return response.data;
  },

  updateAppointmentPrice: async (barberId, appointmentId, price) => {
    const response = await api.put(`/api/barbers/${barberId}/appointments/${appointmentId}/price`, { price });
    return response.data;
  },
};

export default barberDashboardService;
