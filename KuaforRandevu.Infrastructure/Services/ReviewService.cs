using KuaforRandevu.Application.DTOs.Review;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Domain.Enums;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;
    public ReviewService(AppDbContext db) => _db = db;

    // ── Yeni Değerlendirme Oluştur ────────────────────────────────────
    public async Task<ReviewListDto> CreateAsync(string authorId, CreateReviewDto dto, CancellationToken ct = default)
    {
        // 1. Randevu mevcut mu ve bu kullanıcıya mı ait?
        var appointment = await _db.Appointments
            .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId && a.CustomerId == authorId, ct)
            ?? throw new Exception("Randevu bulunamadı veya bu randevu size ait değil.");

        // 2. Yalnızca tamamlanan randevular değerlendirilebilir
        if (appointment.Status != AppointmentStatus.Completed)
            throw new Exception("Yalnızca tamamlanan randevular için değerlendirme yapılabilir.");

        // 3. Aynı randevu için daha önce değerlendirme yapılmış mı?
        var exists = await _db.Reviews.AnyAsync(r => r.AppointmentId == dto.AppointmentId, ct);
        if (exists)
            throw new Exception("Bu randevu için zaten bir değerlendirme bırakmışsınız.");

        // 4. Puan geçerliliği (1-5)
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new Exception("Puan 1 ile 5 arasında olmalıdır.");

        var review = new Review
        {
            AppointmentId = dto.AppointmentId,
            AuthorId = authorId,
            BarberId = dto.BarberId,
            Rating = dto.Rating,
            Comment = dto.Comment?.Trim(),
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        // 5. Berberin ortalama puanını güncelle
        await RefreshBarberRatingAsync(dto.BarberId, ct);

        return (await LoadDtoAsync(review.Id, ct))!;
    }

    // ── Kuaföre Ait Değerlendirmeler ──────────────────────────────────
    public async Task<IReadOnlyList<ReviewListDto>> GetBarberReviewsAsync(int barberId, CancellationToken ct = default)
    {
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Include(r => r.Author)
            .Where(r => r.BarberId == barberId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reviews.Select(ToDto).ToList();
    }

    // ── Değerlendirme Sil ─────────────────────────────────────────────
    public async Task DeleteAsync(int id, string userId, CancellationToken ct = default)
    {
        var review = await _db.Reviews
            .FirstOrDefaultAsync(r => r.Id == id && r.AuthorId == userId, ct)
            ?? throw new Exception("Değerlendirme bulunamadı veya bu işlem için yetkiniz yok.");

        var barberId = review.BarberId;
        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(ct);

        // Silme sonrasında ortalama puanı güncelle
        await RefreshBarberRatingAsync(barberId, ct);
    }

    // ── Randevuya Ait Değerlendirme (var mı?) ─────────────────────────
    public async Task<ReviewListDto?> GetByAppointmentIdAsync(int appointmentId, string userId, CancellationToken ct = default)
    {
        var review = await _db.Reviews
            .AsNoTracking()
            .Include(r => r.Author)
            .FirstOrDefaultAsync(r => r.AppointmentId == appointmentId && r.AuthorId == userId, ct);

        return review == null ? null : ToDto(review);
    }

    // ── Yardımcı: Ortalama Puan Hesapla ──────────────────────────────
    private async Task RefreshBarberRatingAsync(int barberId, CancellationToken ct)
    {
        var barber = await _db.Barbers.FindAsync(new object[] { barberId }, ct);
        if (barber == null) return;

        var ratings = await _db.Reviews
            .Where(r => r.BarberId == barberId)
            .Select(r => r.Rating)
            .ToListAsync(ct);

        barber.ReviewCount = ratings.Count;
        // Math.Round ile 1 ondalık basamağa yuvarla (örn: 4.7)
        barber.AverageRating = ratings.Count > 0 ? Math.Round(ratings.Average(), 1) : 0;
        await _db.SaveChangesAsync(ct);
    }

    // ── Yardımcı: ID'den DTO Yükle ────────────────────────────────────
    private async Task<ReviewListDto?> LoadDtoAsync(int id, CancellationToken ct)
    {
        var r = await _db.Reviews
            .AsNoTracking()
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return r == null ? null : ToDto(r);
    }

    private static ReviewListDto ToDto(Review r) => new()
    {
        Id = r.Id,
        AppointmentId = r.AppointmentId,
        AuthorName = $"{r.Author.FirstName} {r.Author.LastName}".Trim(),
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAt = r.CreatedAt,
    };
}
