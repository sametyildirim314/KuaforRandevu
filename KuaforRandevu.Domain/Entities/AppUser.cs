using Microsoft.AspNetCore.Identity;

namespace KuaforRandevu.Domain.Entities;

public class AppUser : IdentityUser // IdentityUser'dan miras alıyoruz. 
// Çünkü kullanıcı bilgilerini tutacağız.
//IdentitiyUser: Email, Password, Phone Number, Security Stamp gibi bilgileri tutar.
//Bizim eklemek istediklerimizi de buraya ekleyeceğiz.
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // Customer | Barber | SalonOwner | Admin
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsActive { get; set; } = true;

    // Expo Push Notification Token — cihazdan gelen token burada saklanır
    public string? ExpoPushToken { get; set; }
}
