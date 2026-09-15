namespace SparkSalesApi.DTOs.Settings;

public record UpdateSettingsRequest(
    bool DailySummaryEmail,
    string? NotificationEmail,
    bool LossAlerts
);