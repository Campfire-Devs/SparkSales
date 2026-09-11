using System.Security.Cryptography;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.WebUtilities;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);
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

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/auth/register", async (RegisterRequest request, WelcomeEmailService emailService) =>
{
    if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
        return Results.BadRequest("Full name and email are required.");

    if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        return Results.BadRequest("Password must be at least 6 characters.");

    var email = request.Email.Trim().ToLowerInvariant();
    if (!IsValidEmail(email))
    {
        return Results.BadRequest("Please enter a valid email address.");
    }

    var account = new DemoAccount(
        Guid.NewGuid().ToString("N"),
        request.FullName.Trim(),
        email,
        request.Password);

    if (!accounts.TryAdd(email, account))
        return Results.Conflict("An account with that email already exists.");

    await emailService.SendAsync(account.Email, account.FullName);
    return Results.Ok(new AuthResponse(CreateToken(), account.ToPublic()));
});

app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    if (!accounts.TryGetValue(email, out var account) || account.Password != request.Password)
        return Results.Unauthorized();

    return Results.Ok(new AuthResponse(CreateToken(), account.ToPublic()));
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

sealed record DemoAccount(string AccountId, string FullName, string Email, string Password);

sealed record PublicAccount(string AccountId, string FullName, string Email);

sealed record AuthResponse(string Token, PublicAccount Account);

static class DemoAccountExtensions
{
    public static PublicAccount ToPublic(this DemoAccount account) =>
        new(account.AccountId, account.FullName, account.Email);
}
