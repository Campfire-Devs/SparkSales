namespace SparkSalesApi.DTOs.Sales;

public record UpdateSaleRequest(
    string Product,
    string Category,
    string? Seller,
    int Quantity,
    decimal UnitPrice,
    string PaymentMethod,
    DateTime SaleDate
);