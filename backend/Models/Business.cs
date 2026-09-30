namespace SparkSalesApi.Models;

public class Business
{
    public Guid BusinessId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public Guid OwnerUserId { get; set; }

    public string? Contact { get; set; }

    public string? Location { get; set; }

    public string? StallNumber { get; set; }

    public decimal StartingCapital { get; set; }

    public decimal CommissionRate { get; set; } = 0.05m;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public User OwnerUser { get; set; } = null!;

    public ICollection<BusinessMember> Members { get; set; } =
        new List<BusinessMember>();

    public ICollection<Sale> Sales { get; set; } =
        new List<Sale>();

    public ICollection<Expense> Expenses { get; set; } =
        new List<Expense>();

    public ICollection<DeletionRequest> DeletionRequests { get; set; } =
        new List<DeletionRequest>();
}