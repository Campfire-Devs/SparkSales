using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Business;
using SparkSalesApi.Models;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/business")]
[Authorize]
public class BusinessController : ControllerBase
{
    private readonly SparkSalesDbContext _db;

    public BusinessController(SparkSalesDbContext db)
    {
        _db = db;
    }

    // ---------------------------------------------------------
    // GET /api/business
    // ---------------------------------------------------------
    [HttpGet]
    public async Task<ActionResult<object>> GetMyBusiness()
    {
        var userId = User.GetUserId();

        var business = await _db.BusinessMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId)
            .Select(member => member.Business)
            .FirstOrDefaultAsync();

        if (business is null)
        {
            return NotFound("Set up your business first.");
        }

        return Ok(ToResponse(business));
    }

    // ---------------------------------------------------------
    // POST /api/business
    // ---------------------------------------------------------
    [HttpPost]
    public async Task<ActionResult<object>> CreateBusiness(
        CreateBusinessRequest request)
    {
        var userId = User.GetUserId();

        var name = request.Name?.Trim() ?? "";
        var category = request.Category?.Trim() ?? "";

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest("Business name is required.");
        }

        if (name.Length > 150)
        {
            return BadRequest(
                "Business name must be 150 characters or fewer.");
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            return BadRequest("Business category is required.");
        }

        if (request.StartingCapital < 0)
        {
            return BadRequest(
                "Starting capital cannot be negative.");
        }

        // Current SparkSales UX uses one business/workspace per account.
        var existingMembership = await _db.BusinessMembers
            .AnyAsync(member => member.UserId == userId);

        if (existingMembership)
        {
            return Conflict(
                "You already have a business associated with this account.");
        }

        var now = DateTime.UtcNow;

        var business = new Business
        {
            BusinessId = Guid.NewGuid(),
            Name = name,
            Category = category,
            OwnerUserId = userId,
            Contact = request.Contact?.Trim(),
            Location = request.Location?.Trim(),
            StallNumber = request.StallNumber?.Trim(),
            StartingCapital = request.StartingCapital,
            CommissionRate = 0.05m,
            CreatedAt = now,
            UpdatedAt = now
        };

        var membership = new BusinessMember
        {
            BusinessMemberId = Guid.NewGuid(),
            BusinessId = business.BusinessId,
            UserId = userId,
            Role = "Owner",
            JoinedAt = now
        };

        await using var transaction =
            await _db.Database.BeginTransactionAsync();

        _db.Businesses.Add(business);
        _db.BusinessMembers.Add(membership);

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return Created(
            "/api/business",
            ToResponse(business)
        );
    }

    // ---------------------------------------------------------
    // PUT /api/business
    // ---------------------------------------------------------
    [HttpPut]
    public async Task<ActionResult<object>> UpdateBusiness(
        UpdateBusinessRequest request)
    {
        var userId = User.GetUserId();

        var business = await _db.BusinessMembers
            .Where(member =>
                member.UserId == userId &&
                (member.Role == "Owner" || member.Role == "Manager"))
            .Select(member => member.Business)
            .FirstOrDefaultAsync();

        if (business is null)
        {
            return NotFound(
                "You do not have permission to update a business.");
        }

        var name = request.Name?.Trim() ?? "";
        var category = request.Category?.Trim() ?? "";

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest("Business name is required.");
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            return BadRequest("Business category is required.");
        }

        if (request.StartingCapital < 0)
        {
            return BadRequest(
                "Starting capital cannot be negative.");
        }

        business.Name = name;
        business.Category = category;
        business.Contact = request.Contact?.Trim();
        business.Location = request.Location?.Trim();
        business.StallNumber = request.StallNumber?.Trim();
        business.StartingCapital = request.StartingCapital;
        business.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(ToResponse(business));
    }

    // ---------------------------------------------------------
    // PUT /api/business/commission-rate
    // ---------------------------------------------------------
    [HttpPut("commission-rate")]
    public async Task<ActionResult<object>> UpdateCommissionRate(
        CommissionRateRequest request)
    {
        var userId = User.GetUserId();

        if (request.CommissionRate < 0.05m ||
            request.CommissionRate > 1m)
        {
            return BadRequest(
                "Commission rate must be between 5% and 100%.");
        }

        var business = await _db.BusinessMembers
            .Where(member =>
                member.UserId == userId &&
                member.Role == "Owner")
            .Select(member => member.Business)
            .FirstOrDefaultAsync();

        if (business is null)
        {
            return NotFound(
                "Business not found or you are not the owner.");
        }

        business.CommissionRate = request.CommissionRate;
        business.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            commissionRate = business.CommissionRate
        });
    }

    private static object ToResponse(Business business)
    {
        return new
        {
            businessId = business.BusinessId,
            name = business.Name,
            category = business.Category,
            ownerUserId = business.OwnerUserId,
            contact = business.Contact,
            location = business.Location,
            stallNumber = business.StallNumber,
            startingCapital = business.StartingCapital,
            commissionRate = business.CommissionRate,
            createdAt = business.CreatedAt,
            updatedAt = business.UpdatedAt
        };
    }
}

public record CommissionRateRequest(
    decimal CommissionRate
);