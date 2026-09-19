namespace SparkSalesApi.DTOs.Sales;

public record CreateSaleRequest(
    string Product,
    string Category,
    string? Seller,
    int Quantity,
    decimal UnitPrice,
    string PaymentMethod,
    DateTime SaleDate
);