namespace SparkSalesApi.Models;

public class DeletionRequest
{
    public DeletionRequest()
    {
    }

    public Guid DeletionRequestId { get; set; }

    public Guid BusinessId { get; set; }

    public Guid RequestedByUserId { get; set; }

    public string? Reason { get; set; }

    public DateTime RequestedAt { get; set; }

    public string Status { get; set; } = "pending";

    public DateTime? ProcessedAt { get; set; }

    public Business Business { get; set; } = null!;

    public User RequestedByUser { get; set; } = null!;
}