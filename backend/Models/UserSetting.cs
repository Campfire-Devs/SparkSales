namespace SparkSalesApi.Models;

public class UserSetting
{
    public Guid UserSettingId { get; set; }

    public Guid UserId { get; set; }

    public bool DailySummaryEmail { get; set; }

    public string? NotificationEmail { get; set; }

    public bool LossAlerts { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}