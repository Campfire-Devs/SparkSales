namespace SparkSalesApi.Models;

public class Expense
{
    public Guid ExpenseId { get; set; }

    public Guid BusinessId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Seller { get; set; } = "General/Stall";

    public string Category { get; set; } = "Supplies";

    public decimal Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Business Business { get; set; } = null!;

    public User CreatedByUser { get; set; } = null!;
}