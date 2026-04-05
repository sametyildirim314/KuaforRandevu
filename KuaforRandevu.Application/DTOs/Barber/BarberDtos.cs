namespace KuaforRandevu.Application.DTOs.Barber;

public class BarberListDto
{
    public int Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public int SlotDurationMinutes { get; set; }
    public int WorkStartHour { get; set; }
    public int WorkEndHour { get; set; }
}

public class AvailableSlotDto
{
    public string Time { get; set; } = string.Empty; // "09:00", "09:30" ...
    public bool IsAvailable { get; set; }
}
