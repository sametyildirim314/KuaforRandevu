namespace KuaforRandevu.Application.Interfaces;

public interface IPushNotificationService
{
    /// <summary>Belirli bir kullanıcıya Expo Push Notification gönderir</summary>
    Task SendPushAsync(string userId, string title, string body, object? data = null, CancellationToken ct = default);
}
