namespace KuaforRandevu.Application.DTOs.Salon;

public class SalonListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class SalonDetailDto : SalonListItemDto
{
    public string? Description { get; set; }
    public List<ServiceDto> Services { get; set; } = new();
}

public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
}
