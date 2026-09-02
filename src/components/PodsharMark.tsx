/**
 * The Podshar mark: "Pod" — a downward arrow, the descent — resolving into
 * "Shar" — a soft sphere trailing a wisp. Stroke-only, inherits currentColor,
 * so it sits equally well on cream, sand or clay.
 */
export function PodsharMark({
  className = 'h-8 w-8',
  animated = false
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 58"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Pod — the descent */}
      <path
        d="M24 4v20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 17.5 24 25.5l8-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Shar — the sphere */}
      <circle cx="24" cy="39" r="9.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="24" cy="39" r="9.5" fill="currentColor" fillOpacity="0.14" />

      {/* The wisp, drifting off the lower-left of the sphere */}
      <g
        className={animated ? 'animate-wisp-drift' : undefined}
        style={{ transformOrigin: '16px 46px' }}
      >
        <path
          d="M16.5 46.5c-3.5 2.2-5.8 4.6-7 7.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M21 49.5c-1.6 1.6-2.6 3.2-3.1 4.9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

/** Wordmark used in the sidebar header and the page chrome. */
export function PodsharWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display uppercase tracking-wordmark ${className}`}
      aria-label="Podshar"
    >
      Podshar
    </span>
  );
}
