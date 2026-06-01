using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Enums;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KuaforRandevu.Infrastructure.Services;

/// <summary>
/// Randevu hatırlatma background service'i.
/// Her 5 dakikada bir çalışır ve önümüzdeki 1 saat içindeki
/// Pending/Confirmed randevuları tarar. Daha önce hatırlatma
/// gönderilmemişlere bildirim oluşturur.
/// </summary>
public class AppointmentReminderService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AppointmentReminderService> _logger;

    public AppointmentReminderService(IServiceScopeFactory scopeFactory, ILogger<AppointmentReminderService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AppointmentReminderService başlatıldı.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hatırlatma kontrolü sırasında hata.");
            }

            // 5 dakika bekle
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task CheckAndSendRemindersAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var notificationSvc = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var now = DateTime.Now;
        var oneHourLater = now.AddHours(1);

        // Önümüzdeki 1 saat içindeki aktif randevuları bul
        var upcomingAppointments = await db.Appointments
            .Include(a => a.Barber)
            .Include(a => a.Salon)
            .Where(a =>
                (a.Status == AppointmentStatus.Pending || a.Status == AppointmentStatus.Confirmed) &&
                a.AppointedAt > now &&
                a.AppointedAt <= oneHourLater)
            .ToListAsync(ct);

        foreach (var appt in upcomingAppointments)
        {
            // Bu randevu için daha önce hatırlatma gönderilmiş mi kontrol et
            var alreadySent = await db.Notifications.AnyAsync(n =>
                n.UserId == appt.CustomerId &&
                n.Type == NotificationType.AppointmentReminder &&
                n.RelatedAppointmentId == appt.Id, ct);

            if (alreadySent) continue;

            var minutesLeft = (int)(appt.AppointedAt - now).TotalMinutes;
            var message = $"{appt.Salon.Name} - {appt.Barber.DisplayName} randevunuza {minutesLeft} dakika kaldı.";

            await notificationSvc.CreateAndSendAsync(
                appt.CustomerId,
                "Randevu Hatırlatması ⏰",
                message,
                NotificationType.AppointmentReminder,
                appt.Id,
                ct);

            _logger.LogInformation("Hatırlatma gönderildi: Appointment #{Id}, Customer: {CustomerId}", appt.Id, appt.CustomerId);
        }
    }
}
