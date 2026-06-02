using KuaforRandevu.Application.DTOs.Admin;
using KuaforRandevu.Domain.Enums;

namespace KuaforRandevu.Application.Interfaces;

public interface IAdminService
{
    // Users
    Task<IReadOnlyList<UserDto>> GetUsersAsync(CancellationToken ct = default);
    Task UpdateUserRoleAsync(string userId, string role, CancellationToken ct = default);
    Task ToggleUserStatusAsync(string userId, CancellationToken ct = default);

    // Salons
    Task<IReadOnlyList<SalonAdminDto>> GetSalonsAsync(CancellationToken ct = default);
    Task UpdateSalonApprovalStatusAsync(int salonId, ApprovalStatus status, CancellationToken ct = default);

    // Stats
    Task<SystemStatisticsDto> GetStatisticsAsync(CancellationToken ct = default);
}
