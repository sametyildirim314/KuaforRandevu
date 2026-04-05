using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/barbers")]
[Authorize]
public class BarbersController : ControllerBase
{
    private readonly IAppointmentService _svc;
    public BarbersController(IAppointmentService svc) => _svc = svc;

    /// <summary>Berberin randevuları</summary>
    [HttpGet("{id:int}/appointments")]
    public async Task<IActionResult> GetAppointments(int id, CancellationToken ct)
    {
        var list = await _svc.GetBarberAppointmentsAsync(id, ct);
        return Ok(list);
    }

    /// <summary>Berberin müsait saatleri — ?date=YYYY-MM-DD</summary>
    [HttpGet("{id:int}/availability")]
    public async Task<IActionResult> GetAvailability(int id, [FromQuery] string date, CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return BadRequest("Geçersiz tarih formatı. YYYY-MM-DD kullanın.");

        var slots = await _svc.GetAvailableSlotsAsync(id, parsedDate, ct);
        return Ok(slots);
    }
}
