using KuaforRandevu.Application.DTOs.Salon;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace KuaforRandevu.Application.Interfaces;

public interface IFavoriteService
{
    Task AddFavoriteAsync(string customerId, int salonId, CancellationToken ct = default);
    Task RemoveFavoriteAsync(string customerId, int salonId, CancellationToken ct = default);
    Task<IReadOnlyList<SalonListItemDto>> GetMyFavoritesAsync(string customerId, CancellationToken ct = default);
    Task<bool> IsFavoriteAsync(string customerId, int salonId, CancellationToken ct = default);
}
