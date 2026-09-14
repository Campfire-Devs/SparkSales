using System.Security.Cryptography;
using System.Collections.Concurrent;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Data;

var builder = WebApplication.CreateBuilder(args);
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<SparkSalesDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddSingleton<WelcomeEmailService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(
            builder.Configuration["Frontend:BaseUrl"] ?? "http://localhost:5173",
            "http://127.0.0.1:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors();

var accounts = new ConcurrentDictionary<string, DemoAccount>(StringComparer.OrdinalIgnoreCase);
var deletionRequests = new ConcurrentDictionary<string, DeletionRequestRecord>(StringComparer.OrdinalIgnoreCase);
// Maps an issued token back to the account email it belongs to, so
// endpoints that need to know "who is this request from" (like changing
// a password) have something to look up. Cleared on restart along with
// everything else in this in-memory demo backend.
var sessionTokens = new ConcurrentDictionary<string, string>();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/auth/register", async (RegisterRequest request, WelcomeEmailService emailService) =>
{
    if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
        return Results.BadRequest("Full name and email are required.");

    if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        return Results.BadRequest("Password must be at least 6 characters.");

    var email = request.Email.Trim().ToLowerInvariant();
    if (!IsValidEmail(email))
        return Results.BadRequest("Please enter a valid email address.");

    var account = new DemoAccount(
        Guid.NewGuid().ToString("N"),
        request.FullName.Trim(),
        email,
        request.Password);

    if (!accounts.TryAdd(email, account))
        return Results.Conflict("An account with that email already exists.");

    await emailService.SendAsync(account.Email, account.FullName);
    var registerToken = CreateToken();
    sessionTokens[registerToken] = email;
    return Results.Ok(new AuthResponse(registerToken, account.ToPublic()));
});

app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    if (!accounts.TryGetValue(email, out var account) || account.Password != request.Password)
        return Results.Unauthorized();

    var loginToken = CreateToken();
    sessionTokens[loginToken] = email;
    return Results.Ok(new AuthResponse(loginToken, account.ToPublic()));
});

