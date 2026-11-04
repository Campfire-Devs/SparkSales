using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController : ControllerBase
{
    private readonly SparkSalesDbContext _db;
    private readonly WelcomeEmailService _email;

    public NotificationsController(
        SparkSalesDbContext db,
        WelcomeEmailService email)
    {
        _db = db;
        _email = email;
    }

    [HttpPost("daily-summary")]
    public async Task<IActionResult> SendDailySummary()
    {
        var userId = User.GetUserId();
        var settings = await _db.UserSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId);

        if (settings?.DailySummaryEmail != true)
        {
            return NoContent();
        }

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId);
        var business = await _db.BusinessMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId)
            .Select(member => member.Business)
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return Unauthorized();
        }

        if (business is null)
        {
            return NotFound("No business is associated with this account.");
        }

        var start = DateTime.UtcNow.Date;
        var end = start.AddDays(1);
        var revenue = await _db.Sales
            .Where(sale =>
                sale.BusinessId == business.BusinessId &&
                sale.SaleDate >= start &&
                sale.SaleDate < end)
            .SumAsync(sale => (decimal?)(sale.Quantity * sale.UnitPrice)) ?? 0m;
        var expenses = await _db.Expenses
            .Where(expense =>
                expense.BusinessId == business.BusinessId &&
                expense.ExpenseDate >= start &&
                expense.ExpenseDate < end)
            .SumAsync(expense => (decimal?)expense.Amount) ?? 0m;
        var grossProfit = revenue - expenses;
        var commission = grossProfit > 0
            ? grossProfit * business.CommissionRate
            : 0m;

        try
        {
            await _email.SendDailySummaryAsync(
                settings.NotificationEmail ?? user.Email,
                user.FullName,
                business.Name,
                revenue,
                expenses,
                grossProfit,
                grossProfit - commission
            );
        }
        catch (InvalidOperationException exception)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new { message = exception.Message }
            );
        }

        return NoContent();
    }

    [HttpPost("loss-alert")]
    public async Task<IActionResult> SendLossAlert()
    {
        var userId = User.GetUserId();
        var settings = await _db.UserSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId);

        if (settings?.LossAlerts != true)
        {
            return NoContent();
        }

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId);
        var business = await _db.BusinessMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId)
            .Select(member => member.Business)
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return Unauthorized();
        }

        if (business is null)
        {
            return NotFound("No business is associated with this account.");
        }

        var revenue = await _db.Sales
            .Where(sale => sale.BusinessId == business.BusinessId)
            .SumAsync(sale => (decimal?)(sale.Quantity * sale.UnitPrice)) ?? 0m;
        var expenses = await _db.Expenses
            .Where(expense => expense.BusinessId == business.BusinessId)
            .SumAsync(expense => (decimal?)expense.Amount) ?? 0m;
        var grossProfit = revenue - expenses;
        var commission = grossProfit > 0
            ? grossProfit * business.CommissionRate
            : 0m;
        var netProfit = grossProfit - commission;

        if (netProfit >= 0)
        {
            return NoContent();
        }

        try
        {
            await _email.SendLossAlertAsync(
                settings.NotificationEmail ?? user.Email,
                user.FullName,
                business.Name,
                netProfit
            );
        }
        catch (InvalidOperationException exception)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new { message = exception.Message }
            );
        }

        return NoContent();
    }
}
