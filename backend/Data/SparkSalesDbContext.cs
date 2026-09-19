using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Models;

namespace SparkSalesApi.Data;

public class SparkSalesDbContext : DbContext
{
    public SparkSalesDbContext(DbContextOptions<SparkSalesDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Business> Businesses => Set<Business>();

    public DbSet<BusinessMember> BusinessMembers => Set<BusinessMember>();

    public DbSet<Sale> Sales => Set<Sale>();

    public DbSet<Expense> Expenses => Set<Expense>();

    public DbSet<UserSetting> UserSettings => Set<UserSetting>();

    public DbSet<PasswordResetToken> PasswordResetTokens =>
        Set<PasswordResetToken>();

    public DbSet<EmailVerificationToken> EmailVerificationTokens =>
        Set<EmailVerificationToken>();

    public DbSet<DeletionRequest> DeletionRequests =>
        Set<DeletionRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---------------------------------------------------------
        // USERS
        // ---------------------------------------------------------
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(x => x.UserId);

            entity.Property(x => x.UserId)
                .HasColumnName("user_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.FullName)
                .HasColumnName("full_name")
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Email)
                .HasColumnName("email")
                .HasMaxLength(320)
                .IsRequired();

            entity.HasIndex(x => x.Email)
                .IsUnique();

            entity.Property(x => x.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(x => x.AuthProvider)
                .HasColumnName("auth_provider")
                .HasMaxLength(30)
                .HasDefaultValue("email")
                .IsRequired();

            entity.Property(x => x.EmailVerified)
                .HasColumnName("email_verified")
                .HasDefaultValue(false);

            entity.Property(x => x.TermsAgreedAt)
                .HasColumnName("terms_agreed_at");

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(x => x.LastLoginAt)
                .HasColumnName("last_login_at");
        });

