using System.Net;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public sealed class WelcomeEmailService
{
    private const string SenderEmail = "sparksales.team01@gmail.com";
    private readonly IConfiguration _configuration;
    private readonly ILogger<WelcomeEmailService> _logger;

    public WelcomeEmailService(
        IConfiguration configuration,
        ILogger<WelcomeEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAsync(string recipientEmail, string fullName)
    {
        var appPassword = _configuration["Email:AppPassword"];
        if (string.IsNullOrWhiteSpace(appPassword))
        {
            _logger.LogWarning(
                "Welcome email skipped because Email:AppPassword is not configured.");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("SparkSales Team", SenderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = "Welcome to SparkSales";
        message.Body = new BodyBuilder
        {
            HtmlBody = $"""
                <div style="font-family:Arial,sans-serif;max-width:560px;color:#063D35;line-height:1.6">
                  <h1>Welcome to SparkSales, {WebUtility.HtmlEncode(fullName)}!</h1>
                  <p>Your account has been created successfully.</p>
                  <p>Next, complete your business profile and start tracking sales, expenses, and profit in one place.</p>
                  <p style="color:#5C7A74">The SparkSales Team</p>
                </div>
                """
        }.ToMessageBody();

        try
        {
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(SenderEmail, appPassword);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
            _logger.LogInformation("Welcome email sent to {Email}", recipientEmail);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Welcome email failed for {Email}", recipientEmail);
        }
    }
}
