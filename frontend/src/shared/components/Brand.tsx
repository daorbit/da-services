export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-label="DA Services">
      <defs>
        <linearGradient id="da-lg" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="34" height="34" rx="11" fill="url(#da-lg)" />
      <path
        d="M10 25V11h5.5a7 7 0 0 1 0 14H10Zm3-3h2.5a4 4 0 0 0 0-8H13v8ZM22 25l4.2-14h2.6L33 25h-2.9l-.85-3h-4.5l-.86 3H22Zm4.3-5.5h3.1L28 15l-1.7 4.5Z"
        fill="#fff"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="wordmark">
      <Logo size={26} />
      <span className="wordmark-text">
        DA Services<span className="wordmark-dot">.</span>
      </span>
    </div>
  );
}
