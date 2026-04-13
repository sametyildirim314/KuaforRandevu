namespace KuaforRandevu.Application.DTOs.Salon;

// ── Dashboard İstatistikleri ────────────────────────────────────────
public class SalonDashboardDto
{
    public int SalonId { get; set; }
    public string SalonName { get; set; } = string.Empty;
    public int TodayAppointments { get; set; }
    public int PendingCount { get; set; }
    public int CompletedThisWeek { get; set; }
    public double AverageRating { get; set; }
    public int TotalBarbers { get; set; }
}

// ── Salon Tarafı Randevu Listesi (müşteri adını içerir) ────────────
public class SalonAppointmentListDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string BarberName { get; set; } = string.Empty;
    public DateTime AppointedAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string StatusLabel { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

// ── Berber Ekleme DTO ──────────────────────────────────────────────
public class CreateBarberDto
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int WorkStartHour { get; set; } = 9;
    public int WorkEndHour { get; set; } = 18;
    public int SlotDurationMinutes { get; set; } = 30;
    public bool IsSelf { get; set; } = false; // Salon sahibi kendisini berber olarak ekliyorsa true
}

// ── Berber Güncelleme DTO ──────────────────────────────────────────
public class UpdateBarberDto
{
    public string DisplayName { get; set; } = string.Empty;
    public int WorkStartHour { get; set; }
    public int WorkEndHour { get; set; }
    public int SlotDurationMinutes { get; set; }
    public bool IsActive { get; set; }
}
