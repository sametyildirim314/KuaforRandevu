using KuaforRandevu.Application.DTOs.Appointment;
using KuaforRandevu.Application.DTOs.Barber;

namespace KuaforRandevu.Application.Interfaces;

public interface IBarberDashboardService
{
    Task<BarberDashboardSummaryDto> GetDashboardSummaryAsync(int barberId, CancellationToken ct = default);
    Task<List<AppointmentListDto>> GetDailyScheduleAsync(int barberId, DateTime date, CancellationToken ct = default);
    Task<BarberEarningsDto> GetEarningsAsync(int barberId, CancellationToken ct = default);
    
    Task<BarberWorkingHoursDto> GetWorkingHoursAsync(int barberId, CancellationToken ct = default);
    Task UpdateWorkingHoursAsync(int barberId, BarberWorkingHoursDto dto, CancellationToken ct = default);
    
    Task UpdateAppointmentPriceAsync(int barberId, int appointmentId, decimal price, CancellationToken ct = default);
}
