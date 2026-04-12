namespace KuaforRandevu.Domain.Entities;

/// <summary>
/// Müşterinin tamamlanan bir randevu için bıraktığı yıldızlı değerlendirme.
/// Her randevu için yalnızca bir değerlendirme yapılabilir (AppointmentId UNIQUE).
/// </summary>
public class Review
{
    public int Id { get; set; }

    // Hangi randevu için yapıldı (veritabanında UNIQUE index ile korunuyor)
    public int AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;

    // Değerlendirmeyi yapan müşteri
    public string AuthorId { get; set; } = string.Empty;
    public AppUser Author { get; set; } = null!;

    // Değerlendirilen kuaför
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;

    public int Rating { get; set; }       // 1–5 arası puan
    public string? Comment { get; set; }  // İsteğe bağlı yorum (max 500 karakter)

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
