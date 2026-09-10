import { useState } from "react";
import { getOAuthUrl } from "../lib/apiClient";

export function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

export function AppleGlyph() {
  return (
    <svg width="15" height="17" viewBox="0 0 15 18" fill="#fff" aria-hidden="true">
      <path d="M12.3 9.6c0-2.02 1.65-2.99 1.73-3.04-.94-1.38-2.41-1.57-2.93-1.59-1.25-.13-2.44.74-3.07.74-.63 0-1.6-.72-2.64-.7-1.36.02-2.61.79-3.31 2.01-1.41 2.45-.36 6.07 1.01 8.06.67.97 1.47 2.06 2.51 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.62.63 1.08-.02 1.77-.98 2.43-1.96.77-1.12 1.08-2.21 1.1-2.26-.02-.01-2.11-.81-2.13-3.22-.01-2.02 1.65-2.99 1.73-3.04M10.42 3.6c.55-.67.92-1.6.82-2.53-.79.03-1.75.53-2.32 1.19-.51.59-.96 1.54-.84 2.44.88.07 1.79-.44 2.34-1.1" />
    </svg>
  );
}

export function SocialCircleButton({ kind, label }) {
  const [redirecting, setRedirecting] = useState(false);

  function startOAuth() {
    setRedirecting(true);
    window.location.assign(getOAuthUrl(kind));
  }

  return (
    <button
      type="button"
      className={`ss-social-circle is-${kind}`}
      disabled={redirecting}
      onClick={startOAuth}
      aria-label={label}
      title={label}
    >
      {kind === "google" ? <GoogleGlyph /> : <AppleGlyph />}
    </button>
  );
}