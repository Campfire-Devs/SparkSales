using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Settings;
using SparkSalesApi.Models;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/deletion-request")]
[Authorize]
public sealed class DeletionRequestController : ControllerBase
{
    private readonly SparkSalesDbContext _db;
    private readonly WelcomeEmailService _email;

    public DeletionRequestController(
        SparkSalesDbContext db,
        WelcomeEmailService email)
    {
        _db = db;
        _email = email;
    }

    [HttpGet]
    public async Task<IActionResult> GetPending()
    {
        var userId = User.GetUserId();
        var request = await _db.DeletionRequests
            .AsNoTracking()
            .Where(item =>
                item.RequestedByUserId == userId &&
                item.Status == "pending")
            .OrderByDescending(item => item.RequestedAt)
            .FirstOrDefaultAsync();

        return Ok(request is null ? null : ToResponse(request));
    }

    [HttpPost]
    public async Task<IActionResult> Submit(
        CreateDeletionRequestRequest request)
    {
        var userId = User.GetUserId();
        var existingRequest = await _db.DeletionRequests
            .AnyAsync(item =>
                item.RequestedByUserId == userId &&
                item.Status == "pending");

        if (existingRequest)
        {
            return Conflict("An account deletion request is already pending.");
        }

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId);

        if (user is null)
        {
            return Unauthorized();
        }

        var business = await _db.BusinessMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId)
            .Select(member => member.Business)
            .FirstOrDefaultAsync();

        if (business is null)
        {
            return NotFound("No business is associated with this account.");
        }

        try
        {
            await _email.SendAccountDeletionRequestAsync(
                user.Email,
                user.FullName,
                business.Name,
                request.Reason?.Trim()
            );
        }
        catch (InvalidOperationException exception)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new { message = exception.Message }
            );
        }

        var deletionRequest = new DeletionRequest
        {
            DeletionRequestId = Guid.NewGuid(),
            BusinessId = business.BusinessId,
            RequestedByUserId = userId,
            Reason = string.IsNullOrWhiteSpace(request.Reason)
                ? null
                : request.Reason.Trim(),
            RequestedAt = DateTime.UtcNow,
            Status = "pending"
        };

        _db.DeletionRequests.Add(deletionRequest);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(deletionRequest));
    }

    [HttpPost("{deletionRequestId:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid deletionRequestId)
    {
        var userId = User.GetUserId();
        var request = await _db.DeletionRequests
            .FirstOrDefaultAsync(item =>
                item.DeletionRequestId == deletionRequestId &&
                item.RequestedByUserId == userId &&
                item.Status == "pending");

        if (request is null)
        {
            return NotFound("No pending deletion request was found.");
        }

        request.Status = "cancelled";
        request.ProcessedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static object ToResponse(DeletionRequest request) =>
        new
        {
            id = request.DeletionRequestId,
            requestedAt = request.RequestedAt,
            status = request.Status
        };
}
