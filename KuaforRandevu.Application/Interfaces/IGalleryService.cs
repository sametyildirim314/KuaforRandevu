using KuaforRandevu.Application.DTOs.Gallery;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace KuaforRandevu.Application.Interfaces;

public interface IGalleryService
{
    Task<IReadOnlyList<GalleryImageDto>> GetByBarberIdAsync(int barberId, CancellationToken ct = default);
    Task<GalleryImageDto> AddImageAsync(int barberId, Stream fileStream, string fileName, CancellationToken ct = default);
    Task DeleteImageAsync(int id, string userId, string userRole, CancellationToken ct = default);
}
