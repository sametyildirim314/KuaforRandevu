using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/barbers")]
[Authorize]
public class BarbersController : ControllerBase
{
    private readonly IAppointmentService _appointmentSvc;
    private readonly IReviewService _reviewSvc;

    public BarbersController(IAppointmentService appointmentSvc, IReviewService reviewSvc)
    {
        _appointmentSvc = appointmentSvc;
        _reviewSvc = reviewSvc;
    }

    /// <summary>Berberin randevuları</summary>
    [HttpGet("{id:int}/appointments")]
    public async Task<IActionResult> GetAppointments(int id, CancellationToken ct)
    {
        var list = await _appointmentSvc.GetBarberAppointmentsAsync(id, ct);
        return Ok(list);
    }

    /// <summary>Berberin müsait saatleri — ?date=YYYY-MM-DD</summary>
    [HttpGet("{id:int}/availability")]
    public async Task<IActionResult> GetAvailability(int id, [FromQuery] string date, CancellationToken ct)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return BadRequest("Geçersiz tarih formatı. YYYY-MM-DD kullanın.");

        var slots = await _appointmentSvc.GetAvailableSlotsAsync(id, parsedDate, ct);
        return Ok(slots);
    }

    /// <summary>Berberin değerlendirmeleri (herkese açık)</summary>
    [HttpGet("{id:int}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(int id, CancellationToken ct)
    {
        var reviews = await _reviewSvc.GetBarberReviewsAsync(id, ct);
        return Ok(reviews);
    }
}
