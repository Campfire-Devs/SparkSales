namespace SparkSalesApi.DTOs.Expenses;

public class UpdateExpenseRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Seller { get; set; }

    public string Category { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    public string? Note { get; set; }
}