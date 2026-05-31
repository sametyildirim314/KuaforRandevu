using System;

namespace KuaforRandevu.Application.DTOs.Gallery;

public class GalleryImageDto
{
    public int Id { get; set; }
    public int BarberId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
