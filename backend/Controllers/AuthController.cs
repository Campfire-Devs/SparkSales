using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
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

        return Ok(new AuthResponse(
            token,
            ToResponse(user)
        ));
    }

    // ---------------------------------------------------------
    // FORGOT PASSWORD
    // POST /api/auth/forgot-password
    // ---------------------------------------------------------
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordRequest request)
    {
        var email = request.Email?.Trim().ToLowerInvariant() ?? "";

        if (!IsValidEmail(email))
        {
            return BadRequest("Please enter a valid email address.");
        }

        if (!_email.IsConfigured)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Password reset email is not configured. Please try again later.");
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(account =>
                account.Email == email && account.AuthProvider == "email");

        if (user is null)
        {
            return Ok();
        }

        var now = DateTime.UtcNow;
        var activeTokens = await _db.PasswordResetTokens
            .Where(token => token.UserId == user.UserId && token.UsedAt == null)
            .ToListAsync();

        foreach (var activeToken in activeTokens)
        {
            activeToken.UsedAt = now;
        }

        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var tokenHash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            PasswordResetTokenId = Guid.NewGuid(),
            UserId = user.UserId,
            TokenHash = tokenHash,
            ExpiresAt = now.AddMinutes(30),
            CreatedAt = now
        });

        await _db.SaveChangesAsync();

        await _email.SendPasswordResetAsync(user.Email, user.FullName, rawToken);

        return Ok();
    }

    // ---------------------------------------------------------
    // RESET PASSWORD
    // POST /api/auth/reset-password
    // ---------------------------------------------------------
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordRequest request)
    {
        if (!IsStrongEnoughPassword(request.NewPassword))
        {
            return BadRequest(
                "Password must be at least 8 characters and contain at least one letter and one number."
            );
        }

        var tokenHash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(request.Token ?? "")));
        var now = DateTime.UtcNow;

        var token = await _db.PasswordResetTokens
            .AsNoTracking()
            .Where(resetToken =>
                resetToken.TokenHash == tokenHash
                && resetToken.UsedAt == null
                && resetToken.ExpiresAt > now)
            .Select(resetToken => new
            {
                resetToken.PasswordResetTokenId,
                resetToken.UserId
            })
            .FirstOrDefaultAsync();

        if (token is null)
        {
            return BadRequest("This reset link is invalid or has expired. Please request a new one.");
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();
        var consumedAt = DateTime.UtcNow;

        var tokenConsumed = await _db.PasswordResetTokens
            .Where(resetToken =>
                resetToken.PasswordResetTokenId == token.PasswordResetTokenId
                && resetToken.UsedAt == null
                && resetToken.ExpiresAt > consumedAt)
            .ExecuteUpdateAsync(update => update
                .SetProperty(resetToken => resetToken.UsedAt, consumedAt));

        if (tokenConsumed == 0)
        {
            return BadRequest("This reset link is invalid or has expired. Please request a new one.");
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(account => account.UserId == token.UserId);

        if (user is null)
        {
            return BadRequest("This reset link is invalid or has expired. Please request a new one.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = consumedAt;

        await _db.PasswordResetTokens
            .Where(resetToken =>
                resetToken.UserId == user.UserId
                && resetToken.PasswordResetTokenId != token.PasswordResetTokenId
                && resetToken.UsedAt == null)
            .ExecuteUpdateAsync(update => update
                .SetProperty(resetToken => resetToken.UsedAt, consumedAt));

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return NoContent();
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

        
        // Determine whether this is the user's first successful login.
        var isFirstLogin = user.LastLoginAt is null;

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Send the welcome email only once, on first successful login.
        if (isFirstLogin)
        {
            await _email.SendAsync(user.Email, user.FullName);
        }

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