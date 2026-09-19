using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Team;
using SparkSalesApi.Models;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/team")]
[Authorize]
public class TeamController : ControllerBase
{
    private readonly SparkSalesDbContext _db;

    private static readonly string[] AllowedRoles =
    {
        "Manager",
        "Cashier",
        "Member"
    };

    public TeamController(SparkSalesDbContext db)
    {
        _db = db;
    }

    // ---------------------------------------------------------
// GET /api/team
// ---------------------------------------------------------

[HttpGet]
public async Task<ActionResult<IEnumerable<object>>> GetTeam()
{
    var userId = User.GetUserId();

    var businessId = await _db.BusinessMembers
        .Where(member => member.UserId == userId)
        .Select(member => (Guid?)member.BusinessId)
        .FirstOrDefaultAsync();

    if (businessId is null)
    {
        return NotFound("Set up your business first.");
    }

    var team = await _db.BusinessMembers
        .AsNoTracking()
        .Include(member => member.User)
        .Where(member => member.BusinessId == businessId.Value)
        .OrderBy(member => member.Role)
        .ThenBy(member => member.User.FullName)
        .Select(member => ToResponse(member))
        .ToListAsync();

    return Ok(team);
}

    // ---------------------------------------------------------
    // POST /api/team
    // ---------------------------------------------------------
    [HttpPost]
    public async Task<ActionResult<object>> AddTeamMember(
        AddTeamMemberRequest request)
    {
        var userId = User.GetUserId();

        var email = request.Email?.Trim().ToLowerInvariant() ?? "";
        var role = request.Role?.Trim() ?? "";

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest("Team member email is required.");
        }

        if (email.Length > 320)
        {
            return BadRequest(
                "Team member email must be 320 characters or fewer."
            );
        }

        if (!AllowedRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(
                "Invalid team member role. Allowed roles are Manager, Cashier, and Member."
            );
        }

        var membership = await _db.BusinessMembers
            .Include(member => member.Business)
            .FirstOrDefaultAsync(member =>
                member.UserId == userId);

        if (membership is null)
        {
            return NotFound("Set up your business first.");
        }

        if (membership.Role != "Owner" &&
            membership.Role != "Manager")
        {
            return Forbid();
        }

        var businessId = membership.BusinessId;

        // Managers may only create Cashier/Member roles.
        if (membership.Role == "Manager" &&
            role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var existingUser = await _db.Users
            .FirstOrDefaultAsync(user =>
                user.Email.ToLower() == email);

        if (existingUser is null)
        {
            return NotFound(
                "No SparkSales account exists with that email address."
            );
        }

        // Prevent adding the business owner as a second member.
        if (existingUser.UserId == membership.Business.OwnerUserId)
        {
            return Conflict(
                "The business owner is already part of the team."
            );
        }

        var alreadyMember = await _db.BusinessMembers
            .AnyAsync(member =>
                member.BusinessId == businessId &&
                member.UserId == existingUser.UserId);

        if (alreadyMember)
        {
            return Conflict(
                "This user is already a member of the business."
            );
        }

        var teamMember = new BusinessMember
        {
            BusinessMemberId = Guid.NewGuid(),
            BusinessId = businessId,
            UserId = existingUser.UserId,
            Role = NormalizeRole(role),
            JoinedAt = DateTime.UtcNow
        };

        _db.BusinessMembers.Add(teamMember);

        await _db.SaveChangesAsync();

        await _db.Entry(teamMember)
            .Reference(member => member.User)
            .LoadAsync();

        return Created(
            $"/api/team/{teamMember.BusinessMemberId}",
            ToResponse(teamMember)
        );
    }

    // ---------------------------------------------------------
    // DELETE /api/team/{id}
    // ---------------------------------------------------------
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveTeamMember(Guid id)
    {
        var userId = User.GetUserId();

        var currentMembership = await _db.BusinessMembers
            .Include(member => member.Business)
            .FirstOrDefaultAsync(member =>
                member.UserId == userId);

        if (currentMembership is null)
        {
            return NotFound("Set up your business first.");
        }

        if (currentMembership.Role != "Owner" &&
            currentMembership.Role != "Manager")
        {
            return Forbid();
        }

        var teamMember = await _db.BusinessMembers
            .Include(member => member.User)
            .FirstOrDefaultAsync(member =>
                member.BusinessMemberId == id &&
                member.BusinessId == currentMembership.BusinessId);

        if (teamMember is null)
        {
            return NotFound("Team member not found.");
        }

        // Never allow the owner membership to be deleted.
        if (teamMember.Role == "Owner")
        {
            return BadRequest(
                "The business owner cannot be removed from the team."
            );
        }

        // Managers cannot remove managers.
        if (currentMembership.Role == "Manager" &&
            teamMember.Role == "Manager")
        {
            return Forbid();
        }

        _db.BusinessMembers.Remove(teamMember);

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------

    private static string NormalizeRole(string role)
    {
        return role.Trim().ToLowerInvariant() switch
        {
            "manager" => "Manager",
            "cashier" => "Cashier",
            _ => "Member"
        };
    }

    private static object ToResponse(BusinessMember member)
{
    return new
    {
        businessMemberId = member.BusinessMemberId,
        businessId = member.BusinessId,
        userId = member.UserId,
        fullName = member.User?.FullName ?? "Unknown user",
        email = member.User?.Email ?? "",
        role = member.Role,
        joinedAt = member.JoinedAt
    };
}
}