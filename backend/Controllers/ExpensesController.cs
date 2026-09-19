using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Expenses;
using SparkSalesApi.Models;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly SparkSalesDbContext _db;

    public ExpensesController(SparkSalesDbContext db)
    {
        _db = db;
    }

    // ---------------------------------------------------------
    // GET /api/expenses
    // ---------------------------------------------------------
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetExpenses()
    {
        var userId = User.GetUserId();

        var expenses = await _db.Expenses
            .AsNoTracking()
            .Where(expense =>
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == expense.BusinessId))
            .OrderByDescending(expense => expense.ExpenseDate)
            .ThenByDescending(expense => expense.CreatedAt)
            .Select(expense => ToResponse(expense))
            .ToListAsync();

        return Ok(expenses);
    }

    // ---------------------------------------------------------
    // GET /api/expenses/{id}
    // ---------------------------------------------------------
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetExpense(Guid id)
    {
        var userId = User.GetUserId();

        var expense = await _db.Expenses
            .AsNoTracking()
            .Where(expense =>
                expense.ExpenseId == id &&
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == expense.BusinessId))
            .Select(expense => ToResponse(expense))
            .FirstOrDefaultAsync();

        if (expense is null)
        {
            return NotFound("Expense not found.");
        }

        return Ok(expense);
    }

    // ---------------------------------------------------------
    // POST /api/expenses
    // ---------------------------------------------------------
    [HttpPost]
    public async Task<ActionResult<object>> CreateExpense(
        CreateExpenseRequest request)
    {
        var userId = User.GetUserId();

        var validationError = Validate(
            request.Name,
            request.Category,
            request.Amount,
            request.Note
        );

        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var businessId = await _db.BusinessMembers
            .Where(member => member.UserId == userId)
            .Select(member => (Guid?)member.BusinessId)
            .FirstOrDefaultAsync();

        if (businessId is null)
        {
            return NotFound("Set up your business first.");
        }

        var now = DateTime.UtcNow;

        var expense = new Expense
        {
            ExpenseId = Guid.NewGuid(),
            BusinessId = businessId.Value,
            CreatedByUserId = userId,

            Name = request.Name.Trim(),

            Seller = string.IsNullOrWhiteSpace(request.Seller)
                ? "General/Stall"
                : request.Seller.Trim(),

            Category = request.Category.Trim(),

            Amount = request.Amount,

            ExpenseDate = EnsureUtc(request.ExpenseDate),

            Note = string.IsNullOrWhiteSpace(request.Note)
                ? null
                : request.Note.Trim(),

            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Expenses.Add(expense);

        await _db.SaveChangesAsync();

        return Created(
            $"/api/expenses/{expense.ExpenseId}",
            ToResponse(expense)
        );
    }

    // ---------------------------------------------------------
    // PUT /api/expenses/{id}
    // ---------------------------------------------------------
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<object>> UpdateExpense(
        Guid id,
        UpdateExpenseRequest request)
    {
        var userId = User.GetUserId();

        var validationError = Validate(
            request.Name,
            request.Category,
            request.Amount,
            request.Note
        );

        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var expense = await _db.Expenses
            .Where(expense =>
                expense.ExpenseId == id &&
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == expense.BusinessId))
            .FirstOrDefaultAsync();

        if (expense is null)
        {
            return NotFound("Expense not found.");
        }

        expense.Name = request.Name.Trim();

        expense.Seller = string.IsNullOrWhiteSpace(request.Seller)
            ? "General/Stall"
            : request.Seller.Trim();

        expense.Category = request.Category.Trim();

        expense.Amount = request.Amount;

        expense.ExpenseDate = EnsureUtc(request.ExpenseDate);

        expense.Note = string.IsNullOrWhiteSpace(request.Note)
            ? null
            : request.Note.Trim();

        expense.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(ToResponse(expense));
    }

    // ---------------------------------------------------------
    // DELETE /api/expenses/{id}
    // ---------------------------------------------------------
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteExpense(Guid id)
    {
        var userId = User.GetUserId();

        var expense = await _db.Expenses
            .Where(expense =>
                expense.ExpenseId == id &&
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == expense.BusinessId))
            .FirstOrDefaultAsync();

        if (expense is null)
        {
            return NotFound("Expense not found.");
        }

        _db.Expenses.Remove(expense);

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ---------------------------------------------------------
    // Validation
    // ---------------------------------------------------------
    private static string? Validate(
        string name,
        string category,
        decimal amount,
        string? note)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Expense name is required.";
        }

        if (name.Length > 150)
        {
            return "Expense name must be 150 characters or fewer.";
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            return "Category is required.";
        }

        if (category.Length > 80)
        {
            return "Category must be 80 characters or fewer.";
        }

        if (amount < 0)
        {
            return "Expense amount cannot be negative.";
        }

        if (note is not null && note.Length > 500)
        {
            return "Note must be 500 characters or fewer.";
        }

        return null;
    }

    // ---------------------------------------------------------
    // Date normalization
    // ---------------------------------------------------------
    private static DateTime EnsureUtc(DateTime date)
    {
        return date.Kind switch
        {
            DateTimeKind.Utc => date,

            DateTimeKind.Local =>
                date.ToUniversalTime(),

            _ =>
                DateTime.SpecifyKind(
                    date,
                    DateTimeKind.Utc)
        };
    }

    // ---------------------------------------------------------
    // Response mapping
    // ---------------------------------------------------------
    private static object ToResponse(Expense expense)
    {
        return new
        {
            expenseId = expense.ExpenseId,
            businessId = expense.BusinessId,
            createdByUserId = expense.CreatedByUserId,

            name = expense.Name,
            seller = expense.Seller,
            category = expense.Category,

            amount = expense.Amount,

            expenseDate = expense.ExpenseDate,

            note = expense.Note,

            createdAt = expense.CreatedAt,
            updatedAt = expense.UpdatedAt
        };
    }
}