using System.Net.Mail;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Settings;
using SparkSalesApi.Models;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly SparkSalesDbContext _db;

    public SettingsController(SparkSalesDbContext db)
    {
        _db = db;
    }

    // ---------------------------------------------------------
    // GET /api/settings
    // ---------------------------------------------------------

    [HttpGet]
    public async Task<ActionResult<object>> GetSettings()
    {
        var userId = User.GetUserId();

        var settings = await _db.UserSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(settings => settings.UserId == userId);

        // A user should normally already have settings created during
        // registration, but return safe defaults if no row exists yet.
        if (settings is null)
        {
            return Ok(new
            {
                dailySummaryEmail = false,
                notificationEmail = (string?)null,
                lossAlerts = false
            });
        }

        return Ok(ToResponse(settings));
    }

    // ---------------------------------------------------------
    // PUT /api/settings
    // ---------------------------------------------------------

    [HttpPut]
    public async Task<ActionResult<object>> UpdateSettings(
        UpdateSettingsRequest request)
    {
        var userId = User.GetUserId();

        var notificationEmail =
            request.NotificationEmail?.Trim().ToLowerInvariant();

        if (notificationEmail is not null &&
            notificationEmail.Length > 320)
        {
            return BadRequest(
                "Notification email must be 320 characters or fewer."
            );
        }

        if (!string.IsNullOrWhiteSpace(notificationEmail) &&
            !IsValidEmail(notificationEmail))
        {
            return BadRequest(
                "Notification email must be a valid email address."
            );
        }

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.UserId == userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(settings => settings.UserId == userId);

        var now = DateTime.UtcNow;

        if (settings is null)
        {
            settings = new UserSetting
            {
                UserSettingId = Guid.NewGuid(),
                UserId = userId,
                DailySummaryEmail = request.DailySummaryEmail,
                NotificationEmail = string.IsNullOrWhiteSpace(notificationEmail)
                    ? null
                    : notificationEmail,
                LossAlerts = request.LossAlerts,
                CreatedAt = now,
                UpdatedAt = now
            };

            _db.UserSettings.Add(settings);
        }
        else
        {
            settings.DailySummaryEmail = request.DailySummaryEmail;
            settings.NotificationEmail =
                string.IsNullOrWhiteSpace(notificationEmail)
                    ? null
                    : notificationEmail;
            settings.LossAlerts = request.LossAlerts;
            settings.UpdatedAt = now;
        }

        await _db.SaveChangesAsync();

        return Ok(ToResponse(settings));
    }

    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------

    private static bool IsValidEmail(string email)
    {
        try
        {
            var address = new MailAddress(email);

            return string.Equals(
                address.Address,
                email,
                StringComparison.OrdinalIgnoreCase
            );
        }
        catch
        {
            return false;
        }
    }

    private static object ToResponse(UserSetting settings)
    {
        return new
        {
            userSettingId = settings.UserSettingId,
            userId = settings.UserId,
            dailySummaryEmail = settings.DailySummaryEmail,
            notificationEmail = settings.NotificationEmail,
            lossAlerts = settings.LossAlerts,
            createdAt = settings.CreatedAt,
            updatedAt = settings.UpdatedAt
        };
    }
}