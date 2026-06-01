using KuaforRandevu.Application.DTOs.Notification;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly ISignalRNotificationService _signalR;
    private readonly IPushNotificationService _push;

    public NotificationService(AppDbContext db, ISignalRNotificationService signalR, IPushNotificationService push)
    {
        _db = db;
        _signalR = signalR;
        _push = push;
    }

    // ── Kullanıcının Bildirimleri ────────────────────────────────────────
    public async Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(string userId, CancellationToken ct = default)
    {
        return await _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                RelatedAppointmentId = n.RelatedAppointmentId,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
            })
            .ToListAsync(ct);
    }

    // ── Okunmamış Sayısı ────────────────────────────────────────────────
    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default)
    {
        return await _db.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct);
    }

    // ── Tek Bildirimi Okundu Yap ────────────────────────────────────────
    public async Task MarkAsReadAsync(int notificationId, string userId, CancellationToken ct = default)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct)
            ?? throw new Exception("Bildirim bulunamadı.");

        notification.IsRead = true;
        await _db.SaveChangesAsync(ct);

        // Okunmamış sayısını güncelle
        var unreadCount = await GetUnreadCountAsync(userId, ct);
        await _signalR.SendUnreadCountAsync(userId, unreadCount, ct);
    }

    // ── Tümünü Okundu Yap ───────────────────────────────────────────────
    public async Task MarkAllAsReadAsync(string userId, CancellationToken ct = default)
    {
        await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);

        await _signalR.SendUnreadCountAsync(userId, 0, ct);
    }

    // ── Bildirim Oluştur + SignalR + Push ───────────────────────────────
    public async Task CreateAndSendAsync(string userId, string title, string message, string type, int? appointmentId = null, CancellationToken ct = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            RelatedAppointmentId = appointmentId,
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(ct);

        var dto = new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            RelatedAppointmentId = notification.RelatedAppointmentId,
            IsRead = false,
            CreatedAt = notification.CreatedAt,
        };

        // SignalR ile anlık gönder
        await _signalR.SendNotificationAsync(userId, dto, ct);

        // Okunmamış sayısını güncelle
        var unreadCount = await GetUnreadCountAsync(userId, ct);
        await _signalR.SendUnreadCountAsync(userId, unreadCount, ct);

        // Push notification gönder
        await _push.SendPushAsync(userId, title, message, new { type, appointmentId }, ct);
    }
}
