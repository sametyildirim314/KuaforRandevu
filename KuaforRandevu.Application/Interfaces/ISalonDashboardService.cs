using KuaforRandevu.Application.DTOs.Barber;
using KuaforRandevu.Application.DTOs.Salon;

namespace KuaforRandevu.Application.Interfaces;

public interface ISalonDashboardService
{
    // ── Dashboard ──────────────────────────────────────────────────
    Task<IReadOnlyList<SalonDashboardDto>> GetDashboardAsync(string ownerId, CancellationToken ct = default);

    // ── Randevu Yönetimi ───────────────────────────────────────────
    Task<IReadOnlyList<SalonAppointmentListDto>> GetSalonAppointmentsAsync(string ownerId, int salonId, string? statusFilter, CancellationToken ct = default);
    Task ConfirmAsync(int appointmentId, string ownerId, CancellationToken ct = default);
    Task CancelByOwnerAsync(int appointmentId, string ownerId, CancellationToken ct = default);
    Task CompleteAsync(int appointmentId, string ownerId, CancellationToken ct = default);

    // ── Berber CRUD ────────────────────────────────────────────────
    Task<IReadOnlyList<BarberListDto>> GetBarbersAsync(string ownerId, int salonId, CancellationToken ct = default);
    Task<BarberListDto> AddBarberAsync(string ownerId, int salonId, CreateBarberDto dto, CancellationToken ct = default);
    Task<BarberListDto> UpdateBarberAsync(string ownerId, int barberId, UpdateBarberDto dto, CancellationToken ct = default);
    Task RemoveBarberAsync(string ownerId, int barberId, CancellationToken ct = default);
}
