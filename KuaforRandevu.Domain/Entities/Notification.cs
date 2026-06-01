namespace KuaforRandevu.Domain.Entities;

public class Notification
{
    public int Id { get; set; }

    // Bildirimin alıcısı
    public string UserId { get; set; } = string.Empty;
    public AppUser User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;    // "Randevu Onaylandı"
    public string Message { get; set; } = string.Empty;  // Detay mesajı
    public string Type { get; set; } = string.Empty;     // NotificationType sabitleri

    // İlgili randevu (opsiyonel — bildirime tıklayınca yönlendirme için)
    public int? RelatedAppointmentId { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
