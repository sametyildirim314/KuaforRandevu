using System.Security.Claims;
using KuaforRandevu.Application.DTOs.Appointment;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _svc;
    public AppointmentsController(IAppointmentService svc) => _svc = svc;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>Yeni randevu oluştur</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto, CancellationToken ct)
    {
        var result = await _svc.CreateAsync(UserId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Benim randevularım</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var list = await _svc.GetMyAppointmentsAsync(UserId, ct);
        return Ok(list);
    }

    /// <summary>Randevu detayı</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _svc.GetByIdAsync(id, UserId, ct);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Randevuyu iptal et (müşteri)</summary>
    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await _svc.CancelAsync(id, UserId, ct);
        return NoContent();
    }

    /// <summary>Randevu durumunu güncelle (berber)</summary>
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto, CancellationToken ct)
    {
        if (!Enum.IsDefined(typeof(AppointmentStatus), dto.Status))
            return BadRequest("Geçersiz durum değeri.");

        await _svc.UpdateStatusAsync(id, (AppointmentStatus)dto.Status, ct);
        return NoContent();
    }
}
