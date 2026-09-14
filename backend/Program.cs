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

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
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

app.MapControllers();

app.Run();