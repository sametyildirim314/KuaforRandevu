using KuaforRandevu.Application.DTOs.Appointment;
using KuaforRandevu.Application.DTOs.Barber;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Enums;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class BarberDashboardService : IBarberDashboardService
{
    private readonly AppDbContext _db;

    public BarberDashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<BarberDashboardSummaryDto> GetDashboardSummaryAsync(int barberId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var todayAppointments = await _db.Appointments
            .Where(a => a.BarberId == barberId && a.AppointedAt >= today && a.AppointedAt < tomorrow)
            .ToListAsync(ct);

        var totalAppointmentsToday = todayAppointments.Count;
        var pendingCount = todayAppointments.Count(a => a.Status == AppointmentStatus.Pending);
        var todayEarnings = todayAppointments.Where(a => a.Status == AppointmentStatus.Completed).Sum(a => a.Price);

        return new BarberDashboardSummaryDto
        {
            TotalAppointmentsToday = totalAppointmentsToday,
            PendingAppointmentsCount = pendingCount,
            TodayEarnings = todayEarnings
        };
    }

    public async Task<List<AppointmentListDto>> GetDailyScheduleAsync(int barberId, DateTime date, CancellationToken ct = default)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var appointments = await _db.Appointments
            .Include(a => a.Barber)
            .Include(a => a.Salon)
            .Include(a => a.Customer)
            .Where(a => a.BarberId == barberId && a.AppointedAt >= startOfDay && a.AppointedAt < endOfDay)
            .OrderBy(a => a.AppointedAt)
            .Select(a => new AppointmentListDto
            {
                Id = a.Id,
                BarberId = a.BarberId,
                BarberName = a.Barber.DisplayName,
                SalonName = a.Salon.Name,
                AppointedAt = a.AppointedAt,
                DurationMinutes = a.DurationMinutes,
                Status = a.Status.ToString(),
                StatusLabel = GetStatusLabel(a.Status)
            })
            .ToListAsync(ct);

        return appointments;
    }

    public async Task<BarberEarningsDto> GetEarningsAsync(int barberId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        
        // Calculate start of current week (assuming Monday)
        int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
        var startOfWeek = today.AddDays(-1 * diff);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var completedAppointments = await _db.Appointments
            .Where(a => a.BarberId == barberId && a.Status == AppointmentStatus.Completed)
            .ToListAsync(ct);

        var dailyEarnings = completedAppointments
            .Where(a => a.AppointedAt >= today && a.AppointedAt < tomorrow)
            .Sum(a => a.Price);

        var weeklyEarnings = completedAppointments
            .Where(a => a.AppointedAt >= startOfWeek)
            .Sum(a => a.Price);

        var monthlyEarnings = completedAppointments
            .Where(a => a.AppointedAt >= startOfMonth)
            .Sum(a => a.Price);

        var totalEarnings = completedAppointments.Sum(a => a.Price);

        return new BarberEarningsDto
        {
            DailyEarnings = dailyEarnings,
            WeeklyEarnings = weeklyEarnings,
            MonthlyEarnings = monthlyEarnings,
            TotalEarnings = totalEarnings
        };
    }

    public async Task<BarberWorkingHoursDto> GetWorkingHoursAsync(int barberId, CancellationToken ct = default)
    {
        var barber = await _db.Barbers.FindAsync(new object[] { barberId }, ct);
        if (barber == null) throw new Exception("Kuaför bulunamadı.");

        return new BarberWorkingHoursDto
        {
            WorkStartHour = barber.WorkStartHour,
            WorkEndHour = barber.WorkEndHour,
            SlotDurationMinutes = barber.SlotDurationMinutes
        };
    }

    public async Task UpdateWorkingHoursAsync(int barberId, BarberWorkingHoursDto dto, CancellationToken ct = default)
    {
        var barber = await _db.Barbers.FindAsync(new object[] { barberId }, ct);
        if (barber == null) throw new Exception("Kuaför bulunamadı.");

        if (dto.WorkStartHour < 0 || dto.WorkEndHour > 24 || dto.WorkStartHour >= dto.WorkEndHour)
            throw new Exception("Geçersiz çalışma saatleri.");

        barber.WorkStartHour = dto.WorkStartHour;
        barber.WorkEndHour = dto.WorkEndHour;
        if (dto.SlotDurationMinutes > 0)
        {
            barber.SlotDurationMinutes = dto.SlotDurationMinutes;
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAppointmentPriceAsync(int barberId, int appointmentId, decimal price, CancellationToken ct = default)
    {
        var appointment = await _db.Appointments.FindAsync(new object[] { appointmentId }, ct);
        if (appointment == null || appointment.BarberId != barberId)
            throw new Exception("Randevu bulunamadı veya bu randevuya erişim yetkiniz yok.");

        appointment.Price = price;
        await _db.SaveChangesAsync(ct);
    }

    private static string GetStatusLabel(AppointmentStatus status) => status switch
    {
        AppointmentStatus.Pending => "Bekliyor",
        AppointmentStatus.Confirmed => "Onaylandı",
        AppointmentStatus.Cancelled => "İptal Edildi",
        AppointmentStatus.Completed => "Tamamlandı",
        _ => "Bilinmiyor"
    };
}
