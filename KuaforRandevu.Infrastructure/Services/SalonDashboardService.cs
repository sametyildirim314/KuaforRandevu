using KuaforRandevu.Application.DTOs.Barber;
using KuaforRandevu.Application.DTOs.Salon;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Domain.Enums;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class SalonDashboardService : ISalonDashboardService
{
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public SalonDashboardService(AppDbContext db, UserManager<AppUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    // ── Dashboard İstatistikleri ──────────────────────────────────────
    public async Task<IReadOnlyList<SalonDashboardDto>> GetDashboardAsync(string ownerId, CancellationToken ct = default)
    {
        var salons = await _db.Salons
            .AsNoTracking()
            .Where(s => s.OwnerId == ownerId && s.IsActive)
            .ToListAsync(ct);

        var result = new List<SalonDashboardDto>();
        var today = DateTime.Today;
        var weekStart = today.AddDays(-(int)today.DayOfWeek + 1);

        foreach (var salon in salons)
        {
            var appointments = await _db.Appointments
                .Where(a => a.SalonId == salon.Id)
                .ToListAsync(ct);

            var barbers = await _db.Barbers
                .Where(b => b.SalonId == salon.Id && b.IsActive)
                .ToListAsync(ct);

            result.Add(new SalonDashboardDto
            {
                SalonId = salon.Id,
                SalonName = salon.Name,
                TodayAppointments = appointments.Count(a =>
                    a.AppointedAt.Date == today &&
                    a.Status != AppointmentStatus.Cancelled),
                PendingCount = appointments.Count(a =>
                    a.Status == AppointmentStatus.Pending),
                CompletedThisWeek = appointments.Count(a =>
                    a.Status == AppointmentStatus.Completed &&
                    a.AppointedAt >= weekStart),
                AverageRating = barbers.Count > 0
                    ? Math.Round(barbers.Average(b => b.AverageRating), 1)
                    : 0,
                TotalBarbers = barbers.Count,
            });
        }

        return result;
    }

    // ── Salon Randevuları ─────────────────────────────────────────────
    public async Task<IReadOnlyList<SalonAppointmentListDto>> GetSalonAppointmentsAsync(
        string ownerId, int salonId, string? statusFilter, CancellationToken ct = default)
    {
        await EnsureOwnerAsync(ownerId, salonId, ct);

        var query = _db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Barber)
            .Where(a => a.SalonId == salonId);

        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<AppointmentStatus>(statusFilter, out var status))
            query = query.Where(a => a.Status == status);

        var list = await query.OrderByDescending(a => a.AppointedAt).ToListAsync(ct);

        return list.Select(a => new SalonAppointmentListDto
        {
            Id = a.Id,
            CustomerName = $"{a.Customer.FirstName} {a.Customer.LastName}".Trim(),
            BarberName = a.Barber.DisplayName,
            AppointedAt = a.AppointedAt,
            DurationMinutes = a.DurationMinutes,
            Status = a.Status.ToString(),
            StatusLabel = StatusLabel(a.Status),
            Notes = a.Notes,
        }).ToList();
    }

    // ── Randevu Onayla ────────────────────────────────────────────────
    public async Task ConfirmAsync(int appointmentId, string ownerId, CancellationToken ct = default)
    {
        var appt = await GetAppointmentForOwnerAsync(appointmentId, ownerId, ct);
        if (appt.Status != AppointmentStatus.Pending)
            throw new Exception("Yalnızca 'Beklemede' durumundaki randevular onaylanabilir.");
        appt.Status = AppointmentStatus.Confirmed;
        appt.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    // ── Salon Tarafından İptal ────────────────────────────────────────
    public async Task CancelByOwnerAsync(int appointmentId, string ownerId, CancellationToken ct = default)
    {
        var appt = await GetAppointmentForOwnerAsync(appointmentId, ownerId, ct);
        if (appt.Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled)
            throw new Exception("Tamamlanmış veya zaten iptal edilmiş randevu iptal edilemez.");
        appt.Status = AppointmentStatus.Cancelled;
        appt.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    // ── Randevu Tamamla ───────────────────────────────────────────────
    public async Task CompleteAsync(int appointmentId, string ownerId, CancellationToken ct = default)
    {
        var appt = await GetAppointmentForOwnerAsync(appointmentId, ownerId, ct);
        if (appt.Status != AppointmentStatus.Confirmed)
            throw new Exception("Yalnızca 'Onaylandı' durumundaki randevular tamamlanabilir.");
        appt.Status = AppointmentStatus.Completed;
        appt.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    // ── Berber Listele ────────────────────────────────────────────────
    public async Task<IReadOnlyList<BarberListDto>> GetBarbersAsync(string ownerId, int salonId, CancellationToken ct = default)
    {
        await EnsureOwnerAsync(ownerId, salonId, ct);

        return await _db.Barbers
            .AsNoTracking()
            .Where(b => b.SalonId == salonId)
            .Select(b => new BarberListDto
            {
                Id = b.Id,
                DisplayName = b.DisplayName,
                SlotDurationMinutes = b.SlotDurationMinutes,
                WorkStartHour = b.WorkStartHour,
                WorkEndHour = b.WorkEndHour,
                AverageRating = b.AverageRating,
                ReviewCount = b.ReviewCount,
            })
            .ToListAsync(ct);
    }

    // ── Berber Ekle ───────────────────────────────────────────────────
    public async Task<BarberListDto> AddBarberAsync(string ownerId, int salonId, CreateBarberDto dto, CancellationToken ct = default)
    {
        await EnsureOwnerAsync(ownerId, salonId, ct);

        AppUser user;
        if (dto.IsSelf)
        {
            // Salon sahibi kendisini berber olarak ekliyor
            user = await _userManager.FindByIdAsync(ownerId)
                ?? throw new Exception("Kullanıcı bulunamadı.");

            // Zaten bu salonda berber mi?
            var alreadyBarber = await _db.Barbers.AnyAsync(b => b.UserId == ownerId && b.SalonId == salonId, ct);
            if (alreadyBarber)
                throw new Exception("Bu salonda zaten berber olarak kayıtlısınız.");
        }
        else
        {
            // Yeni berber kullanıcı hesabı oluştur
            user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                user = new AppUser
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    UserName = dto.Email,
                    Role = "Barber",
                };
                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"Berber hesabı oluşturulamadı: {errors}");
                }
            }
        }

        var barber = new Barber
        {
            UserId = user.Id,
            SalonId = salonId,
            DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName)
                ? $"{user.FirstName} {user.LastName}".Trim()
                : dto.DisplayName,
            WorkStartHour = dto.WorkStartHour,
            WorkEndHour = dto.WorkEndHour,
            SlotDurationMinutes = dto.SlotDurationMinutes,
        };

        _db.Barbers.Add(barber);
        await _db.SaveChangesAsync(ct);

        return new BarberListDto
        {
            Id = barber.Id,
            DisplayName = barber.DisplayName,
            SlotDurationMinutes = barber.SlotDurationMinutes,
            WorkStartHour = barber.WorkStartHour,
            WorkEndHour = barber.WorkEndHour,
        };
    }

    // ── Berber Güncelle ───────────────────────────────────────────────
    public async Task<BarberListDto> UpdateBarberAsync(string ownerId, int barberId, UpdateBarberDto dto, CancellationToken ct = default)
    {
        var barber = await _db.Barbers.FirstOrDefaultAsync(b => b.Id == barberId, ct)
            ?? throw new Exception("Berber bulunamadı.");

        await EnsureOwnerAsync(ownerId, barber.SalonId, ct);

        barber.DisplayName = dto.DisplayName;
        barber.WorkStartHour = dto.WorkStartHour;
        barber.WorkEndHour = dto.WorkEndHour;
        barber.SlotDurationMinutes = dto.SlotDurationMinutes;
        barber.IsActive = dto.IsActive;

        await _db.SaveChangesAsync(ct);

        return new BarberListDto
        {
            Id = barber.Id,
            DisplayName = barber.DisplayName,
            SlotDurationMinutes = barber.SlotDurationMinutes,
            WorkStartHour = barber.WorkStartHour,
            WorkEndHour = barber.WorkEndHour,
            AverageRating = barber.AverageRating,
            ReviewCount = barber.ReviewCount,
        };
    }

    // ── Berber Sil (Soft Delete) ──────────────────────────────────────
    public async Task RemoveBarberAsync(string ownerId, int barberId, CancellationToken ct = default)
    {
        var barber = await _db.Barbers.FirstOrDefaultAsync(b => b.Id == barberId, ct)
            ?? throw new Exception("Berber bulunamadı.");

        await EnsureOwnerAsync(ownerId, barber.SalonId, ct);

        barber.IsActive = false;
        await _db.SaveChangesAsync(ct);
    }

    // ── Yardımcı ──────────────────────────────────────────────────────
    private async Task EnsureOwnerAsync(string ownerId, int salonId, CancellationToken ct)
    {
        var isOwner = await _db.Salons.AnyAsync(s => s.Id == salonId && s.OwnerId == ownerId, ct);
        if (!isOwner)
            throw new Exception("Bu salon size ait değil.");
    }

    private async Task<Appointment> GetAppointmentForOwnerAsync(int appointmentId, string ownerId, CancellationToken ct)
    {
        var appt = await _db.Appointments
            .Include(a => a.Salon)
            .FirstOrDefaultAsync(a => a.Id == appointmentId, ct)
            ?? throw new Exception("Randevu bulunamadı.");

        if (appt.Salon.OwnerId != ownerId)
            throw new Exception("Bu randevu sizin salonunuza ait değil.");

        return appt;
    }

    private static string StatusLabel(AppointmentStatus s) => s switch
    {
        AppointmentStatus.Pending => "Beklemede",
        AppointmentStatus.Confirmed => "Onaylandı",
        AppointmentStatus.Completed => "Tamamlandı",
        AppointmentStatus.Cancelled => "İptal Edildi",
        _ => "Bilinmiyor"
    };
}