        // ---------------------------------------------------------
        // BUSINESSES
        // ---------------------------------------------------------
        modelBuilder.Entity<Business>(entity =>
        {
            entity.ToTable("businesses");

            entity.HasKey(x => x.BusinessId);

            entity.Property(x => x.BusinessId)
                .HasColumnName("business_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.Name)
                .HasColumnName("name")
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Category)
                .HasColumnName("category")
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(x => x.OwnerUserId)
                .HasColumnName("owner_user_id")
                .IsRequired();

            entity.Property(x => x.Contact)
                .HasColumnName("contact")
                .HasMaxLength(30);

            entity.Property(x => x.Location)
                .HasColumnName("location")
                .HasMaxLength(200);

            entity.Property(x => x.StallNumber)
                .HasColumnName("stall_number")
                .HasMaxLength(50);

            entity.Property(x => x.StartingCapital)
                .HasColumnName("starting_capital")
                .HasPrecision(18, 2);

            entity.Property(x => x.CommissionRate)
                .HasColumnName("commission_rate")
                .HasPrecision(5, 4)
                .HasDefaultValue(0.05m);

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(x => x.OwnerUserId);

            entity.HasOne(x => x.OwnerUser)
                .WithMany(x => x.OwnedBusinesses)
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ---------------------------------------------------------
        // BUSINESS MEMBERS
        // ---------------------------------------------------------
        modelBuilder.Entity<BusinessMember>(entity =>
        {
            entity.ToTable("business_members");

            entity.HasKey(x => x.BusinessMemberId);

            entity.Property(x => x.BusinessMemberId)
                .HasColumnName("business_member_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.BusinessId)
                .HasColumnName("business_id")
                .IsRequired();

            entity.Property(x => x.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(x => x.Role)
                .HasColumnName("role")
                .HasMaxLength(30)
                .HasDefaultValue("Member")
                .IsRequired();

            entity.Property(x => x.JoinedAt)
                .HasColumnName("joined_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(x => new { x.BusinessId, x.UserId })
                .IsUnique();

            entity.HasIndex(x => x.UserId);

            entity.HasOne(x => x.Business)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.User)
                .WithMany(x => x.BusinessMemberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ---------------------------------------------------------
        // SALES
        // ---------------------------------------------------------
        modelBuilder.Entity<Sale>(entity =>
        {
            entity.ToTable("sales");

            entity.HasKey(x => x.SaleId);

            entity.Property(x => x.SaleId)
                .HasColumnName("sale_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.BusinessId)
                .HasColumnName("business_id")
                .IsRequired();

            entity.Property(x => x.CreatedByUserId)
                .HasColumnName("created_by_user_id")
                .IsRequired();

            entity.Property(x => x.Product)
                .HasColumnName("product")
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Category)
                .HasColumnName("category")
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(x => x.Seller)
                .HasColumnName("seller")
                .HasMaxLength(150)
                .HasDefaultValue("Unknown")
                .IsRequired();

            entity.Property(x => x.Quantity)
                .HasColumnName("quantity")
                .IsRequired();

            entity.Property(x => x.UnitPrice)
                .HasColumnName("unit_price")
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(x => x.PaymentMethod)
                .HasColumnName("payment_method")
                .HasMaxLength(50)
                .HasDefaultValue("Cash")
                .IsRequired();

            entity.Property(x => x.SaleDate)
                .HasColumnName("sale_date")
                .IsRequired();

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(x => x.BusinessId);

            entity.HasIndex(x => x.SaleDate);

            entity.HasIndex(x => x.CreatedByUserId);

            entity.HasOne(x => x.Business)
                .WithMany(x => x.Sales)
                .HasForeignKey(x => x.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.CreatedByUser)
                .WithMany(x => x.SalesCreated)
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.ToTable("sales", table =>
            {
                table.HasCheckConstraint(
                    "ck_sales_quantity_positive",
                    "\"quantity\" > 0");

                table.HasCheckConstraint(
                    "ck_sales_unit_price_non_negative",
                    "\"unit_price\" >= 0");
            });
        });

        // ---------------------------------------------------------
        // EXPENSES
        // ---------------------------------------------------------
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.ToTable("expenses");

            entity.HasKey(x => x.ExpenseId);

            entity.Property(x => x.ExpenseId)
                .HasColumnName("expense_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.BusinessId)
                .HasColumnName("business_id")
                .IsRequired();

            entity.Property(x => x.CreatedByUserId)
                .HasColumnName("created_by_user_id")
                .IsRequired();

            entity.Property(x => x.Name)
                .HasColumnName("name")
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Seller)
                .HasColumnName("seller")
                .HasMaxLength(150)
                .HasDefaultValue("General/Stall")
                .IsRequired();

            entity.Property(x => x.Category)
                .HasColumnName("category")
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(x => x.Amount)
                .HasColumnName("amount")
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(x => x.ExpenseDate)
                .HasColumnName("expense_date")
                .IsRequired();

            entity.Property(x => x.Note)
                .HasColumnName("note")
                .HasMaxLength(500);

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(x => x.BusinessId);

            entity.HasIndex(x => x.ExpenseDate);

            entity.HasIndex(x => x.CreatedByUserId);

            entity.HasOne(x => x.Business)
                .WithMany(x => x.Expenses)
                .HasForeignKey(x => x.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.CreatedByUser)
                .WithMany(x => x.ExpensesCreated)
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.ToTable("expenses", table =>
            {
                table.HasCheckConstraint(
                    "ck_expenses_amount_non_negative",
                    "\"amount\" >= 0");
            });
        });

        // ---------------------------------------------------------
        // USER SETTINGS
        // ---------------------------------------------------------
        modelBuilder.Entity<UserSetting>(entity =>
        {
            entity.ToTable("user_settings");

            entity.HasKey(x => x.UserSettingId);

            entity.Property(x => x.UserSettingId)
                .HasColumnName("user_setting_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(x => x.DailySummaryEmail)
                .HasColumnName("daily_summary_email")
                .HasDefaultValue(false);

            entity.Property(x => x.NotificationEmail)
                .HasColumnName("notification_email")
                .HasMaxLength(320);

            entity.Property(x => x.LossAlerts)
                .HasColumnName("loss_alerts")
                .HasDefaultValue(false);

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasIndex(x => x.UserId)
                .IsUnique();

            entity.HasOne(x => x.User)
                .WithMany(x => x.Settings)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ---------------------------------------------------------
        // PASSWORD RESET TOKENS
        // ---------------------------------------------------------
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.ToTable("password_reset_tokens");

            entity.HasKey(x => x.PasswordResetTokenId);

            entity.Property(x => x.PasswordResetTokenId)
                .HasColumnName("password_reset_token_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(x => x.TokenHash)
                .HasColumnName("token_hash")
                .HasMaxLength(128)
                .IsRequired();

            entity.HasIndex(x => x.TokenHash)
                .IsUnique();

            entity.Property(x => x.ExpiresAt)
                .HasColumnName("expires_at")
                .IsRequired();

            entity.Property(x => x.UsedAt)
                .HasColumnName("used_at");

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(x => x.User)
                .WithMany(x => x.PasswordResetTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ---------------------------------------------------------
        // EMAIL VERIFICATION TOKENS
        // ---------------------------------------------------------
        modelBuilder.Entity<EmailVerificationToken>(entity =>
        {
            entity.ToTable("email_verification_tokens");

            entity.HasKey(x => x.EmailVerificationTokenId);

            entity.Property(x => x.EmailVerificationTokenId)
                .HasColumnName("email_verification_token_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(x => x.TokenHash)
                .HasColumnName("token_hash")
                .HasMaxLength(128)
                .IsRequired();

            entity.HasIndex(x => x.TokenHash)
                .IsUnique();

            entity.Property(x => x.ExpiresAt)
                .HasColumnName("expires_at")
                .IsRequired();

            entity.Property(x => x.VerifiedAt)
                .HasColumnName("verified_at");

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(x => x.User)
                .WithMany(x => x.EmailVerificationTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ---------------------------------------------------------
        // DELETION REQUESTS
        // ---------------------------------------------------------
        modelBuilder.Entity<DeletionRequest>(entity =>
        {
            entity.ToTable("deletion_requests");

            entity.HasKey(x => x.DeletionRequestId);

            entity.Property(x => x.DeletionRequestId)
                .HasColumnName("deletion_request_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.BusinessId)
                .HasColumnName("business_id")
                .IsRequired();

            entity.Property(x => x.RequestedByUserId)
                .HasColumnName("requested_by_user_id")
                .IsRequired();

            entity.Property(x => x.Reason)
                .HasColumnName("reason")
                .HasMaxLength(1000);

            entity.Property(x => x.RequestedAt)
                .HasColumnName("requested_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(x => x.Status)
                .HasColumnName("status")
                .HasMaxLength(30)
                .HasDefaultValue("pending")
                .IsRequired();

            entity.Property(x => x.ProcessedAt)
                .HasColumnName("processed_at");

            entity.HasIndex(x => new { x.BusinessId, x.Status });

            entity.HasOne(x => x.Business)
                .WithMany(x => x.DeletionRequests)
                .HasForeignKey(x => x.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.RequestedByUser)
                .WithMany(x => x.DeletionRequests)
                .HasForeignKey(x => x.RequestedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}