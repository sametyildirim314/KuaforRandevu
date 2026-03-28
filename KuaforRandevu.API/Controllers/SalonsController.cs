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
}
