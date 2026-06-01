using System.Security.Claims;
using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _svc;
    public NotificationsController(INotificationService svc) => _svc = svc;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>Kullanıcının tüm bildirimleri</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetUserNotificationsAsync(UserId, ct);
        return Ok(list);
    }

    /// <summary>Okunmamış bildirim sayısı</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var count = await _svc.GetUnreadCountAsync(UserId, ct);
        return Ok(new { count });
    }

    /// <summary>Tek bildirimi okundu işaretle</summary>
    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken ct)
    {
        await _svc.MarkAsReadAsync(id, UserId, ct);
        return NoContent();
    }

    /// <summary>Tüm bildirimleri okundu işaretle</summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        await _svc.MarkAllAsReadAsync(UserId, ct);
        return NoContent();
    }
}
