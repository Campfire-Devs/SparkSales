namespace SparkSalesApi.DTOs.Business;

public record UpdateBusinessRequest(
    string Name,
    string Category,
    string? Contact,
    string? Location,
    string? StallNumber,
    decimal StartingCapital
);