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

    public AppointmentService(AppDbContext db) => _db = db;

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
            Notes = dto.Notes,
            Status = AppointmentStatus.Pending,
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync(ct);

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
        appt.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    // ── Durum Güncelle (Berber tarafı) ───────────────────────────────
    public async Task UpdateStatusAsync(int id, AppointmentStatus status, CancellationToken ct = default)
    {
        var appt = await _db.Appointments.FindAsync(new object[] { id }, ct)
            ?? throw new Exception("Randevu bulunamadı.");

        appt.Status = status;
        appt.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
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
    public async Task<IReadOnlyList<AppointmentListDto>> GetBarberAppointmentsAsync(int barberId, CancellationToken ct = default)
    {
        var list = await _db.Appointments
            .AsNoTracking()
            .Include(a => a.Barber)
            .Include(a => a.Salon)
            .Where(a => a.BarberId == barberId)
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
            .FirstOrDefaultAsync(a => a.Id == id, ct);

        return appt == null ? null : ToDetailDto(appt);
    }

    private static AppointmentListDto ToListDto(Appointment a) => new()
    {
        Id = a.Id,
        BarberName = a.Barber.DisplayName,
        SalonName = a.Salon.Name,
        AppointedAt = a.AppointedAt,
        DurationMinutes = a.DurationMinutes,
        Status = a.Status.ToString(),
        StatusLabel = StatusLabel(a.Status),
    };

    private static AppointmentDetailDto ToDetailDto(Appointment a) => new()
    {
        Id = a.Id,
        BarberName = a.Barber.DisplayName,
        SalonName = a.Salon.Name,
        AppointedAt = a.AppointedAt,
        DurationMinutes = a.DurationMinutes,
        Status = a.Status.ToString(),
        StatusLabel = StatusLabel(a.Status),
        Notes = a.Notes,
        CreatedAt = a.CreatedAt,
    };

    private static string StatusLabel(AppointmentStatus s) => s switch
    {
        AppointmentStatus.Pending => "Beklemede",
        AppointmentStatus.Confirmed => "Onaylandı",
        AppointmentStatus.Completed => "Tamamlandı",
        AppointmentStatus.Cancelled => "İptal Edildi",
        _ => "Bilinmiyor"
    };
}
