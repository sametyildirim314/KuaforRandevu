using KuaforRandevu.Application.DTOs.Appointment;
using KuaforRandevu.Application.DTOs.Barber;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Domain.Enums;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationSvc;

    public AppointmentService(AppDbContext db, INotificationService notificationSvc)
    {
        _db = db;
        _notificationSvc = notificationSvc;
    }

    // ── Randevu Oluştur ──────────────────────────────────────────────
    public async Task<AppointmentDetailDto> CreateAsync(string customerId, CreateAppointmentDto dto, CancellationToken ct = default)
    {
        var barber = await _db.Barbers
            .FirstOrDefaultAsync(b => b.Id == dto.BarberId && b.IsActive, ct)
            ?? throw new Exception("Kuaför bulunamadı.");

        if (dto.AppointedAt <= DateTime.Now)
            throw new Exception("Randevu geçmiş bir tarih/saat için oluşturulamaz.");

        // Çalışma saatleri kontrolü
        var apptTime = TimeOnly.FromDateTime(dto.AppointedAt);
        var workStart = new TimeOnly(barber.WorkStartHour, 0);
        var workEnd = new TimeOnly(barber.WorkEndHour, 0);
        if (apptTime < workStart || apptTime.AddMinutes(barber.SlotDurationMinutes) > workEnd)
            throw new Exception("Seçilen saat kuaförün çalışma saatleri dışında.");

        // Çakışma kontrolü — aynı kuaförde aynı dilimde başka randevu var mı?
        var slotEnd = dto.AppointedAt.AddMinutes(barber.SlotDurationMinutes);
        var conflict = await _db.Appointments.AnyAsync(a =>
            a.BarberId == dto.BarberId &&
            a.Status != AppointmentStatus.Cancelled &&
            a.AppointedAt < slotEnd &&
            a.AppointedAt.AddMinutes(a.DurationMinutes) > dto.AppointedAt, ct);

        if (conflict)
            throw new Exception("Seçilen saat dilimi dolu. Lütfen başka bir saat seçin.");

        var appointment = new Appointment
        {
            CustomerId = customerId,
            BarberId = dto.BarberId,
            SalonId = dto.SalonId,
            AppointedAt = dto.AppointedAt,
            DurationMinutes = barber.SlotDurationMinutes,
            Price = dto.Price,
            Notes = dto.Notes,
            Status = AppointmentStatus.Pending,
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync(ct);

        // Salon sahibine bildirim gönder
        var salon = await _db.Salons.AsNoTracking().FirstOrDefaultAsync(s => s.Id == dto.SalonId, ct);
        if (salon != null)
        {
            var customer = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == customerId, ct);
            var customerName = customer != null ? $"{customer.FirstName} {customer.LastName}".Trim() : "Bir müşteri";
            await _notificationSvc.CreateAndSendAsync(
                salon.OwnerId,
                "Yeni Randevu 📅",
                $"{customerName}, {barber.DisplayName} için {dto.AppointedAt:dd MMM yyyy HH:mm} tarihinde randevu aldı.",
                Domain.Enums.NotificationType.NewAppointment,
                appointment.Id,
                ct);
        }

        return (await LoadDetailAsync(appointment.Id, ct))!;
    }

    // ── Müşterinin Randevuları ────────────────────────────────────────
    public async Task<IReadOnlyList<AppointmentListDto>> GetMyAppointmentsAsync(string customerId, CancellationToken ct = default)
    {
        var list = await _db.Appointments
            .AsNoTracking()
            .Include(a => a.Barber)
            .Include(a => a.Salon)
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.AppointedAt)
            .ToListAsync(ct);

        return list.Select(ToListDto).ToList();
    }

    // ── Randevu Detayı ────────────────────────────────────────────────
    public async Task<AppointmentDetailDto?> GetByIdAsync(int id, string userId, CancellationToken ct = default)
    {
        var appt = await _db.Appointments
            .AsNoTracking()
            .Include(a => a.Barber)
            .Include(a => a.Salon)
            .FirstOrDefaultAsync(a => a.Id == id && (a.CustomerId == userId || a.Barber.UserId == userId), ct);

        return appt == null ? null : ToDetailDto(appt);
    }

    // ── İptal Et ─────────────────────────────────────────────────────
    public async Task CancelAsync(int id, string userId, CancellationToken ct = default)
    {
        var appt = await _db.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && a.CustomerId == userId, ct)
            ?? throw new Exception("Randevu bulunamadı veya bu işlem için yetkiniz yok.");

        if (appt.Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled)
            throw new Exception("Bu randevu zaten tamamlanmış veya iptal edilmiş.");

        appt.Status = AppointmentStatus.Cancelled;
        appt.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync(ct);
    }

    // ── Durum Güncelle (Berber tarafı) ───────────────────────────────
    public async Task UpdateStatusAsync(int id, AppointmentStatus status, CancellationToken ct = default)
    {
        var appt = await _db.Appointments
            .Include(a => a.Barber)
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new Exception("Randevu bulunamadı.");

        appt.Status = status;
        appt.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync(ct);

        // Müşteriye bildirim gönder (Senkronizasyon)
        var msg = status switch
        {
            AppointmentStatus.Confirmed => $"Randevunuz onaylandı! ({appt.AppointedAt:dd MMM HH:mm})",
            AppointmentStatus.Completed => $"Randevunuz tamamlandı. Bizi tercih ettiğiniz için teşekkürler!",
            AppointmentStatus.Cancelled => $"Üzgünüz, randevunuz iptal edildi. ({appt.AppointedAt:dd MMM HH:mm})",
            _ => "Randevu durumunuz güncellendi."
        };

        var notifType = status switch
        {
            AppointmentStatus.Confirmed => Domain.Enums.NotificationType.AppointmentConfirmed,
            AppointmentStatus.Completed => Domain.Enums.NotificationType.AppointmentCompleted,
            AppointmentStatus.Cancelled => Domain.Enums.NotificationType.AppointmentCancelled,
            _ => Domain.Enums.NotificationType.SystemAlert
        };

        await _notificationSvc.CreateAndSendAsync(
            appt.CustomerId,
            "Randevu Güncellemesi",
            msg,
            notifType,
            appt.Id,
            ct);
    }

    // ── Müsait Saatler ────────────────────────────────────────────────
    public async Task<IReadOnlyList<AvailableSlotDto>> GetAvailableSlotsAsync(int barberId, DateOnly date, CancellationToken ct = default)
    {
        var barber = await _db.Barbers.FindAsync(new object[] { barberId }, ct)
            ?? throw new Exception("Kuaför bulunamadı.");

        var dayStart = date.ToDateTime(TimeOnly.MinValue);
        var dayEnd = date.ToDateTime(TimeOnly.MaxValue);

        // O gün iptal olmayan randevuları getir
        var existing = await _db.Appointments
            .Where(a => a.BarberId == barberId &&
                        a.AppointedAt >= dayStart &&
                        a.AppointedAt <= dayEnd &&
                        a.Status != AppointmentStatus.Cancelled)
            .Select(a => new { a.AppointedAt, a.DurationMinutes })
            .ToListAsync(ct);

        var slots = new List<AvailableSlotDto>();
        var current = new TimeOnly(barber.WorkStartHour, 0);
        var endTime = new TimeOnly(barber.WorkEndHour, 0);
        var now = DateTime.Now;

        while (current.AddMinutes(barber.SlotDurationMinutes) <= endTime)
        {
            var slotStart = date.ToDateTime(current);
            var slotEnd = slotStart.AddMinutes(barber.SlotDurationMinutes);

            bool isPast = slotStart <= now;
            bool hasConflict = existing.Any(a =>
                a.AppointedAt < slotEnd &&
                a.AppointedAt.AddMinutes(a.DurationMinutes) > slotStart);

            slots.Add(new AvailableSlotDto
            {
                Time = current.ToString("HH:mm"),
                IsAvailable = !isPast && !hasConflict,
            });

            current = current.AddMinutes(barber.SlotDurationMinutes);
        }

        return slots;
    }

    // ── Berberin Randevuları ──────────────────────────────────────────
    public async Task<IReadOnlyList<AppointmentListDto>> GetBarberAppointmentsAsync(int barberId, string? statusFilter = null, CancellationToken ct = default)
    {
        var query = _db.Appointments
            .AsNoTracking()
            .Include(a => a.Barber)
            .Include(a => a.Salon)
            .Include(a => a.Customer)
            .Where(a => a.BarberId == barberId);

        // Status filtresi uygula
        if (!string.IsNullOrEmpty(statusFilter) && Enum.TryParse<AppointmentStatus>(statusFilter, out var status))
        {
            query = query.Where(a => a.Status == status);
        }

        var list = await query
            .OrderByDescending(a => a.AppointedAt)
            .ToListAsync(ct);

        return list.Select(ToListDto).ToList();
    }

    // ── Yardımcı Metodlar ─────────────────────────────────────────────
    private async Task<AppointmentDetailDto?> LoadDetailAsync(int id, CancellationToken ct)
    {
        var appt = await _db.Appointments
            .AsNoTracking()
            .Include(a => a.Barber)
            .Include(a => a.Salon)
            .Include(a => a.Customer)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

        return appt == null ? null : ToDetailDto(appt);
    }

    /// Randevunun süresi dolmuş mu kontrol eder (Pending veya Confirmed iken zaman geçmişse)
    private static bool IsExpired(Appointment a) =>
        a.Status is AppointmentStatus.Pending or AppointmentStatus.Confirmed &&
        a.AppointedAt.AddMinutes(a.DurationMinutes) < DateTime.Now;

    private static AppointmentListDto ToListDto(Appointment a)
    {
        var expired = IsExpired(a);
        return new AppointmentListDto
        {
            Id = a.Id,
            BarberId = a.BarberId,
            SalonId = a.SalonId,
            BarberName = a.Barber?.DisplayName ?? string.Empty,
            SalonName = a.Salon?.Name ?? string.Empty,
            CustomerName = (a.Customer?.FirstName + " " + a.Customer?.LastName).Trim(),
            AppointedAt = a.AppointedAt,
            DurationMinutes = a.DurationMinutes,
            Price = a.Price,
            Status = expired ? "Expired" : a.Status.ToString(),
            StatusLabel = expired ? "Süresi Doldu" : StatusLabel(a.Status),
            Notes = a.Notes
        };
    }

    private static AppointmentDetailDto ToDetailDto(Appointment a)
    {
        var expired = IsExpired(a);
        return new()
        {
            Id = a.Id,
            BarberId = a.BarberId,
            BarberName = a.Barber?.DisplayName ?? "Bilinmeyen",
            SalonName = a.Salon?.Name ?? "Bilinmeyen",
            AppointedAt = a.AppointedAt,
            DurationMinutes = a.DurationMinutes,
            Status = expired ? "Expired" : a.Status.ToString(),
            StatusLabel = expired ? "Süresi Doldu" : StatusLabel(a.Status),
            Notes = a.Notes,
            CreatedAt = a.CreatedAt,
        };
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
