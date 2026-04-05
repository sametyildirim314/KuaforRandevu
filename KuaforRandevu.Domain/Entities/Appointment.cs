using KuaforRandevu.Domain.Enums;

namespace KuaforRandevu.Domain.Entities;

public class Appointment
{
    public int Id { get; set; }

    // Randevuyu alan müşteri
    public string CustomerId { get; set; } = string.Empty;
    public AppUser Customer { get; set; } = null!;

    // Randevunun alındığı kuaför
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;

    // Randevunun yapıldığı salon
    public int SalonId { get; set; }
    public Salon Salon { get; set; } = null!;

    public DateTime AppointedAt { get; set; }     // Randevu zamanı
    public int DurationMinutes { get; set; } = 30; // Seans süresi

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
