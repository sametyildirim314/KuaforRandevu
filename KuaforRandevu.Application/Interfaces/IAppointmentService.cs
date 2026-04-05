using KuaforRandevu.Application.DTOs.Appointment;
using KuaforRandevu.Application.DTOs.Barber;
using KuaforRandevu.Domain.Enums;

namespace KuaforRandevu.Application.Interfaces;

public interface IAppointmentService
{
    Task<AppointmentDetailDto> CreateAsync(string customerId, CreateAppointmentDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<AppointmentListDto>> GetMyAppointmentsAsync(string customerId, CancellationToken ct = default);
    Task<AppointmentDetailDto?> GetByIdAsync(int id, string userId, CancellationToken ct = default);
    Task CancelAsync(int id, string userId, CancellationToken ct = default);
    Task UpdateStatusAsync(int id, AppointmentStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<AvailableSlotDto>> GetAvailableSlotsAsync(int barberId, DateOnly date, CancellationToken ct = default);
    Task<IReadOnlyList<AppointmentListDto>> GetBarberAppointmentsAsync(int barberId, CancellationToken ct = default);
}
