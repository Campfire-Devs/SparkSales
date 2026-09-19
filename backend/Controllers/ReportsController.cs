using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.DTOs.Reports;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly SparkSalesDbContext _db;

    public ReportsController(SparkSalesDbContext db)
    {
        _db = db;
    }

    // ---------------------------------------------------------
    // GET /api/reports
    // ---------------------------------------------------------

    [HttpGet]
    public async Task<ActionResult<object>> GetReport(
        [FromQuery] ReportQuery query)
    {
        var userId = User.GetUserId();

        // -----------------------------------------------------
        // Find the business associated with the current user
        // -----------------------------------------------------

        var business = await _db.BusinessMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId)
            .Select(member => new
            {
                member.BusinessId,
                member.Business.CommissionRate
            })
            .FirstOrDefaultAsync();

        if (business is null)
        {
            return NotFound("Set up your business first.");
        }

        // -----------------------------------------------------
        // Validate date range
        // -----------------------------------------------------

        DateTime? from = query.From.HasValue
            ? EnsureUtc(query.From.Value)
            : null;

        DateTime? to = query.To.HasValue
            ? EnsureUtc(query.To.Value)
            : null;

        if (from.HasValue && to.HasValue && from > to)
        {
            return BadRequest(
                "The report start date cannot be after the end date."
            );
        }

        // Make the end date inclusive for date-only queries.
        // Example:
        // to=2026-09-15
        // includes the whole 15th.
        DateTime? inclusiveTo = to.HasValue
            ? to.Value.Date.AddDays(1)
            : null;

        // -----------------------------------------------------
        // Sales query
        // -----------------------------------------------------

        var salesQuery = _db.Sales
            .AsNoTracking()
            .Where(sale => sale.BusinessId == business.BusinessId);

        if (from.HasValue)
        {
            salesQuery = salesQuery.Where(
                sale => sale.SaleDate >= from.Value
            );
        }

        if (inclusiveTo.HasValue)
        {
            salesQuery = salesQuery.Where(
                sale => sale.SaleDate < inclusiveTo.Value
            );
        }

        // -----------------------------------------------------
        // Expense query
        // -----------------------------------------------------

        var expensesQuery = _db.Expenses
            .AsNoTracking()
            .Where(expense =>
                expense.BusinessId == business.BusinessId);

        if (from.HasValue)
        {
            expensesQuery = expensesQuery.Where(
                expense => expense.ExpenseDate >= from.Value
            );
        }

        if (inclusiveTo.HasValue)
        {
            expensesQuery = expensesQuery.Where(
                expense => expense.ExpenseDate < inclusiveTo.Value
            );
        }

        // -----------------------------------------------------
        // Load the records
        // -----------------------------------------------------

        var sales = await salesQuery.ToListAsync();
        var expenses = await expensesQuery.ToListAsync();

        // -----------------------------------------------------
        // Financial calculations
        // -----------------------------------------------------

        var revenue = sales.Sum(sale =>
            sale.Quantity * sale.UnitPrice);

        var totalExpenses = expenses.Sum(expense =>
            expense.Amount);

        var grossProfit = revenue - totalExpenses;

        var commission = grossProfit > 0
            ? grossProfit * business.CommissionRate
            : 0m;

        var netProfit = grossProfit - commission;

        var unitsSold = sales.Sum(sale =>
            sale.Quantity);

        var transactionCount =
            sales.Count + expenses.Count;

        var averageSale =
            sales.Count > 0
                ? revenue / sales.Count
                : 0m;

        var margin =
            revenue > 0
                ? (grossProfit / revenue) * 100m
                : 0m;

        // -----------------------------------------------------
        // Revenue by category
        // -----------------------------------------------------

        var revenueByCategory = sales
            .GroupBy(sale => sale.Category)
            .Select(group => new
            {
                category = group.Key,
                revenue = group.Sum(sale =>
                    sale.Quantity * sale.UnitPrice)
            })
            .OrderByDescending(item => item.revenue)
            .ToList();

        // -----------------------------------------------------
        // Revenue by payment method
        // -----------------------------------------------------

        var revenueByPaymentMethod = sales
            .GroupBy(sale => sale.PaymentMethod)
            .Select(group => new
            {
                paymentMethod = group.Key,
                revenue = group.Sum(sale =>
                    sale.Quantity * sale.UnitPrice)
            })
            .OrderByDescending(item => item.revenue)
            .ToList();

        // -----------------------------------------------------
        // Expenses by category
        // -----------------------------------------------------

        var expensesByCategory = expenses
            .GroupBy(expense => expense.Category)
            .Select(group => new
            {
                category = group.Key,
                amount = group.Sum(expense =>
                    expense.Amount)
            })
            .OrderByDescending(item => item.amount)
            .ToList();

        // -----------------------------------------------------
        // Revenue by seller
        // -----------------------------------------------------

        var revenueBySeller = sales
            .GroupBy(sale => sale.Seller)
            .Select(group => new
            {
                seller = group.Key,
                revenue = group.Sum(sale =>
                    sale.Quantity * sale.UnitPrice),
                unitsSold = group.Sum(sale =>
                    sale.Quantity)
            })
            .OrderByDescending(item => item.revenue)
            .ToList();

        // -----------------------------------------------------
        // Daily performance
        // -----------------------------------------------------

        var dailyPerformance = sales
            .GroupBy(sale => sale.SaleDate.Date)
            .Select(group => new
            {
                date = group.Key,
                revenue = group.Sum(sale =>
                    sale.Quantity * sale.UnitPrice)
            })
            .OrderBy(item => item.date)
            .ToList();

        // -----------------------------------------------------
        // Recent transactions
        // -----------------------------------------------------

        var recentSales = sales
            .Select(sale => new
            {
                transactionType = "Sale",
                date = sale.SaleDate,
                description = sale.Product,
                category = sale.Category,
                amount = sale.Quantity * sale.UnitPrice,
                seller = sale.Seller
            });

        var recentExpenses = expenses
            .Select(expense => new
            {
                transactionType = "Expense",
                date = expense.ExpenseDate,
                description = expense.Name,
                category = expense.Category,
                amount = expense.Amount,
                seller = expense.Seller
            });

        var recentTransactions = recentSales
            .Concat(recentExpenses)
            .OrderByDescending(transaction => transaction.date)
            .Take(10)
            .ToList();

        // -----------------------------------------------------
        // Final response
        // -----------------------------------------------------

        return Ok(new
        {
            businessId = business.BusinessId,

            period = new
            {
                from,
                to = query.To
            },

            summary = new
            {
                revenue,
                expenses = totalExpenses,
                grossProfit,
                commission,
                netProfit,
                unitsSold,
                transactions = transactionCount,
                averageSale,
                margin
            },

            commissionRate = business.CommissionRate,

            revenueByCategory,

            revenueByPaymentMethod,

            expensesByCategory,

            revenueBySeller,

            dailyPerformance,

            recentTransactions
        });
    }

    // ---------------------------------------------------------
    // Helpers
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
}