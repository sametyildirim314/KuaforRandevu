using KuaforRandevu.Application.DTOs.Gallery;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace KuaforRandevu.Infrastructure.Services;

public class GalleryService : IGalleryService
{
    private readonly AppDbContext _db;
    private readonly IFileStorageService _fileStorage;

    public GalleryService(AppDbContext db, IFileStorageService fileStorage)
    {
        _db = db;
        _fileStorage = fileStorage;
    }

    public async Task<IReadOnlyList<GalleryImageDto>> GetByBarberIdAsync(int barberId, CancellationToken ct = default)
    {
        return await _db.GalleryImages
            .AsNoTracking()
            .Where(gi => gi.BarberId == barberId)
            .OrderByDescending(gi => gi.CreatedAt)
            .Select(gi => new GalleryImageDto
            {
                Id = gi.Id,
                BarberId = gi.BarberId,
                ImageUrl = gi.ImageUrl,
                CreatedAt = gi.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<GalleryImageDto> AddImageAsync(int barberId, Stream fileStream, string fileName, CancellationToken ct = default)
    {
        var barber = await _db.Barbers.FindAsync(new object[] { barberId }, ct)
            ?? throw new Exception("Kuaför bulunamadı.");

        // Resmi uploads klasörüne kaydet
        var imageUrl = await _fileStorage.SaveFileAsync(fileStream, fileName, "uploads", ct);

        var img = new GalleryImage
        {
            BarberId = barberId,
            ImageUrl = imageUrl,
        };

        _db.GalleryImages.Add(img);
        await _db.SaveChangesAsync(ct);

        return new GalleryImageDto
        {
            Id = img.Id,
            BarberId = img.BarberId,
            ImageUrl = img.ImageUrl,
            CreatedAt = img.CreatedAt
        };
    }

    public async Task DeleteImageAsync(int id, string userId, string userRole, CancellationToken ct = default)
    {
        var img = await _db.GalleryImages
            .Include(gi => gi.Barber)
            .ThenInclude(b => b.Salon)
            .FirstOrDefaultAsync(gi => gi.Id == id, ct)
            ?? throw new Exception("Resim bulunamadı.");

        // Yetki kontrolü
        bool isAuthorized = userRole == "Admin" 
            || img.Barber.UserId == userId 
            || img.Barber.Salon.OwnerId == userId;

        if (!isAuthorized)
            throw new Exception("Bu resmi silmek için yetkiniz yok.");

        // Lokal depolamadan sil
        await _fileStorage.DeleteFileAsync(img.ImageUrl, ct);

        // Veritabanından sil
        _db.GalleryImages.Remove(img);
        await _db.SaveChangesAsync(ct);
    }
}
