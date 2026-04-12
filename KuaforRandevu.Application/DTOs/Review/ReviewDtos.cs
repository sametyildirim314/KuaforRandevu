namespace KuaforRandevu.Application.DTOs.Review;

// İstemciden gelen değerlendirme isteği
public class CreateReviewDto
{
    public int AppointmentId { get; set; } // Hangi randevu için
    public int BarberId { get; set; }      // Hangi kuaför için
    public int Rating { get; set; }        // 1-5
    public string? Comment { get; set; }   // İsteğe bağlı yorum
}

// API'den dönen değerlendirme verisi
public class ReviewListDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public string AuthorName { get; set; } = string.Empty; // Müşteri adı
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
