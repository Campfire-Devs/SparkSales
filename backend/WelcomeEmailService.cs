using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;
using System.Globalization;

public sealed class WelcomeEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string? _appPassword;
    private readonly string _frontendBaseUrl;
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
        _frontendBaseUrl = (configuration["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
        _logger = logger;
    }

    public Task SendAsync(string recipientEmail, string fullName)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = "Welcome to SparkSales";

        var body = $"""
            <tr>
              <td style="padding:36px 40px 8px 40px">
                <h1 style="margin:0 0 4px 0;font-size:22px;color:#063D35">Welcome, {WebUtility.HtmlEncode(fullName)}!</h1>
                <p style="margin:0;font-size:15px;color:#3F5B54">Your SparkSales account is ready to go.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0 40px;font-size:15px;color:#204A41;line-height:1.65">
                <p style="margin:0 0 16px 0">
                  Next, set up your business profile so you can start tracking sales,
                  expenses, and profit in one place.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 32px 40px">
                <a href="{_frontendBaseUrl}/login"
                   style="display:inline-block;background:#0E7C5A;color:#ffffff;text-decoration:none;
                          font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px">
                  Go to your dashboard
                </a>
              </td>
            </tr>
            {SignOffRow}
            """;

        message.Body = new TextPart("html") { Text = WrapInLayout(body) };
        return SendAsync(message, recipientEmail);
    }

    public Task SendPasswordResetAsync(string recipientEmail, string fullName, string resetLink)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = "Reset your SparkSales password";

        var body = $"""
            <tr>
              <td style="padding:36px 40px 8px 40px">
                <h1 style="margin:0 0 4px 0;font-size:22px;color:#063D35">Reset your password</h1>
                <p style="margin:0;font-size:15px;color:#3F5B54">Hi {WebUtility.HtmlEncode(fullName)}, we got a request to reset your password.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0 40px;font-size:15px;color:#204A41;line-height:1.65">
                <p style="margin:0 0 16px 0">
                  Click the button below to choose a new password. This link expires in 30 minutes.
                  If you didn't request this, you can safely ignore this email — your password won't change.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 32px 40px">
                <a href="{resetLink}"
                   style="display:inline-block;background:#0E7C5A;color:#ffffff;text-decoration:none;
                          font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px">
                  Reset password
                </a>
              </td>
            </tr>
            {SignOffRow}
            """;

        message.Body = new TextPart("html") { Text = WrapInLayout(body) };
        return SendAsync(message, recipientEmail);
    }

    public Task SendDailySummaryAsync(
        string recipientEmail, string fullName, string businessName,
        decimal revenue, decimal expenses, decimal grossProfit, decimal netProfit)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = $"Daily summary — {businessName}";

        var netProfitColor = netProfit < 0 ? "#C43D3D" : "#1F7A4D";

        var body = $"""
            <tr>
              <td style="padding:36px 40px 8px 40px">
                <h1 style="margin:0 0 4px 0;font-size:22px;color:#063D35">Today's summary</h1>
                <p style="margin:0;font-size:15px;color:#3F5B54">{WebUtility.HtmlEncode(businessName)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0 40px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#204A41">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #EEF3F1">Revenue</td>
                    <td style="padding:8px 0;border-bottom:1px solid #EEF3F1;text-align:right;font-weight:600">{FormatCurrency(revenue)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #EEF3F1">Expenses</td>
                    <td style="padding:8px 0;border-bottom:1px solid #EEF3F1;text-align:right;font-weight:600">{FormatCurrency(expenses)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #EEF3F1">Gross profit</td>
                    <td style="padding:8px 0;border-bottom:1px solid #EEF3F1;text-align:right;font-weight:600">{FormatCurrency(grossProfit)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0 0 0;font-weight:700">Net profit</td>
                    <td style="padding:10px 0 0 0;text-align:right;font-weight:700;color:{netProfitColor}">{FormatCurrency(netProfit)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px 40px">
                <a href="{_frontendBaseUrl}/dashboard"
                   style="display:inline-block;background:#0E7C5A;color:#ffffff;text-decoration:none;
                          font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px">
                  View full dashboard
                </a>
              </td>
            </tr>
            {SignOffRow}
            """;

        message.Body = new TextPart("html") { Text = WrapInLayout(body) };
        return SendAsync(message, recipientEmail);
    }

    public Task SendLossAlertAsync(string recipientEmail, string fullName, string businessName, decimal netProfit)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = $"Loss alert — {businessName}";

        var body = $"""
            <tr>
              <td style="padding:36px 40px 8px 40px">
                <h1 style="margin:0 0 4px 0;font-size:22px;color:#063D35">You're currently running at a loss</h1>
                <p style="margin:0;font-size:15px;color:#3F5B54">{WebUtility.HtmlEncode(businessName)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0 40px;font-size:15px;color:#204A41;line-height:1.65">
                <p style="margin:0">
                  Net profit is currently
                  <strong style="color:#C43D3D">{FormatCurrency(netProfit)}</strong>.
                  Worth a look at recent expenses and sales to see what's driving it.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px 40px">
                <a href="{_frontendBaseUrl}/reports"
                   style="display:inline-block;background:#0E7C5A;color:#ffffff;text-decoration:none;
                          font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px">
                  View reports
                </a>
              </td>
            </tr>
            {SignOffRow}
            """;

        message.Body = new TextPart("html") { Text = WrapInLayout(body) };
        return SendAsync(message, recipientEmail);
    }

    private static string FormatCurrency(decimal value) => $"R {value.ToString("N2", CultureInfo.InvariantCulture)}";

    public Task SendDeletionRequestAsync(string recipientEmail, string businessName, string? reason)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = $"We received your removal request — {businessName}";

        var reasonLine = string.IsNullOrWhiteSpace(reason)
            ? ""
            : $"""<p style="margin:12px 0 0 0;color:#3F5B54"><strong>Reason given:</strong> {WebUtility.HtmlEncode(reason)}</p>""";

        var body = $"""
            <tr>
              <td style="padding:36px 40px 8px 40px">
                <h1 style="margin:0 0 4px 0;font-size:22px;color:#063D35">Removal request received</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 32px 40px;font-size:15px;color:#204A41;line-height:1.65">
                <p style="margin:0">
                  We've received your request to permanently delete
                  <strong>{WebUtility.HtmlEncode(businessName)}</strong> from SparkSales.
                </p>
                {reasonLine}
                <p style="margin:16px 0 0 0">
                  Our team will process this and send a final confirmation once it's done.
                  Changed your mind? You can cancel the request from your Settings page any time
                  before then.
                </p>
              </td>
            </tr>
            {SignOffRow}
            """;

        message.Body = new TextPart("html") { Text = WrapInLayout(body) };
        return SendAsync(message, recipientEmail);
    }

    private static string SignOffRow => """
        <tr>
          <td style="padding:0 40px 28px 40px;font-size:14px;color:#3F5B54;line-height:1.6">
            <p style="margin:0">If you have any questions, our team is here to help.</p>
            <p style="margin:14px 0 0 0">
              Regards,<br />
              <em style="color:#0E7C5A">Let's ignite your earnings.</em><br />
              The SparkSales Team
            </p>
          </td>
        </tr>
        """;

    private string WrapInLayout(string bodyRows) => $"""
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:24px 12px;background:#F2F6F4;font-family:Arial,Helvetica,sans-serif">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <table role="presentation" width="560" cellpadding="0" cellspacing="0"
                         style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
                    <tr>
                      <td style="background:#063D35;padding:22px 40px">
                        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.3px">
                          SparkSales
                        </span>
                      </td>
                    </tr>
                    {bodyRows}
                    <tr>
                      <td style="padding:20px 40px 28px 40px;border-top:1px solid #E6ECE9">
                        <p style="margin:0 0 6px 0;font-size:12px;color:#7C948D">
                          <a href="{_frontendBaseUrl}/terms-and-conditions" style="color:#0E7C5A;text-decoration:none">Terms &amp; Conditions</a>
                          &nbsp;&middot;&nbsp;
                          <a href="{_frontendBaseUrl}/privacy-policy" style="color:#0E7C5A;text-decoration:none">Privacy Policy</a>
                        </p>
                        <p style="margin:0;font-size:12px;color:#9AACA6">
                          You're receiving this email because it's linked to a SparkSales account.
                          &copy; {DateTime.UtcNow.Year} SparkSales.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """;

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
