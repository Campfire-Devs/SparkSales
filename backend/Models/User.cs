namespace SparkSalesApi.Models;

public class User
{
    public Guid UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string AuthProvider { get; set; } = "email";

    public bool EmailVerified { get; set; }

    public DateTime? TermsAgreedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public ICollection<Business> OwnedBusinesses { get; set; } = new List<Business>();

    public ICollection<BusinessMember> BusinessMemberships { get; set; } =
        new List<BusinessMember>();

    public ICollection<UserSetting> Settings { get; set; } =
        new List<UserSetting>();

    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } =
        new List<PasswordResetToken>();

    public ICollection<EmailVerificationToken> EmailVerificationTokens { get; set; } =
        new List<EmailVerificationToken>();

    public ICollection<Sale> SalesCreated { get; set; } =
        new List<Sale>();

    public ICollection<Expense> ExpensesCreated { get; set; } =
        new List<Expense>();

    public ICollection<DeletionRequest> DeletionRequests { get; set; } =
        new List<DeletionRequest>();
}