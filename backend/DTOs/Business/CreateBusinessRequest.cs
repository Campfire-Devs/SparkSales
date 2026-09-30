namespace SparkSalesApi.DTOs.Business;

public record CreateBusinessRequest(
    string Name,
    string Category,
    string? Contact,
    string? Location,
    string? StallNumber,
    decimal StartingCapital
);