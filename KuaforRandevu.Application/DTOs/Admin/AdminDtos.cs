using KuaforRandevu.Domain.Enums;

namespace KuaforRandevu.Application.DTOs.Admin;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateRoleDto
{
    public string Role { get; set; } = string.Empty;
}

public class SystemStatisticsDto
{
    public int TotalUsers { get; set; }
    public int TotalSalons { get; set; }
    public int TotalAppointments { get; set; }
    public int PendingSalons { get; set; }
}

public class SalonAdminDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public ApprovalStatus ApprovalStatus { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
