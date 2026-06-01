using KuaforRandevu.Application.DTOs.Notification;

namespace KuaforRandevu.Application.Interfaces;

public interface ISignalRNotificationService
{
    Task SendNotificationAsync(string userId, NotificationDto dto, CancellationToken ct = default);
    Task SendUnreadCountAsync(string userId, int count, CancellationToken ct = default);
}
