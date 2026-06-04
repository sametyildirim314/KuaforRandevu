using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Domain.Enums;
using KuaforRandevu.Infrastructure.Persistence;
using KuaforRandevu.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KuaforRandevu.Tests.Services;

public class BarberDashboardServiceTests
{
    private readonly AppDbContext _db;
    private readonly BarberDashboardService _service;

    public BarberDashboardServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _db = new AppDbContext(options);
        _service = new BarberDashboardService(_db);
    }

    [Fact]
    public async Task GetDashboardSummaryAsync_Should_Return_Correct_Counts()
    {
        // Arrange
        int barberId = 1;
        var today = DateTime.Now.Date;

        _db.Appointments.AddRange(
            new Appointment { Id = 1, BarberId = barberId, AppointedAt = today.AddHours(1), Status = AppointmentStatus.Completed, Price = 100 },
            new Appointment { Id = 2, BarberId = barberId, AppointedAt = today.AddHours(2), Status = AppointmentStatus.Pending, Price = 150 },
            new Appointment { Id = 3, BarberId = 2, AppointedAt = today.AddHours(1), Status = AppointmentStatus.Completed, Price = 200 } // Different barber
        );
        await _db.SaveChangesAsync();

        // Act
        var result = await _service.GetDashboardSummaryAsync(barberId);

        // Assert
        Assert.Equal(2, result.TotalAppointmentsToday); // Only barberId 1 today
        Assert.Equal(1, result.PendingAppointmentsCount); // 1 pending
        Assert.Equal(100, result.TodayEarnings); // 1 completed with price 100
    }

    [Fact]
    public async Task GetDailyScheduleAsync_Should_Return_Only_Today_Appointments()
    {
        // Arrange
        int barberId = 1;
        var today = DateTime.Now.Date;
        var yesterday = today.AddDays(-1);
        var tomorrow = today.AddDays(1);

        var barber = new Barber { Id = barberId, DisplayName = "Test Barber", UserId = "u1" };
        var salon = new Salon { Id = 1, Name = "Test Salon", OwnerId = "o1" };
        var customer = new AppUser { Id = "c1", FirstName = "Test", LastName = "Customer" };

        _db.Barbers.Add(barber);
        _db.Salons.Add(salon);
        _db.Users.Add(customer);

        _db.Appointments.AddRange(
            new Appointment { Id = 1, BarberId = barberId, SalonId = 1, CustomerId = "c1", AppointedAt = yesterday },
            new Appointment { Id = 2, BarberId = barberId, SalonId = 1, CustomerId = "c1", AppointedAt = today.AddHours(1) },
            new Appointment { Id = 3, BarberId = barberId, SalonId = 1, CustomerId = "c1", AppointedAt = tomorrow }
        );
        await _db.SaveChangesAsync();

        // Act
        var result = await _service.GetDailyScheduleAsync(barberId, today);

        // Assert
        Assert.Single(result);
        Assert.Equal(2, result.First().Id);
    }
}
