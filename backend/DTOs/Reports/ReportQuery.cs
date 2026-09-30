namespace SparkSalesApi.DTOs.Reports;

public record ReportQuery(
    DateTime? From,
    DateTime? To
);