using System.Security.Claims;
using KuaforRandevu.Application.DTOs.Salon;
using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/salon-dashboard")]
[Authorize]
public class SalonDashboardController : ControllerBase
{
    private readonly ISalonDashboardService _svc;
    public SalonDashboardController(ISalonDashboardService svc) => _svc = svc;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // ── Dashboard ──────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
        => Ok(await _svc.GetDashboardAsync(UserId, ct));

    // ── Randevu Yönetimi ───────────────────────────────────────────
    [HttpGet("appointments")]
    public async Task<IActionResult> GetAppointments([FromQuery] int salonId, [FromQuery] string? status, CancellationToken ct)
        => Ok(await _svc.GetSalonAppointmentsAsync(UserId, salonId, status, ct));

    [HttpPut("appointments/{id:int}/confirm")]
    public async Task<IActionResult> Confirm(int id, CancellationToken ct)
    {
        await _svc.ConfirmAsync(id, UserId, ct);
        return NoContent();
    }

    [HttpPut("appointments/{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await _svc.CancelByOwnerAsync(id, UserId, ct);
        return NoContent();
    }

    [HttpPut("appointments/{id:int}/complete")]
    public async Task<IActionResult> Complete(int id, CancellationToken ct)
    {
        await _svc.CompleteAsync(id, UserId, ct);
        return NoContent();
    }

    // ── Berber CRUD ────────────────────────────────────────────────
    [HttpGet("barbers")]
    public async Task<IActionResult> GetBarbers([FromQuery] int salonId, CancellationToken ct)
        => Ok(await _svc.GetBarbersAsync(UserId, salonId, ct));

    [HttpPost("barbers")]
    public async Task<IActionResult> AddBarber([FromQuery] int salonId, [FromBody] CreateBarberDto dto, CancellationToken ct)
        => Ok(await _svc.AddBarberAsync(UserId, salonId, dto, ct));

    [HttpPut("barbers/{id:int}")]
    public async Task<IActionResult> UpdateBarber(int id, [FromBody] UpdateBarberDto dto, CancellationToken ct)
        => Ok(await _svc.UpdateBarberAsync(UserId, id, dto, ct));

    [HttpDelete("barbers/{id:int}")]
    public async Task<IActionResult> RemoveBarber(int id, CancellationToken ct)
    {
        await _svc.RemoveBarberAsync(UserId, id, ct);
        return NoContent();
    }
}
