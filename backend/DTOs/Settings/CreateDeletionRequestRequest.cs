using System.ComponentModel.DataAnnotations;

namespace SparkSalesApi.DTOs.Settings;

/// <summary>Payload for requesting deletion of the authenticated user's account.</summary>
public sealed record CreateDeletionRequestRequest
{
    [MaxLength(1000)]
    public string? Reason { get; init; }
}
