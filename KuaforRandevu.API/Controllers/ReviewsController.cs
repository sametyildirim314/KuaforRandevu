using System.Security.Claims;
using KuaforRandevu.Application.DTOs.Review;
using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/reviews")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _svc;
    public ReviewsController(IReviewService svc) => _svc = svc;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>Yeni değerlendirme bırak (randevu tamamlanmış olmalı)</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto, CancellationToken ct)
    {
        var result = await _svc.CreateAsync(UserId, dto, ct);
        return Ok(result);
    }

    /// <summary>Belirli bir randevu için mevcut kullanıcının değerlendirmesini getir</summary>
    [HttpGet("my-review")]
    public async Task<IActionResult> GetMyReview([FromQuery] int appointmentId, CancellationToken ct)
    {
        var review = await _svc.GetByAppointmentIdAsync(appointmentId, UserId, ct);
        return review == null ? NotFound() : Ok(review);
    }

    /// <summary>Değerlendirmeyi sil (yalnızca sahibi yapabilir)</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _svc.DeleteAsync(id, UserId, ct);
        return NoContent();
    }
}
