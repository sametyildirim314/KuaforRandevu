using KuaforRandevu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Authorize]
public class GalleryController : ControllerBase
{
    private readonly IGalleryService _galleryService;

    public GalleryController(IGalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private string UserRole => User.FindFirstValue(ClaimTypes.Role)!;

    /// <summary>Kuaförün galerisini listeler (giriş gerekmez)</summary>
    [HttpGet("api/barbers/{id:int}/gallery")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByBarberId(int id, CancellationToken ct)
    {
        var list = await _galleryService.GetByBarberIdAsync(id, ct);
        return Ok(list);
    }

    /// <summary>Kuaför galerisine yeni resim yükler</summary>
    [HttpPost("api/barbers/{id:int}/gallery")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Lütfen geçerli bir dosya yükleyin.");

        using (var stream = file.OpenReadStream())
        {
            var result = await _galleryService.AddImageAsync(id, stream, file.FileName, ct);
            return Ok(result);
        }
    }

    /// <summary>Galeriden resim siler</summary>
    [HttpDelete("api/gallery/{id:int}")]
    public async Task<IActionResult> DeleteImage(int id, CancellationToken ct)
    {
        await _galleryService.DeleteImageAsync(id, UserId, UserRole, ct);
        return NoContent();
    }
}
