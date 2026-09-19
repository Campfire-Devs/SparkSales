using System.Net.Mail;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Auth;
using SparkSalesApi.Models;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly SparkSalesDbContext _db;
    private readonly JwtService _jwt;
    private readonly WelcomeEmailService _email;

    public AuthController(
        SparkSalesDbContext db,
        JwtService jwt,
        WelcomeEmailService email)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
    }

    // ---------------------------------------------------------
    // REGISTER
    // POST /api/auth/register
    // ---------------------------------------------------------
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request)
    {
        var fullName = request.FullName?.Trim() ?? "";
        var email = request.Email?.Trim().ToLowerInvariant() ?? "";
        var password = request.Password ?? "";

        if (string.IsNullOrWhiteSpace(fullName))
        {
            return BadRequest("Full name is required.");
        }

        if (fullName.Length > 150)
        {
            return BadRequest("Full name must be 150 characters or fewer.");
        }

        if (!IsValidEmail(email))
        {
            return BadRequest("Please enter a valid email address.");
        }

        if (!IsStrongEnoughPassword(password))
        {
            return BadRequest(
                "Password must be at least 8 characters and contain at least one letter and one number."
            );
        }

        var existingUser = await _db.Users
            .AsNoTracking()
            .AnyAsync(user => user.Email == email);

        if (existingUser)
        {
            return Conflict("An account with that email already exists.");
        }

        var user = new User
        {
            UserId = Guid.NewGuid(),
            FullName = fullName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            AuthProvider = "email",
            EmailVerified = false,
            TermsAgreedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var settings = new UserSetting
        {
            UserSettingId = Guid.NewGuid(),
            UserId = user.UserId,
            DailySummaryEmail = false,
            NotificationEmail = email,
            LossAlerts = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await using var transaction = await _db.Database.BeginTransactionAsync();

        _db.Users.Add(user);
        _db.UserSettings.Add(settings);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        var token = _jwt.GenerateToken(user);

        // Email failure must not prevent account creation.
        _ = _email.SendAsync(user.Email, user.FullName);

        return Ok(new AuthResponse(
            token,
            ToResponse(user)
        ));
    }

    // ---------------------------------------------------------
    // LOGIN
    // POST /api/auth/login
    // ---------------------------------------------------------
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request)
    {
        var email = request.Email?.Trim().ToLowerInvariant() ?? "";
        var password = request.Password ?? "";

        if (!IsValidEmail(email))
        {
            return Unauthorized("Incorrect email or password.");
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(account => account.Email == email);

        if (user is null)
        {
            return Unauthorized("Incorrect email or password.");
        }

        var validPassword = BCrypt.Net.BCrypt.Verify(
    password,
    user.PasswordHash
);

        if (!validPassword)
        {
            return Unauthorized("Incorrect email or password.");
        }

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user);

        return Ok(new AuthResponse(
            token,
            ToResponse(user)
        ));
    }

    // ---------------------------------------------------------
    // CURRENT USER
    // GET /api/auth/me
    // ---------------------------------------------------------
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthUserResponse>> Me()
    {
        var userId = User.GetUserId();

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(account => account.UserId == userId);

        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(ToResponse(user));
    }

    // ---------------------------------------------------------
    // CHANGE PASSWORD
    // PUT /api/auth/change-password
    // ---------------------------------------------------------
    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordRequest request)
    {
        if (!IsStrongEnoughPassword(request.NewPassword))
        {
            return BadRequest(
                "New password must be at least 8 characters and contain at least one letter and one number."
            );
        }

        var userId = User.GetUserId();

        var user = await _db.Users
            .FirstOrDefaultAsync(account => account.UserId == userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var currentPasswordCorrect = BCrypt.Net.BCrypt.Verify(
            request.CurrentPassword,
            user.PasswordHash
        );

        if (!currentPasswordCorrect)
        {
            return BadRequest("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(
    request.NewPassword
);

        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static AuthUserResponse ToResponse(User user)
    {
        return new AuthUserResponse(
            user.UserId,
            user.FullName,
            user.Email,
            user.EmailVerified
        );
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        try
        {
            var address = new MailAddress(email);
            return address.Address.Equals(
                email,
                StringComparison.OrdinalIgnoreCase
            );
        }
        catch
        {
            return false;
        }
    }

    private static bool IsStrongEnoughPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        {
            return false;
        }

        return password.Any(char.IsLetter)
               && password.Any(char.IsDigit);
    }
}