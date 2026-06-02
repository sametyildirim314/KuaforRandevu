using KuaforRandevu.Application.DTOs.Admin;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KuaforRandevu.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
        => Ok(await _adminService.GetUsersAsync(ct));

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleDto dto, CancellationToken ct)
    {
        await _adminService.UpdateUserRoleAsync(id, dto.Role, ct);
        return NoContent();
    }

    [HttpPut("users/{id}/status")]
    public async Task<IActionResult> ToggleUserStatus(string id, CancellationToken ct)
    {
        await _adminService.ToggleUserStatusAsync(id, ct);
        return NoContent();
    }

    [HttpGet("salons")]
    public async Task<IActionResult> GetSalons(CancellationToken ct)
        => Ok(await _adminService.GetSalonsAsync(ct));

    [HttpPut("salons/{id}/approve")]
    public async Task<IActionResult> UpdateSalonStatus(int id, [FromBody] int status, CancellationToken ct)
    {
        // Enum'u integer olarak alıp Enum'a dönüştürüyoruz
        var approvalStatus = (ApprovalStatus)status;
        await _adminService.UpdateSalonApprovalStatusAsync(id, approvalStatus, ct);
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(CancellationToken ct)
        => Ok(await _adminService.GetStatisticsAsync(ct));
}