app.MapGet("/api/auth/{provider}", (string provider, IConfiguration configuration) =>
{
    if (!OAuthProvider.IsSupported(provider))
        return Results.NotFound();

    var clientId = configuration[$"OAuth:{provider}:ClientId"];
    if (string.IsNullOrWhiteSpace(clientId))
    {
        return Results.Problem(
            title: $"{provider} OAuth is not configured",
            detail: $"Set OAuth:{provider}:ClientId in backend configuration before using this sign-in method.",
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    var backendBaseUrl = configuration["Backend:BaseUrl"] ?? "https://localhost:5001";
    var callbackUrl = $"{backendBaseUrl.TrimEnd('/')}/api/auth/callback";
    var state = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    var endpoint = configuration[$"OAuth:{provider}:AuthorizationEndpoint"]!;
    var query = new Dictionary<string, string?>
    {
        ["client_id"] = clientId,
        ["redirect_uri"] = callbackUrl,
        ["response_type"] = "code",
        ["scope"] = provider.Equals("Google", StringComparison.OrdinalIgnoreCase)
            ? "openid email profile"
            : "name email",
        ["state"] = state,
    };

    return Results.Redirect(QueryHelpers.AddQueryString(endpoint, query));
});

app.MapGet("/api/auth/callback", (string? error, string? code, string? state) =>
{
    if (!string.IsNullOrWhiteSpace(error))
        return Results.BadRequest(new { error });

    if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
        return Results.BadRequest(new { error = "OAuth callback is missing code or state." });

    return Results.StatusCode(StatusCodes.Status501NotImplemented);
});

// ---- Deletion requests (in-memory, keyed by email) ----

app.MapGet("/api/deletion-request", (string email) =>
{
    if (string.IsNullOrWhiteSpace(email)) return Results.BadRequest("Email query parameter is required.");
    deletionRequests.TryGetValue(email.Trim().ToLowerInvariant(), out var pending);
    return Results.Ok(pending);
});

app.MapPost("/api/deletion-request", async (DeletionRequestBody request, WelcomeEmailService emailService) =>
{
    var email = request.Email?.Trim().ToLowerInvariant() ?? "";
    if (!IsValidEmail(email))
        return Results.BadRequest("A valid email is required.");
    if (string.IsNullOrWhiteSpace(request.BusinessName))
        return Results.BadRequest("Business name is required.");

    var record = new DeletionRequestRecord(
        Guid.NewGuid().ToString("N"), email, request.BusinessName, request.Reason,
        DateTime.UtcNow, "pending");
    deletionRequests[email] = record;

    await emailService.SendDeletionRequestAsync(email, request.BusinessName, request.Reason);
    return Results.Ok(record);
});

app.MapPost("/api/deletion-request/{id}/cancel", (string id) =>
{
    var match = deletionRequests.Values.FirstOrDefault(r => r.Id == id);
    if (match is null) return Results.NotFound();
    deletionRequests.TryRemove(match.Email, out _);
    return Results.NoContent();
});

// ---- Change password (requires a valid session token) ----

app.MapPut("/api/auth/change-password", (ChangePasswordRequest request, HttpContext http) =>
{
    if (!TryGetEmailFromAuthHeader(http, sessionTokens, out var email))
        return Results.Unauthorized();

    if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        return Results.BadRequest("New password must be at least 6 characters.");

    if (!accounts.TryGetValue(email, out var account) || account.Password != request.CurrentPassword)
        return Results.BadRequest("Current password is incorrect.");

    accounts[email] = account with { Password = request.NewPassword };
    return Results.NoContent();
});

// ---- Daily summary / loss alert emails ----
// Triggered by the frontend (see useDailyNotifications), since sales/expense
// data currently lives only in the browser — there's no server-side data or
// scheduler to send these on a real timer independent of the app being open.

app.MapPost("/api/notifications/daily-summary", async (DailySummaryRequest request, HttpContext http, WelcomeEmailService emailService) =>
{
    if (!TryGetEmailFromAuthHeader(http, sessionTokens, out var email))
        return Results.Unauthorized();
    if (!accounts.TryGetValue(email, out var account))
        return Results.Unauthorized();

    var recipient = string.IsNullOrWhiteSpace(request.Recipient) ? account.Email : request.Recipient!;
    await emailService.SendDailySummaryAsync(recipient, account.FullName, request.BusinessName, request.Revenue, request.Expenses, request.GrossProfit, request.NetProfit);
    return Results.NoContent();
});

app.MapPost("/api/notifications/loss-alert", async (LossAlertRequest request, HttpContext http, WelcomeEmailService emailService) =>
{
    if (!TryGetEmailFromAuthHeader(http, sessionTokens, out var email))
        return Results.Unauthorized();
    if (!accounts.TryGetValue(email, out var account))
        return Results.Unauthorized();

    var recipient = string.IsNullOrWhiteSpace(request.Recipient) ? account.Email : request.Recipient!;
    await emailService.SendLossAlertAsync(recipient, account.FullName, request.BusinessName, request.NetProfit);
    return Results.NoContent();
});

static bool TryGetEmailFromAuthHeader(HttpContext http, ConcurrentDictionary<string, string> sessionTokens, out string email)
{
    email = "";
    var header = http.Request.Headers.Authorization.ToString();
    if (string.IsNullOrWhiteSpace(header) || !header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        return false;

    var token = header["Bearer ".Length..].Trim();
    return sessionTokens.TryGetValue(token, out email!);
}

// ---- Forgot / reset password ----
// Uses a self-signed token (HMAC over email + expiry) instead of a stored
// reset-token table, so it works without a database. The signing key is
// generated fresh each time the API starts, which means outstanding reset
// links become invalid on restart — exactly in step with the in-memory
// accounts they reset, so nothing gets out of sync.
var passwordResetKey = RandomNumberGenerator.GetBytes(32);

app.MapPost("/api/auth/forgot-password", async (ForgotPasswordRequest request, IConfiguration configuration, WelcomeEmailService emailService) =>
{
    var email = request.Email?.Trim().ToLowerInvariant() ?? "";
    if (IsValidEmail(email) && accounts.TryGetValue(email, out var account))
    {
        var token = CreateResetToken(account.Email, passwordResetKey);
        var frontendBaseUrl = (configuration["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
        var resetLink = $"{frontendBaseUrl}/reset-password?token={Uri.EscapeDataString(token)}";
        await emailService.SendPasswordResetAsync(account.Email, account.FullName, resetLink);
    }

    // Same response whether or not the email is registered — avoids
    // revealing which addresses have accounts.
    return Results.Ok(new { message = "If that email is registered, a reset link is on its way." });
});

app.MapPost("/api/auth/reset-password", (ResetPasswordRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        return Results.BadRequest("Password must be at least 6 characters.");

    if (!TryReadResetToken(request.Token ?? "", passwordResetKey, out var email) ||
        !accounts.TryGetValue(email, out var account))
    {
        return Results.BadRequest("This reset link is invalid or has expired. Please request a new one.");
    }

    accounts[email] = account with { Password = request.NewPassword };
    return Results.NoContent();
});

static string CreateResetToken(string email, byte[] key)
{
    var expiresAt = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds();
    var payload = Encoding.UTF8.GetBytes($"{email}|{expiresAt}");
    using var hmac = new HMACSHA256(key);
    var signature = hmac.ComputeHash(payload);
    return $"{Base64UrlEncode(payload)}.{Base64UrlEncode(signature)}";
}

static bool TryReadResetToken(string token, byte[] key, out string email)
{
    email = "";
    var parts = token.Split('.');
    if (parts.Length != 2) return false;

    byte[] payload, signature;
    try
    {
        payload = Base64UrlDecode(parts[0]);
        signature = Base64UrlDecode(parts[1]);
    }
    catch (FormatException) { return false; }

    using var hmac = new HMACSHA256(key);
    var expectedSignature = hmac.ComputeHash(payload);
    if (!CryptographicOperations.FixedTimeEquals(signature, expectedSignature)) return false;

    var segments = Encoding.UTF8.GetString(payload).Split('|');
    if (segments.Length != 2) return false;
    if (!long.TryParse(segments[1], out var expiresAt)) return false;
    if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expiresAt) return false;

    email = segments[0];
    return true;
}

static string Base64UrlEncode(byte[] bytes) =>
    Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');

static byte[] Base64UrlDecode(string value)
{
    var padded = value.Replace('-', '+').Replace('_', '/');
    padded += new string('=', (4 - padded.Length % 4) % 4);
    return Convert.FromBase64String(padded);
}

static string CreateToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

static bool IsValidEmail(string email) =>
    Regex.IsMatch(email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.CultureInvariant);

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
sealed record DemoAccount(string AccountId, string FullName, string Email, string Password);
sealed record PublicAccount(string AccountId, string FullName, string Email);
sealed record AuthResponse(string Token, PublicAccount Account);
sealed record DeletionRequestBody(string Email, string BusinessName, string? Reason);
sealed record DeletionRequestRecord(string Id, string Email, string BusinessName, string? Reason, DateTime RequestedAt, string Status);

static class DemoAccountExtensions
{
    public static PublicAccount ToPublic(this DemoAccount account) =>
        new(account.AccountId, account.FullName, account.Email);
}
