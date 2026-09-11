using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.Models;
using SparkSalesApi.Services;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/deletion-request")]
[Authorize]
public class DeletionRequestController : ControllerBase
{
    private readonly DbHelper _db;
    private readonly WelcomeEmailService _email;
    public DeletionRequestController(DbHelper db, WelcomeEmailService email) { _db = db; _email = email; }

    [HttpGet]
    public async Task<ActionResult<DeletionRequest?>> GetPending()
    {
        await using var conn = await _db.GetConnectionAsync();
        var businessId = await BusinessLookup.GetBusinessIdAsync(conn, User.GetAccountId());
        if (businessId == null) return NotFound("Set up your business first.");

        const string sql = @"
            SELECT deletion_request_id, business_id, reason, requested_at, status
            FROM deletion_requests WHERE business_id = @businessId AND status = 'pending'
            ORDER BY requested_at DESC LIMIT 1";
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("businessId", businessId.Value);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return Ok((DeletionRequest?)null);

        return Ok(new DeletionRequest(
            reader.GetInt32(0), reader.GetInt32(1),
            reader.IsDBNull(2) ? null : reader.GetString(2), reader.GetDateTime(3), reader.GetString(4)));
    }

    [HttpPost]
    public async Task<ActionResult<DeletionRequest>> Submit(CreateDeletionRequestDto req)
    {
        await using var conn = await _db.GetConnectionAsync();
        var businessId = await BusinessLookup.GetBusinessIdAsync(conn, User.GetAccountId());
        if (businessId == null) return NotFound("Set up your business first.");

        // Need the business name for the email body
        await using var nameCmd = new NpgsqlCommand("SELECT name FROM businesses WHERE business_id = @id", conn);
        nameCmd.Parameters.AddWithValue("id", businessId.Value);
        var businessName = (string)(await nameCmd.ExecuteScalarAsync())!;

        const string sql = @"
            INSERT INTO deletion_requests (business_id, reason)
            VALUES (@businessId, @reason)
            RETURNING deletion_request_id, business_id, reason, requested_at, status";
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("businessId", businessId.Value);
        cmd.Parameters.AddWithValue("reason", (object?)req.Reason ?? DBNull.Value);

        await using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();
        var result = new DeletionRequest(
            reader.GetInt32(0), reader.GetInt32(1),
            reader.IsDBNull(2) ? null : reader.GetString(2), reader.GetDateTime(3), reader.GetString(4));

        _ = _email.SendDeletionRequestEmailAsync(User.GetEmail(), businessName, req.Reason);

        return Ok(result);
    }

    [HttpPost("{deletionRequestId:int}/cancel")]
    public async Task<IActionResult> Cancel(int deletionRequestId)
    {
        await using var conn = await _db.GetConnectionAsync();
        var businessId = await BusinessLookup.GetBusinessIdAsync(conn, User.GetAccountId());
        if (businessId == null) return NotFound("Set up your business first.");

        const string sql = @"
            UPDATE deletion_requests SET status = 'cancelled'
            WHERE deletion_request_id = @id AND business_id = @businessId AND status = 'pending'";
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", deletionRequestId);
        cmd.Parameters.AddWithValue("businessId", businessId.Value);

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows == 0 ? NotFound() : NoContent();
    }
}