using KuaforRandevu.Application.DTOs.Notification;

namespace KuaforRandevu.Application.Interfaces;

public interface INotificationService
{
    /// <summary>Kullanıcının tüm bildirimlerini getirir (en yeniden eskiye)</summary>
    Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(string userId, CancellationToken ct = default);

    /// <summary>Okunmamış bildirim sayısını döndürür</summary>
    Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default);

    /// <summary>Tek bildirimi okundu olarak işaretler</summary>
    Task MarkAsReadAsync(int notificationId, string userId, CancellationToken ct = default);

    /// <summary>Kullanıcının tüm bildirimlerini okundu olarak işaretler</summary>
    Task MarkAllAsReadAsync(string userId, CancellationToken ct = default);

    /// <summary>Yeni bildirim oluşturur + SignalR ile anlık gönderir + push notification atar</summary>
    Task CreateAndSendAsync(string userId, string title, string message, string type, int? appointmentId = null, CancellationToken ct = default);
}
