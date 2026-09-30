using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Sales;
using SparkSalesApi.Models;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/sales")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly SparkSalesDbContext _db;

    public SalesController(SparkSalesDbContext db)
    {
        _db = db;
    }

    // ---------------------------------------------------------
    // GET /api/sales
    // ---------------------------------------------------------
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetSales()
    {
        var userId = User.GetUserId();

        var sales = await _db.Sales
            .AsNoTracking()
            .Where(sale =>
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == sale.BusinessId))
            .OrderByDescending(sale => sale.SaleDate)
            .ThenByDescending(sale => sale.CreatedAt)
            .Select(sale => ToResponse(sale))
            .ToListAsync();

        return Ok(sales);
    }

    // ---------------------------------------------------------
    // GET /api/sales/{id}
    // ---------------------------------------------------------
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetSale(Guid id)
    {
        var userId = User.GetUserId();

        var sale = await _db.Sales
            .AsNoTracking()
            .Where(sale =>
                sale.SaleId == id &&
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == sale.BusinessId))
            .Select(sale => ToResponse(sale))
            .FirstOrDefaultAsync();

        if (sale is null)
        {
            return NotFound("Sale not found.");
        }

        return Ok(sale);
    }

    // ---------------------------------------------------------
    // POST /api/sales
    // ---------------------------------------------------------
    [HttpPost]
    public async Task<ActionResult<object>> CreateSale(
        CreateSaleRequest request)
    {
        var userId = User.GetUserId();

        var validationError = Validate(
            request.Product,
            request.Category,
            request.Quantity,
            request.UnitPrice,
            request.PaymentMethod
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

        var sale = new Sale
        {
            SaleId = Guid.NewGuid(),
            BusinessId = businessId.Value,
            CreatedByUserId = userId,

            Product = request.Product.Trim(),
            Category = request.Category.Trim(),
            Seller = string.IsNullOrWhiteSpace(request.Seller)
                ? "Unknown"
                : request.Seller.Trim(),

            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            PaymentMethod = request.PaymentMethod.Trim(),

            SaleDate = EnsureUtc(request.SaleDate),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Sales.Add(sale);

        await _db.SaveChangesAsync();

        return Created(
            $"/api/sales/{sale.SaleId}",
            ToResponse(sale)
        );
    }

    // ---------------------------------------------------------
    // PUT /api/sales/{id}
    // ---------------------------------------------------------
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<object>> UpdateSale(
        Guid id,
        UpdateSaleRequest request)
    {
        var userId = User.GetUserId();

        var validationError = Validate(
            request.Product,
            request.Category,
            request.Quantity,
            request.UnitPrice,
            request.PaymentMethod
        );

        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var sale = await _db.Sales
            .Where(sale =>
                sale.SaleId == id &&
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == sale.BusinessId))
            .FirstOrDefaultAsync();

        if (sale is null)
        {
            return NotFound("Sale not found.");
        }

        sale.Product = request.Product.Trim();
        sale.Category = request.Category.Trim();

        sale.Seller = string.IsNullOrWhiteSpace(request.Seller)
            ? "Unknown"
            : request.Seller.Trim();

        sale.Quantity = request.Quantity;
        sale.UnitPrice = request.UnitPrice;
        sale.PaymentMethod = request.PaymentMethod.Trim();
        sale.SaleDate = EnsureUtc(request.SaleDate);

        sale.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(ToResponse(sale));
    }

    // ---------------------------------------------------------
    // DELETE /api/sales/{id}
    // ---------------------------------------------------------
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSale(Guid id)
    {
        var userId = User.GetUserId();

        var sale = await _db.Sales
            .Where(sale =>
                sale.SaleId == id &&
                _db.BusinessMembers.Any(member =>
                    member.UserId == userId &&
                    member.BusinessId == sale.BusinessId))
            .FirstOrDefaultAsync();

        if (sale is null)
        {
            return NotFound("Sale not found.");
        }

        _db.Sales.Remove(sale);

        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static string? Validate(
        string product,
        string category,
        int quantity,
        decimal unitPrice,
        string paymentMethod)
    {
        if (string.IsNullOrWhiteSpace(product))
        {
            return "Product is required.";
        }

        if (product.Length > 150)
        {
            return "Product must be 150 characters or fewer.";
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            return "Category is required.";
        }

        if (category.Length > 80)
        {
            return "Category must be 80 characters or fewer.";
        }

        if (quantity <= 0)
        {
            return "Quantity must be greater than zero.";
        }

        if (unitPrice < 0)
        {
            return "Unit price cannot be negative.";
        }

        if (string.IsNullOrWhiteSpace(paymentMethod))
        {
            return "Payment method is required.";
        }

        if (paymentMethod.Length > 50)
        {
            return "Payment method must be 50 characters or fewer.";
        }

        return null;
    }

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

    private static object ToResponse(Sale sale)
    {
        return new
        {
            saleId = sale.SaleId,
            businessId = sale.BusinessId,
            createdByUserId = sale.CreatedByUserId,
            product = sale.Product,
            category = sale.Category,
            seller = sale.Seller,
            quantity = sale.Quantity,
            unitPrice = sale.UnitPrice,
            total = sale.Quantity * sale.UnitPrice,
            paymentMethod = sale.PaymentMethod,
            saleDate = sale.SaleDate,
            createdAt = sale.CreatedAt,
            updatedAt = sale.UpdatedAt
        };
    }
}