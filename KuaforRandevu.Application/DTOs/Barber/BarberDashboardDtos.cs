namespace KuaforRandevu.Application.DTOs.Barber;

public class BarberWorkingHoursDto
{
    public int WorkStartHour { get; set; }
    public int WorkEndHour { get; set; }
    public int SlotDurationMinutes { get; set; }
}

public class BarberEarningsDto
{
    public decimal DailyEarnings { get; set; }
    public decimal WeeklyEarnings { get; set; }
    public decimal MonthlyEarnings { get; set; }
    public decimal TotalEarnings { get; set; }
}

public class BarberDashboardSummaryDto
{
    public int TotalAppointmentsToday { get; set; }
    public int PendingAppointmentsCount { get; set; }
    public decimal TodayEarnings { get; set; }
}

public class UpdateAppointmentPriceDto
{
    public decimal Price { get; set; }
}
