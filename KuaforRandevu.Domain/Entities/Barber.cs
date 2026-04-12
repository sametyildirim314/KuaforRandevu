namespace KuaforRandevu.Domain.Entities;

public class Barber
{
    public int Id { get; set; }

    // Kuaförün kullanıcı hesabı (AppUser ile 1:1 ilişki)
    public string UserId { get; set; } = string.Empty;
    public AppUser User { get; set; } = null!; 

    // Hangi salonla ilişkili
    public int SalonId { get; set; }
    public Salon Salon { get; set; } = null!;

    public string DisplayName { get; set; } = string.Empty;
    public int WorkStartHour { get; set; } = 9;   // 09:00
    public int WorkEndHour { get; set; } = 18;     // 18:00
    public int SlotDurationMinutes { get; set; } = 30; // Her seans 30 dk

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Değerlendirme istatistikleri — her review sonrası otomatik güncellenir
    public double AverageRating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
