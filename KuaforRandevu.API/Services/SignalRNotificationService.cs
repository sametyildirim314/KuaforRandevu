using KuaforRandevu.API.Hubs;
using KuaforRandevu.Application.DTOs.Notification;
using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace KuaforRandevu.API.Services;

public class SignalRNotificationService : ISignalRNotificationService
{
    private readonly IHubContext<NotificationHub> _hub;

    public SignalRNotificationService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public async Task SendNotificationAsync(string userId, NotificationDto dto, CancellationToken ct = default)
    {
        await _hub.Clients.Group(userId).SendAsync("ReceiveNotification", dto, ct);
    }

    public async Task SendUnreadCountAsync(string userId, int count, CancellationToken ct = default)
    {
        await _hub.Clients.Group(userId).SendAsync("UnreadCountUpdated", count, ct);
    }
}
