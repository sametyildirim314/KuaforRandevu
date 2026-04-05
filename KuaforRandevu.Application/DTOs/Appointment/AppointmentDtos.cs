namespace KuaforRandevu.Application.DTOs.Appointment;

public class CreateAppointmentDto
{
    public int BarberId { get; set; }
    public int SalonId { get; set; }
    public DateTime AppointedAt { get; set; }
    public string? Notes { get; set; }
}

public class AppointmentListDto
{
    public int Id { get; set; }
    public string BarberName { get; set; } = string.Empty;
    public string SalonName { get; set; } = string.Empty;
    public DateTime AppointedAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;      // "Pending", "Confirmed"...
    public string StatusLabel { get; set; } = string.Empty; // "Beklemede", "Onaylandı"...
}

public class AppointmentDetailDto : AppointmentListDto
{
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateStatusDto
{
    public int Status { get; set; } // AppointmentStatus enum değeri (0-3)
}
