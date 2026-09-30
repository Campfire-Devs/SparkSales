namespace SparkSalesApi.Models;

public class BusinessMember
{
    public Guid BusinessMemberId { get; set; }

    public Guid BusinessId { get; set; }

    public Guid UserId { get; set; }

    public string Role { get; set; } = "Member";

    public DateTime JoinedAt { get; set; }

    public Business Business { get; set; } = null!;

    public User User { get; set; } = null!;
}