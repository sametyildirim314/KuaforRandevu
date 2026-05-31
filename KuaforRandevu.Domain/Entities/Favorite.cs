using System;

namespace KuaforRandevu.Domain.Entities;

/// <summary>
/// Müşterinin favorilediği bir salonu temsil eden varlık.
/// </summary>
public class Favorite
{
    public int Id { get; set; }

    // Favorileyen müşteri
    public string CustomerId { get; set; } = string.Empty;
    public AppUser Customer { get; set; } = null!;

    // Favorilenen salon
    public int SalonId { get; set; }
    public Salon Salon { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
