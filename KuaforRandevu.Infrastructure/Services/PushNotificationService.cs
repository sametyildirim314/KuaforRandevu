using System.Net.Http.Json;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace KuaforRandevu.Infrastructure.Services;

/// <summary>
/// Expo Push Notification API entegrasyonu.
/// Kullanıcının ExpoPushToken'ı varsa Expo sunucusuna POST isteği atar.
/// </summary>
public class PushNotificationService : IPushNotificationService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<AppUser> _userManager;

    public PushNotificationService(IHttpClientFactory httpClientFactory, UserManager<AppUser> userManager)
    {
        _httpClientFactory = httpClientFactory;
        _userManager = userManager;
    }

    public async Task SendPushAsync(string userId, string title, string body, object? data = null, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user?.ExpoPushToken == null) return; // Token yoksa push göndermiyoruz

        var client = _httpClientFactory.CreateClient();
        var payload = new
        {
            to = user.ExpoPushToken,
            sound = "default",
            title,
            body,
            data = data ?? new { }
        };

        try
        {
            await client.PostAsJsonAsync("https://exp.host/--/api/v2/push/send", payload, ct);
        }
        catch
        {
            // Push başarısız olursa sessizce devam et — kritik değil
        }
    }
}
