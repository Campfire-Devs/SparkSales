using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;

public sealed class WelcomeEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string? _appPassword;
    private readonly ILogger<WelcomeEmailService> _logger;

    public WelcomeEmailService(IConfiguration configuration, ILogger<WelcomeEmailService> logger)
    {
        _smtpHost = configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        _smtpPort = int.Parse(configuration["Email:SmtpPort"] ?? "587");
        _senderEmail = configuration["Email:SenderEmail"] ?? "";
        _senderName = configuration["Email:SenderName"] ?? "SparkSales";
        // Set via `dotnet user-secrets set "Email:SenderAppPassword" "..."` or the
        // Email__SenderAppPassword environment variable — never in appsettings.json.
        _appPassword = configuration["Email:SenderAppPassword"];
        _logger = logger;
    }

    public Task SendAsync(string recipientEmail, string fullName)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = "Welcome to SparkSales";
        message.Body = new TextPart("html")
        {
            Text = $"""
                <div style="font-family:Arial,sans-serif;max-width:560px;color:#063D35;line-height:1.6">
                  <h1>Welcome to SparkSales, {WebUtility.HtmlEncode(fullName)}!</h1>
                  <p>Your account has been created successfully.</p>
                  <p>Next, complete your business profile and start tracking sales, expenses, and profit in one place.</p>
                  <p style="color:#5C7A74">The SparkSales Team</p>
                </div>
                """
        };
        return SendAsync(message, recipientEmail);
    }

    public Task SendDeletionRequestAsync(string recipientEmail, string businessName, string? reason)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = $"We received your removal request — {businessName}";
        message.Body = new TextPart("html")
        {
            Text = $"""
                <div style="font-family:Arial,sans-serif;max-width:560px;color:#063D35;line-height:1.6">
                  <h1>Removal request received</h1>
                  <p>We've received your request to permanently delete <strong>{WebUtility.HtmlEncode(businessName)}</strong> from SparkSales{(string.IsNullOrWhiteSpace(reason) ? "" : $" ({WebUtility.HtmlEncode(reason)})")}.</p>
                  <p>Our team will process this and send a final confirmation once it's done.</p>
                  <p style="color:#5C7A74">The SparkSales Team</p>
                </div>
                """
        };
        return SendAsync(message, recipientEmail);
    }

    private async Task SendAsync(MimeMessage message, string recipientEmail)
    {
        if (string.IsNullOrWhiteSpace(_senderEmail) || string.IsNullOrWhiteSpace(_appPassword))
        {
            _logger.LogWarning("Email not sent to {Email} — Email:SenderEmail / Email:SenderAppPassword aren't configured.", recipientEmail);
            return;
        }

        try
        {
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_senderEmail, _appPassword);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
            _logger.LogInformation("Email sent to {Email}", recipientEmail);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Email failed for {Email}", recipientEmail);
        }
    }
}
