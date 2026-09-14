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

Registration sends a welcome email from `sparksales.team01@gmail.com` when the
Gmail SMTP credentials are configured. Create a Google app password for that
account, then set it only in the terminal running the API:

```powershell
$env:Email__SenderAppPassword = "your-16-character-app-password"
dotnet run --launch-profile https
```

The email is sent only after the address passes validation. If SMTP is not
configured or delivery fails, registration still succeeds and the API logs the
email failure. The app password must never be committed to the repository.

**Note:** a previous app password for this account was committed to this repo
in `appsettings.json`. It's been removed and should be treated as compromised
— rotate/revoke it in the Google account's security settings and generate a
new one before setting `Email__SenderAppPassword` again.

## Note on account storage

Accounts and deletion requests are currently kept in memory (a
`ConcurrentDictionary`) — they reset every time the API restarts. That's
expected for now; a teammate is wiring up persistent storage (Neon/Postgres)
separately. This is fine for testing the frontend pages end-to-end in one
running session.
