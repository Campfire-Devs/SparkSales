using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SparkSalesApi.Models;

namespace SparkSalesApi.Auth;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "Jwt:Key is not configured.");

        var issuer = _configuration["Jwt:Issuer"] ?? "SparkSalesApi";
        var audience = _configuration["Jwt:Audience"] ?? "SparkSalesClient";

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.UserId.ToString()
            ),

            new Claim(
                ClaimTypes.Email,
                user.Email
            ),

            new Claim(
                ClaimTypes.Name,
                user.FullName
            )
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}