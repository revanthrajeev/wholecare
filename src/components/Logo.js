export default function Logo({ dark, compact }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="shrink-0">
        <defs>
          <linearGradient id="wc-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#23b3a2" />
            <stop offset="1" stopColor="#0b4f6c" />
          </linearGradient>
        </defs>
        <rect width="34" height="34" rx="10" fill="url(#wc-logo)" />
        <circle cx="17" cy="17" r="11" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2" />
        <path d="M7.5 15.5 L11 22.5 L14.5 12 L17 18 L19.5 12 L23 22.5 L26.5 15.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <span className={`font-display text-[17px] font-bold tracking-tight ${dark ? "text-white" : "text-ink-900"}`}>
          Whole<span className={dark ? "text-glow" : "text-brand-600"}>Care</span>
        </span>
      )}
    </span>
  );
}
