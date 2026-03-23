using KuaforRandevu.Application.DTOs.Auth;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace KuaforRandevu.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly TokenService _tokenService;

    public AuthService(UserManager<AppUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Aynı e-posta ile kayıtlı kullanıcı var mı?
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new Exception("Bu e-posta adresi zaten kayıtlı.");

        var user = new AppUser
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            UserName = dto.Email,
            Role = dto.Role
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Kayıt başarısız: {errors}");
        }

        return await BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new Exception("E-posta veya şifre hatalı.");

        if (!user.IsActive)
            throw new Exception("Hesabınız askıya alınmış.");

        var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
            throw new Exception("E-posta veya şifre hatalı.");

        return await BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        // Refresh token'ı e-posta claim'inden bul
        // Gerçek uygulamada RefreshToken tablosunda saklanır
        var user = _userManager.Users
            .FirstOrDefault(u => u.SecurityStamp == refreshToken)
            ?? throw new Exception("Geçersiz refresh token.");

        return await BuildAuthResponse(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return; // Güvenlik için hata fırlatma

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Gerçek uygulamada bu token e-posta ile gönderilir (SMTP servisi)
        // Şimdilik konsola yazıyoruz
        Console.WriteLine($"[DEV] Şifre sıfırlama tokeni: {token}");
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new Exception("Kullanıcı bulunamadı.");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Şifre sıfırlama başarısız: {errors}");
        }
    }

    // Ortak token üretme yardımcı metodu
    private Task<AuthResponseDto> BuildAuthResponse(AppUser user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        return Task.FromResult(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserInfoDto
            {
                Id = user.Id,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email!,
                Role = user.Role
            }
        });
    }
}