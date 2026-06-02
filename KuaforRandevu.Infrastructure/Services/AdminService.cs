using KuaforRandevu.Application.DTOs.Admin;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Domain.Enums;
using KuaforRandevu.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace KuaforRandevu.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;

    public AdminService(UserManager<AppUser> userManager, AppDbContext db, INotificationService notificationService)
    {
        _userManager = userManager;
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<IReadOnlyList<UserDto>> GetUsersAsync(CancellationToken ct = default)
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(ct);

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email!,
            Role = u.Role,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }).ToList();
    }

    public async Task UpdateUserRoleAsync(string userId, string role, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new Exception("Kullanıcı bulunamadı.");

        user.Role = role;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception("Rol güncellenirken bir hata oluştu.");
    }

    public async Task ToggleUserStatusAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new Exception("Kullanıcı bulunamadı.");

        if (user.Role == "Admin")
            throw new Exception("Admin kullanıcısı banlanamaz.");

        user.IsActive = !user.IsActive;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception("Kullanıcı durumu güncellenirken bir hata oluştu.");
    }

    public async Task<IReadOnlyList<SalonAdminDto>> GetSalonsAsync(CancellationToken ct = default)
    {
        var salons = await _db.Salons
            .AsNoTracking()
            .Include(s => s.Owner)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);

        return salons.Select(s => new SalonAdminDto
        {
            Id = s.Id,
            Name = s.Name,
            OwnerName = $"{s.Owner.FirstName} {s.Owner.LastName}",
            City = s.City,
            ApprovalStatus = s.ApprovalStatus,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        }).ToList();
    }

    public async Task UpdateSalonApprovalStatusAsync(int salonId, ApprovalStatus status, CancellationToken ct = default)
    {
        var salon = await _db.Salons
            .Include(s => s.Owner)
            .FirstOrDefaultAsync(s => s.Id == salonId, ct)
            ?? throw new Exception("Salon bulunamadı.");

        salon.ApprovalStatus = status;
        await _db.SaveChangesAsync(ct);

        // Bildirim gönder (Task 6)
        string title = status == ApprovalStatus.Approved ? "Salon Onaylandı ✅" : "Salon Reddedildi ❌";
        string message = status == ApprovalStatus.Approved 
            ? $"Tebrikler! {salon.Name} adlı salonunuz onaylandı ve artık sistemde aktif."
            : $"Maalesef {salon.Name} adlı salon başvurunuz reddedildi.";

        await _notificationService.CreateAndSendAsync(
            salon.OwnerId,
            title,
            message,
            NotificationType.SystemAlert, // Yeni tip olarak eklenebilir veya SystemAlert
            null,
            ct);
    }

    public async Task<SystemStatisticsDto> GetStatisticsAsync(CancellationToken ct = default)
    {
        var totalUsers = await _userManager.Users.CountAsync(ct);
        var totalSalons = await _db.Salons.CountAsync(ct);
        var pendingSalons = await _db.Salons.CountAsync(s => s.ApprovalStatus == ApprovalStatus.Pending, ct);
        var totalAppointments = await _db.Appointments.CountAsync(ct);

        return new SystemStatisticsDto
        {
            TotalUsers = totalUsers,
            TotalSalons = totalSalons,
            TotalAppointments = totalAppointments,
            PendingSalons = pendingSalons
        };
    }
}
