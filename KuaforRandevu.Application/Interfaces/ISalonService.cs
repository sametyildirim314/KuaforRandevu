using KuaforRandevu.Application.DTOs.Salon;

namespace KuaforRandevu.Application.Interfaces;

public interface ISalonService
{
    Task<IReadOnlyList<SalonListItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<SalonDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
}
