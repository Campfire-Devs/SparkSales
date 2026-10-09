using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Vercel supplies PORT for container deployments.
// Local development continues to use launchSettings.json.
var vercelPort = Environment.GetEnvironmentVariable("PORT");

if (int.TryParse(vercelPort, out var port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

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

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

builder.Services.AddControllers();

// ---------------------------------------------------------
// JWT Authentication
// ---------------------------------------------------------

var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Jwt:Key is not configured."
    );

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

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

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

        var allowedOrigins = new[]
        {
            frontendBaseUrl,
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        }
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ---------------------------------------------------------
// Vercel / container port
// ---------------------------------------------------------

var port = Environment.GetEnvironmentVariable("PORT");

if (!string.IsNullOrWhiteSpace(port) &&
    int.TryParse(port, out _))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// ---------------------------------------------------------
// Build
// ---------------------------------------------------------

var app = builder.Build();

// ---------------------------------------------------------
// Development-only middleware
// ---------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseHttpsRedirection();
}

// ---------------------------------------------------------
// Middleware
// ---------------------------------------------------------

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// ---------------------------------------------------------
// Health endpoint
// ---------------------------------------------------------

app.MapGet("/health", () =>
    Results.Ok(new
    {
        status = "ok",
        service = "SparkSalesApi"
    })
);

app.MapControllers();

app.Run();