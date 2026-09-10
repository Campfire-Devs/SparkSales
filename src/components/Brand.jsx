

export function LogoMark({ size = 32, light = false }) {
  const gradId = light ? "ssLogoGradLight" : "ssLogoGrad";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="6" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          {light ? (
            <>
              <stop offset="0" stopColor="#EAFBF7" />
              <stop offset="1" stopColor="#B8F2E6" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#B8F2E6" />
              <stop offset="1" stopColor="#063D35" />
            </>
          )}
        </linearGradient>
      </defs>
      <rect x="7" y="26" width="6" height="14" rx="1.5" fill={`url(#${gradId})`} opacity=".55" />
      <rect x="16" y="20" width="6" height="20" rx="1.5" fill={`url(#${gradId})`} opacity=".72" />
      <rect x="25" y="13" width="6" height="27" rx="1.5" fill={`url(#${gradId})`} opacity=".88" />
      <rect x="34" y="6" width="6" height="34" rx="1.5" fill={`url(#${gradId})`} />
      <path d="M6 32C14 32 24 27 40 9" stroke={light ? "#F3FFFC" : "#7FCFC0"} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M40 9L31 10.5L38 18Z" fill={light ? "#F3FFFC" : "#7FCFC0"} />
      <path d="M20 8L22 12L26 13L22 14L20 18L18 14L14 13L18 12Z" fill={light ? "#F3FFFC" : "#7FCFC0"} opacity=".9" />
      <path d="M27 3L28 5.5L30.5 6.5L28 7.5L27 10L26 7.5L23.5 6.5L26 5.5Z" fill={light ? "#F3FFFC" : "#B8F2E6"} opacity=".85" />
    </svg>
  );
}

export function Wordmark({ size = "md", light = false }) {
  return (
    <span className={"ss-wordmark2" + (size === "sm" ? " is-sm" : "")}>
      <span className="ss-wordmark2-spark">Spark</span>
      <span className={"ss-wordmark2-sales" + (light ? " is-light" : "")}>Sales</span>
    </span>
  );
}

export function BrandLockup({ size = 32, wordmarkSize = "md", light = false, tagline = false }) {
  return (
    <div className="ss-lockup">
      <div className="ss-brand-row">
        <LogoMark size={size} light={light} />
        <Wordmark size={wordmarkSize} light={light} />
      </div>
      {tagline && <p className={"ss-lockup-tagline" + (light ? " is-light" : "")}>— Ignite Your Earnings —</p>}
    </div>
  );
}
