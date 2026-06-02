namespace KuaforRandevu.Domain.Enums;

/// <summary>
/// Bildirim tipleri — string sabitleri olarak tanımlanır.
/// Enum yerine string kullanılmasının sebebi: DTO'larda ve frontend'de
/// doğrudan okunabilir olması.
/// </summary>
public static class NotificationType
{
    public const string AppointmentConfirmed = "appointment_confirmed";
    public const string AppointmentCancelled = "appointment_cancelled";
    public const string AppointmentCompleted = "appointment_completed";
    public const string AppointmentReminder  = "appointment_reminder";
    public const string NewAppointment       = "new_appointment";
    public const string SystemAlert          = "system_alert";
}
