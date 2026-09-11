using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;

namespace SparkSalesApi.Services;

public class EmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string _appPassword;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _smtpHost = config["Email:SmtpHost"]!;
        _smtpPort = int.Parse(config["Email:SmtpPort"] ?? "587");
        _senderEmail = config["Email:SenderEmail"]!;
        _senderName = config["Email:SenderName"] ?? "SparkSales";
        _appPassword = config["Email:SenderAppPassword"]!;
        _logger = logger;
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string fullName, string businessNameHint = "")
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
            // A failed welcome email should never block registration —
            // log it and move on, rather than throwing.
            _logger.LogWarning(ex, "Failed to send welcome email to {Email}", toEmail);
        }
    }
}
