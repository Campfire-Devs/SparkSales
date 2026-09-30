namespace SparkSalesApi.Models;

public class EmailVerificationToken
{
    public Guid EmailVerificationTokenId { get; set; }

    public Guid UserId { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime? VerifiedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}