namespace KuaforRandevu.Domain.Entities;

public class Salon
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Salon sahibi — bir kullanıcı birden fazla salona sahip olabilir (1:N)
    public string OwnerId { get; set; } = string.Empty;
    public AppUser Owner { get; set; } = null!;
}
