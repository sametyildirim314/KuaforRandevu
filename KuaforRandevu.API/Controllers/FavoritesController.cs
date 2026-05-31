using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favService;

    public FavoritesController(IFavoriteService favService)
    {
        _favService = favService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>Müşterinin favori salonlarını listeler</summary>
    [HttpGet("my")]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var list = await _favService.GetMyFavoritesAsync(UserId, ct);
        return Ok(list);
    }

    /// <summary>Salonu favorilere ekler</summary>
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] FavoriteRequest request, CancellationToken ct)
    {
        await _favService.AddFavoriteAsync(UserId, request.SalonId, ct);
        return Ok(new { message = "Salon favorilere eklendi." });
    }

    /// <summary>Salonu favorilerden çıkarır</summary>
    [HttpDelete("{salonId:int}")]
    public async Task<IActionResult> Remove(int salonId, CancellationToken ct)
    {
        await _favService.RemoveFavoriteAsync(UserId, salonId, ct);
        return Ok(new { message = "Salon favorilerden çıkarıldı." });
    }

    /// <summary>Salon favorilenmiş mi kontrol eder</summary>
    [HttpGet("{salonId:int}/check")]
    public async Task<IActionResult> Check(int salonId, CancellationToken ct)
    {
        var isFav = await _favService.IsFavoriteAsync(UserId, salonId, ct);
        return Ok(new { isFavorite = isFav });
    }
}

public class FavoriteRequest
{
    public int SalonId { get; set; }
}
