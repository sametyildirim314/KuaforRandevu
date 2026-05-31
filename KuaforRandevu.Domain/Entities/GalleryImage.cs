using System;

namespace KuaforRandevu.Domain.Entities;

/// <summary>
/// Bir kuaförün portfolyo resmini temsil eden varlık.
/// </summary>
public class GalleryImage
{
    public int Id { get; set; }

    // Hangi kuaföre ait
    public int BarberId { get; set; }
    public Barber Barber { get; set; } = null!;

    // Resmin sunucu üzerindeki URL yolu
    public string ImageUrl { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
