namespace SparkSalesApi.DTOs.Auth;

public record ResetPasswordRequest(string Token, string NewPassword);
