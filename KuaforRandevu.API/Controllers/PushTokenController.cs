using System.Security.Claims;
using KuaforRandevu.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/push-token")]
[Authorize]
public class PushTokenController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    public PushTokenController(UserManager<AppUser> userManager) => _userManager = userManager;

    /// <summary>Expo Push Token'ı kullanıcıya kaydet</summary>
    [HttpPost]
    public async Task<IActionResult> SaveToken([FromBody] SavePushTokenDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        user.ExpoPushToken = dto.Token;
        await _userManager.UpdateAsync(user);

        return NoContent();
    }
}

public class SavePushTokenDto
{
    public string Token { get; set; } = string.Empty;
}
