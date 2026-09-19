namespace SparkSalesApi.DTOs.Auth;

public record AuthUserResponse(
    Guid UserId,
    string FullName,
    string Email,
    bool EmailVerified
);

public record AuthResponse(
    string Token,
    AuthUserResponse User
);