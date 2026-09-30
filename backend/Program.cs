using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------
// Database
// ---------------------------------------------------------

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found."
    );

builder.Services.AddDbContext<SparkSalesDbContext>(options =>
    options.UseNpgsql(connectionString));

 feature/settings
    var account = new DemoAccount(
        Guid.NewGuid().ToString("N"),
        request.FullName.Trim(),
        email,
        PasswordHasher.Hash(request.Password),
        DateTime.UtcNow);

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------


builder.Services.AddControllers();

// ---------------------------------------------------------
// JWT Authentication
// ---------------------------------------------------------

 feature/settings
app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    if (!accounts.TryGetValue(email, out var account) || !PasswordHasher.Verify(request.Password, account.PasswordHash))
        return Results.Unauthorized();

var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Jwt:Key is not configured."
    );
 develop

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]
    ?? "SparkSalesApi";

var jwtAudience =
    builder.Configuration["Jwt:Audience"]
    ?? "SparkSalesClient";

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;

        options.SaveToken = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

 feature/settings
    if (!accounts.TryGetValue(email, out var account) || !PasswordHasher.Verify(request.CurrentPassword, account.PasswordHash))
        return Results.BadRequest("Current password is incorrect.");

    var updated = account with
    {
        PasswordHash = PasswordHasher.Hash(request.NewPassword),
        PasswordChangedAt = DateTime.UtcNow,
    };
    accounts[email] = updated;
    return Results.Ok(updated.ToPublic());
});

            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,
 

            ValidateLifetime = true,

            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// ---------------------------------------------------------
// Application services
// ---------------------------------------------------------

builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<WelcomeEmailService>();

// ---------------------------------------------------------
// CORS
// ---------------------------------------------------------

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var frontendBaseUrl =
            builder.Configuration["Frontend:BaseUrl"]
            ?? "http://localhost:5173";

        policy
            .WithOrigins(
                frontendBaseUrl,
                "http://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

 feature/settings
    accounts[email] = account with
    {
        PasswordHash = PasswordHasher.Hash(request.NewPassword),
        PasswordChangedAt = DateTime.UtcNow,
    };
    return Results.NoContent();
});

// ---------------------------------------------------------
// Middleware
// ---------------------------------------------------------


if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

// ---------------------------------------------------------
// Endpoints
// ---------------------------------------------------------

app.MapGet("/health", () =>
    Results.Ok(new
    {
        status = "ok",
        service = "SparkSalesApi"
    })
);

 feature/settings
// PBKDF2 password hashing using only what's already in .NET's base class
// library — no new NuGet package needed. Stored as
// "{iterations}.{saltBase64}.{hashBase64}" so the iteration count travels
// with the hash itself; it can go up later without breaking older hashes.
static class PasswordHasher
{
    private const int SaltSizeBytes = 16;
    private const int HashSizeBytes = 32;
    private const int Iterations = 100_000;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSizeBytes);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, HashSizeBytes);
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string stored)
    {
        var parts = stored.Split('.');
        if (parts.Length != 3) return false;
        if (!int.TryParse(parts[0], out var iterations)) return false;

        byte[] salt, expectedHash;
        try
        {
            salt = Convert.FromBase64String(parts[1]);
            expectedHash = Convert.FromBase64String(parts[2]);
        }
        catch (FormatException) { return false; }

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expectedHash.Length);
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}

app.Run();

static class OAuthProvider
{
    public static bool IsSupported(string provider) =>
        provider.Equals("google", StringComparison.OrdinalIgnoreCase) ||
        provider.Equals("apple", StringComparison.OrdinalIgnoreCase);
}

sealed record RegisterRequest(string FullName, string Email, string Password);
sealed record LoginRequest(string Email, string Password);
sealed record ForgotPasswordRequest(string? Email);
sealed record ResetPasswordRequest(string? Token, string NewPassword);
sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
sealed record DailySummaryRequest(string BusinessName, string? Recipient, decimal Revenue, decimal Expenses, decimal GrossProfit, decimal NetProfit);
sealed record LossAlertRequest(string BusinessName, string? Recipient, decimal NetProfit);
sealed record DemoAccount(string AccountId, string FullName, string Email, string PasswordHash, DateTime PasswordChangedAt);
sealed record PublicAccount(string AccountId, string FullName, string Email, DateTime PasswordChangedAt);
sealed record AuthResponse(string Token, PublicAccount Account);
sealed record DeletionRequestBody(string Email, string BusinessName, string? Reason);
sealed record DeletionRequestRecord(string Id, string Email, string BusinessName, string? Reason, DateTime RequestedAt, string Status);

static class DemoAccountExtensions
{
    public static PublicAccount ToPublic(this DemoAccount account) =>
        new(account.AccountId, account.FullName, account.Email, account.PasswordChangedAt);
}

app.MapControllers();

app.Run();

