using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalonsController : ControllerBase
{
    private readonly ISalonService _salonService;

    public SalonsController(ISalonService salonService)
    {
        _salonService = salonService;
    }

    /// <summary>Aktif kuaför salonlarının listesi (giriş gerekmez)</summary>
    [HttpGet]
    [AllowAnonymous]
    [ResponseCache(Duration = 60, VaryByQueryKeys = new[] { "*" })]//
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var list = await _salonService.GetAllAsync(ct);
        return Ok(list);
    }

    /// <summary>Salon detayı (giriş gerekmez)</summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var salon = await _salonService.GetByIdAsync(id, ct);
        return salon == null ? NotFound() : Ok(salon);
    }

    /// <summary>Salona ait kuaförler (giriş gerekmez)</summary>
    [HttpGet("{id:int}/barbers")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBarbers(int id, CancellationToken ct)
    {
        var barbers = await _salonService.GetBarbersAsync(id, ct);
        return Ok(barbers);
    }

    /// <summary>Gelişmiş salon arama ve filtreleme (giriş gerekmez)</summary>
    [HttpGet("search")]
    [AllowAnonymous]
    [ResponseCache(Duration = 30, VaryByQueryKeys = new[] { "*" })] // Bu satır, endpoint'i 30 saniye boyunca cacheler. Yani her 30 saniyede bir veri tabanından veri çeker.
    public async Task<IActionResult> Search(
        [FromQuery] string? q, 
        [FromQuery] string? category, 
        [FromQuery] double? minRating, 
        [FromQuery] decimal? maxPrice, 
        CancellationToken ct)
    {
        var list = await _salonService.SearchAsync(q, category, minRating, maxPrice, ct);
        return Ok(list);
    }
}
