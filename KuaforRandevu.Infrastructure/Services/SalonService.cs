using KuaforRandevu.Application.DTOs.Salon;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class SalonService : ISalonService
{
    private readonly AppDbContext _db;

    public SalonService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<SalonListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Salons
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new SalonListItemDto
            {
                Id = s.Id,
                Name = s.Name,
                City = s.City,
                Address = s.Address,
                Phone = s.Phone,
            })
            .ToListAsync(ct);
    }

    public async Task<SalonDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Salons
            .AsNoTracking()
            .Where(s => s.Id == id && s.IsActive)
            .Select(s => new SalonDetailDto
            {
                Id = s.Id,
                Name = s.Name,
                City = s.City,
                Address = s.Address,
                Phone = s.Phone,
                Description = s.Description,
            })
            .FirstOrDefaultAsync(ct);
    }
}
