namespace SparkSalesApi.DTOs.Team;

public record AddTeamMemberRequest(
    string Email,
    string Role
);