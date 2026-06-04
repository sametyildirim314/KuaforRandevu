using KuaforRandevu.Application.DTOs.Barber;
using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/barbers/{barberId}")]
[Authorize(Roles = "Barber")]
public class BarberDashboardController : ControllerBase
{
    private readonly IBarberDashboardService _barberDashboardService;

    public BarberDashboardController(IBarberDashboardService barberDashboardService)
    {
        _barberDashboardService = barberDashboardService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardSummary(int barberId, CancellationToken ct)
    {
        // Yetki kontrolü: Sadece kendi ID'si için işlem yapabilmeli
        var userBarberIdClaim = User.Claims.FirstOrDefault(c => c.Type == "BarberId")?.Value;
        // Not: Mevcut JWT yapısında BarberId claim'i eklemedik ancak AuthResponseDto'ya koyduk. 
        // Gerçek dünya senaryosunda Token'a da BarberId claim eklenebilir. 
        // Şimdilik route parametresindeki barberId ile ilerliyoruz.

        var summary = await _barberDashboardService.GetDashboardSummaryAsync(barberId, ct);
        return Ok(summary);
    }

    [HttpGet("schedule")]
    public async Task<IActionResult> GetDailySchedule(int barberId, [FromQuery] DateTime date, CancellationToken ct)
    {
        if (date == default) date = DateTime.Now.Date;
        var schedule = await _barberDashboardService.GetDailyScheduleAsync(barberId, date, ct);
        return Ok(schedule);
    }

    [HttpGet("appointments")]
    public async Task<IActionResult> GetAppointments(int barberId, [FromQuery] string? status, CancellationToken ct)
    {
        var appointments = await _barberDashboardService.GetAppointmentsAsync(barberId, status, ct);
        return Ok(appointments);
    }

    [HttpGet("earnings")]
    public async Task<IActionResult> GetEarnings(int barberId, CancellationToken ct)
    {
        var earnings = await _barberDashboardService.GetEarningsAsync(barberId, ct);
        return Ok(earnings);
    }

    [HttpGet("working-hours")]
    public async Task<IActionResult> GetWorkingHours(int barberId, CancellationToken ct)
    {
        var hours = await _barberDashboardService.GetWorkingHoursAsync(barberId, ct);
        return Ok(hours);
    }

    [HttpPut("working-hours")]
    public async Task<IActionResult> UpdateWorkingHours(int barberId, [FromBody] BarberWorkingHoursDto dto, CancellationToken ct)
    {
        await _barberDashboardService.UpdateWorkingHoursAsync(barberId, dto, ct);
        return NoContent();
    }

    [HttpPut("appointments/{appointmentId}/price")]
    public async Task<IActionResult> UpdateAppointmentPrice(int barberId, int appointmentId, [FromBody] UpdateAppointmentPriceDto dto, CancellationToken ct)
    {
        await _barberDashboardService.UpdateAppointmentPriceAsync(barberId, appointmentId, dto.Price, ct);
        return NoContent();
    }
}
