# SparkSales API

This project provides the OAuth entry points used by the React app:

- `GET /api/auth/google`
- `GET /api/auth/apple`
- `GET /api/auth/callback`

Set provider client IDs through environment variables. Do not commit provider
secrets to `appsettings.json`.

```powershell
cd backend
$env:OAuth__Google__ClientId = "your-google-client-id"
$env:OAuth__Apple__ClientId = "your-apple-services-id"
dotnet run --launch-profile https
```

## Local API configuration

The Vite development server proxies `/api` requests to `https://localhost:5001`.
Start the API as well as the frontend. The API requires a PostgreSQL connection
string and JWT signing key before it can start. `.env.example` is a reference,
and `backend/.env` is ignored by Git, but ASP.NET Core does not load dotenv files
automatically.

For the API to use these settings, set the connection string and a private JWT
signing key using .NET user-secrets from the `backend` directory, or export them
as process environment variables. Then start the API:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-postgresql-connection-string>"
dotnet user-secrets set "Jwt:Key" "<your-private-jwt-signing-key>"
dotnet run --launch-profile https
```

Keep the PostgreSQL connection string, JWT key, and email credentials private.
If any real credentials were committed to Git, rotate them; replacing the
current file does not remove credentials from earlier Git history.

## Google setup

1. Open Google Cloud Console and create or select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth client with application type **Web application**.
4. Add this authorized redirect URI:

`https://localhost:5001/api/auth/callback`

5. Set the generated client ID before starting the API:

```powershell
$env:OAuth__Google__ClientId = "your-client-id.apps.googleusercontent.com"
```

## Apple setup

1. In Apple Developer, create a **Services ID** and enable Sign in with Apple.
2. Add `https://localhost:5001/api/auth/callback` as the return URL.
3. Set the Services ID:

```powershell
$env:OAuth__Apple__ClientId = "com.example.sparksales.web"
```

Apple also requires a private-key-based client secret for token exchange. Keep
that key outside the repository; it is not needed by the redirect endpoint.

Register this callback URL with each provider:

`https://localhost:5001/api/auth/callback`

The callback endpoint currently validates the basic OAuth response shape but
still needs provider token exchange, account persistence, and signed session
token issuance before production sign-in is complete.

## Welcome email setup

Welcome emails are sent after registration; if delivery fails, the account is
still created and delivery is retried at the user's next sign-in. Successful
delivery is recorded so the welcome email is not sent again. Password reset
emails use the same SMTP configuration and report delivery failures to the
requesting user.

For Gmail, enable 2-Step Verification and create an **app password** for the
sender account (a normal Gmail password will not work). Configure the sender
address and app password using user-secrets from the `backend` directory:

```powershell
dotnet user-secrets set "Email:SenderEmail" "your-sender@gmail.com"
dotnet user-secrets set "Email:SenderAppPassword" "your-16-character-app-password"
```

You can paste the app password in its grouped format; the API removes formatting
whitespace before authenticating with SMTP.

The default SMTP host and port are `smtp.gmail.com` and `587`. For deployment,
set `Email__SenderEmail` and `Email__SenderAppPassword` as backend environment
variables or through your hosting provider's secret store. Never commit the app
password to the repository. If delivery cannot be completed, the backend logs
the failure; check those logs and SMTP configuration.

After deploying this change, apply the database migration from the `backend`
directory:

```powershell
dotnet ef database update
```

Account deletion requests send a notification to
`Email:DeletionRequestRecipient`. If it is unset, the notification is sent to
`Email:SenderEmail`. Configure an alternate recipient through user-secrets if
needed:

```powershell
dotnet user-secrets set "Email:DeletionRequestRecipient" "<your-support-email>"
```

Deletion requests require SMTP delivery to succeed; the Settings page will show
an error if the notification cannot be sent.

Password reset links are valid for 30 minutes. Set `Frontend__BaseUrl` to the
deployed frontend origin so links in reset emails open the correct site; the
default is `http://localhost:5173` for local development.

**Note:** a previous app password for this account was committed to this repo
in `appsettings.json`. It's been removed and should be treated as compromised
— rotate/revoke it in the Google account's security settings and generate a
new one before setting `Email__SenderAppPassword` again.

## Account storage

Accounts, application settings, and deletion requests are stored in the
PostgreSQL database configured by `ConnectionStrings:DefaultConnection`.
