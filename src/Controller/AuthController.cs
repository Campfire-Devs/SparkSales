using Microsoft.AspNetCore.Mvc;
using Npgsql;
using SparkSalesApi.Auth;
using SparkSalesApi.Data;
using SparkSalesApi.Models;
using SparkSalesApi.Services;

namespace SparkSalesApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly DbHelper _db;
    private readonly JwtHelper _jwt;
    private readonly EmailService _email;

    public AuthController(DbHelper db, JwtHelper jwt, EmailService email)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FullName) || string.IsNullOrWhiteSpace(req.Email))
            return BadRequest("Full name and email are required.");
        if (req.Password.Length < 6)
            return BadRequest("Password must be at least 6 characters.");

        await using var conn = await _db.GetConnectionAsync();

        // Reject duplicate emails up front for a clean error message.
        await using (var check = new NpgsqlCommand("SELECT 1 FROM accounts WHERE email = @email", conn))
        {
            check.Parameters.AddWithValue("email", req.Email.ToLower());
            if (await check.ExecuteScalarAsync() != null)
                return Conflict("An account with that email already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        const string insertSql = @"
            INSERT INTO accounts (full_name, email, password_hash, provider, terms_agreed_at)
            VALUES (@fullName, @email, @passwordHash, 'email', now())
            RETURNING account_id, full_name, email, provider, created_at";

        await using var cmd = new NpgsqlCommand(insertSql, conn);
        cmd.Parameters.AddWithValue("fullName", req.FullName);
        cmd.Parameters.AddWithValue("email", req.Email.ToLower());
        cmd.Parameters.AddWithValue("passwordHash", passwordHash);

        await using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();
        var account = new Account(
            reader.GetInt32(0), reader.GetString(1), reader.GetString(2),
            reader.GetString(3), reader.GetDateTime(4));

        var token = _jwt.GenerateToken(account.AccountId, account.Email);

        // Fire the welcome email but don't let a slow/failed send hold up
        // the registration response — EmailService already swallows and
        // logs its own errors.
        _ = _email.SendWelcomeEmailAsync(account.Email, account.FullName);

        return Ok(new AuthResponse(token, account));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        await using var conn = await _db.GetConnectionAsync();

        const string sql = @"
            SELECT account_id, full_name, email, provider, created_at, password_hash
            FROM accounts WHERE email = @email";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("email", req.Email.ToLower());

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return Unauthorized("Incorrect email or password.");

        var passwordHash = reader.IsDBNull(5) ? null : reader.GetString(5);
        if (passwordHash == null || !BCrypt.Net.BCrypt.Verify(req.Password, passwordHash))
            return Unauthorized("Incorrect email or password.");

        var account = new Account(
            reader.GetInt32(0), reader.GetString(1), reader.GetString(2),
            reader.GetString(3), reader.GetDateTime(4));

        var token = _jwt.GenerateToken(account.AccountId, account.Email);
        return Ok(new AuthResponse(token, account));
    }

    [HttpPut("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest req)
    {
        if (req.NewPassword.Length < 6)
            return BadRequest("New password must be at least 6 characters.");

        var accountId = User.GetAccountId();
        await using var conn = await _db.GetConnectionAsync();

        await using var lookup = new NpgsqlCommand(
            "SELECT password_hash FROM accounts WHERE account_id = @id", conn);
        lookup.Parameters.AddWithValue("id", accountId);
        var currentHash = (string?)await lookup.ExecuteScalarAsync();

        if (currentHash == null || !BCrypt.Net.BCrypt.Verify(req.CurrentPassword, currentHash))
            return Unauthorized("Current password is incorrect.");

        var newHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await using var update = new NpgsqlCommand(
            "UPDATE accounts SET password_hash = @hash WHERE account_id = @id", conn);
        update.Parameters.AddWithValue("hash", newHash);
        update.Parameters.AddWithValue("id", accountId);
        await update.ExecuteNonQueryAsync();

        return NoContent();
    }
}
