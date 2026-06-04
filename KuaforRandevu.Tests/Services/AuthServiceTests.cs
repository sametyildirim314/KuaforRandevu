using KuaforRandevu.Application.DTOs.Auth;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Infrastructure.Persistence;
using KuaforRandevu.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace KuaforRandevu.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<UserManager<AppUser>> _userManagerMock;
    private readonly TokenService _tokenService;
    private readonly AppDbContext _db;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        // Mock UserManager
        var store = new Mock<IUserStore<AppUser>>();
        _userManagerMock = new Mock<UserManager<AppUser>>(store.Object, null, null, null, null, null, null, null, null);

        // Setup In-Memory DB
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Benzersiz isim izolasyon sağlar
            .Options;
        _db = new AppDbContext(options);

        // Mock IConfiguration for TokenService
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["Jwt:Key"]).Returns("ThisIsAVerySecretKeyForTestingPurposes123!");
        configMock.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
        configMock.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");
        configMock.Setup(c => c["Jwt:AccessTokenMinutes"]).Returns("60");

        _tokenService = new TokenService(configMock.Object);

        _authService = new AuthService(_userManagerMock.Object, _tokenService, _db);
    }

    [Fact]
    public async Task RegisterAsync_Should_Return_Token_When_Successful()
    {
        // Arrange
        var dto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Password = "Password123!",
            Role = "Customer"
        };

        _userManagerMock.Setup(u => u.FindByEmailAsync(dto.Email))
            .ReturnsAsync((AppUser?)null); // Kayıtlı kullanıcı yok

        _userManagerMock.Setup(u => u.CreateAsync(It.IsAny<AppUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.Equal("Test User", result.User.FullName);
        Assert.Equal(dto.Email, result.User.Email);
    }

    [Fact]
    public async Task RegisterAsync_Should_Throw_Exception_When_Email_Exists()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com"
        };

        _userManagerMock.Setup(u => u.FindByEmailAsync(dto.Email))
            .ReturnsAsync(new AppUser { Email = dto.Email });

        // Act & Assert
        var ex = await Assert.ThrowsAsync<Exception>(() => _authService.RegisterAsync(dto));
        Assert.Equal("Bu e-posta adresi zaten kayıtlı.", ex.Message);
    }

    [Fact]
    public async Task LoginAsync_Should_Return_Token_When_Credentials_Are_Valid()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var user = new AppUser
        {
            Id = "user1",
            Email = dto.Email,
            FirstName = "Login",
            LastName = "Test",
            Role = "Customer",
            IsActive = true
        };

        _userManagerMock.Setup(u => u.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(u => u.CheckPasswordAsync(user, dto.Password))
            .ReturnsAsync(true);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.Equal("user1", result.User.Id);
    }

    [Fact]
    public async Task LoginAsync_Should_Throw_Exception_When_Password_Is_Invalid()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "WrongPassword!"
        };

        var user = new AppUser { Email = dto.Email, IsActive = true };

        _userManagerMock.Setup(u => u.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(u => u.CheckPasswordAsync(user, dto.Password))
            .ReturnsAsync(false);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<Exception>(() => _authService.LoginAsync(dto));
        Assert.Equal("E-posta veya şifre hatalı.", ex.Message);
    }
}
