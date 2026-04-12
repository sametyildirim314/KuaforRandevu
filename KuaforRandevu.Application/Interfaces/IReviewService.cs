using KuaforRandevu.Application.DTOs.Review;

namespace KuaforRandevu.Application.Interfaces;

public interface IReviewService
{
    /// <summary>Yeni değerlendirme oluştur. Randevu tamamlanmış ve daha önce değerlendirilmemiş olmalı.</summary>
    Task<ReviewListDto> CreateAsync(string authorId, CreateReviewDto dto, CancellationToken ct = default);

    /// <summary>Bir kuaföre ait tüm değerlendirmeleri döner.</summary>
    Task<IReadOnlyList<ReviewListDto>> GetBarberReviewsAsync(int barberId, CancellationToken ct = default);

    /// <summary>Değerlendirmeyi sil. Yalnızca sahibi silebilir.</summary>
    Task DeleteAsync(int id, string userId, CancellationToken ct = default);

    /// <summary>Belirli bir randevu için mevcut kullanıcının değerlendirmesini döner. Yoksa null.</summary>
    Task<ReviewListDto?> GetByAppointmentIdAsync(int appointmentId, string userId, CancellationToken ct = default);
}
