using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;

public class WelcomeEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string _appPassword;
    private readonly ILogger<WelcomeEmailService> _logger;

    public WelcomeEmailService(IConfiguration config, ILogger<WelcomeEmailService> logger)
    {
        _smtpHost = config["Email:SmtpHost"]!;
        _smtpPort = int.Parse(config["Email:SmtpPort"] ?? "587");
        _senderEmail = config["Email:SenderEmail"]!;
        _senderName = config["Email:SenderName"] ?? "SparkSales";
        _appPassword = config["Email:SenderAppPassword"]!;
        _logger = logger;
    }

    public Task SendAsync(string toEmail, string fullName)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Welcome to SparkSales — let's ignite your earnings";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <div style=""font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #063D35;"">
                    <h1 style=""font-size: 22px;"">Welcome, {WebUtility.HtmlEncode(fullName)}!</h1>
                    <p style=""font-size: 15px; line-height: 1.6;"">
                        Your SparkSales account is ready. Log in, set up your stall, and start
                        tracking every sale and expense the moment you open your doors.
                    </p>
                    <p style=""font-size: 15px; line-height: 1.6;"">
                        Your profit and loss will calculate automatically — no spreadsheets needed.
                    </p>
                    <p style=""font-size: 13px; color: #5C7A74; margin-top: 32px;"">
                        — The SparkSales Team
                    </p>
                </div>"
        };

        return SendAsync(message, toEmail);
    }

    public Task SendDeletionRequestAsync(string toEmail, string businessName, string? reason)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = $"We received your removal request — {businessName}";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <div style=""font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #063D35;"">
                    <h1 style=""font-size: 22px;"">Removal request received</h1>
                    <p style=""font-size: 15px; line-height: 1.6;"">
                        We've received your request to permanently delete <strong>{WebUtility.HtmlEncode(businessName)}</strong>
                        from SparkSales{(string.IsNullOrWhiteSpace(reason) ? "" : $" ({WebUtility.HtmlEncode(reason)})")}.
                    </p>
                    <p style=""font-size: 15px; line-height: 1.6;"">
                        Our team will process this and send a final confirmation once it's done.
                    </p>
                    <p style=""font-size: 13px; color: #5C7A74; margin-top: 32px;"">
                        — The SparkSales Team
                    </p>
                </div>"
        };

        return SendAsync(message, toEmail);
    }

    private async Task SendAsync(MimeMessage message, string toEmail)
    {
        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_senderEmail, _appPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send email to {Email}", toEmail);
        }
    }
}