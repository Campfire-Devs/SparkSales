namespace SparkSalesApi.Models;

public class Sale
{
    public Guid SaleId { get; set; }

    public Guid BusinessId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Product { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Seller { get; set; } = "Unknown";

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public string PaymentMethod { get; set; } = "Cash";

    public DateTime SaleDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Business Business { get; set; } = null!;

    public User CreatedByUser { get; set; } = null!;
}