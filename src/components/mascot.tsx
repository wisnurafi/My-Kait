/**
 * Mascot — the My Kait blob.
 * Lime rounded blob with a >_< kaomoji face, antenna with pulsing light.
 * Idle bobbing animation via .mascot CSS class (globals.css).
 * Pure SVG, no dependencies.
 */

export function Mascot({
  size = 92,
  className,
  mini = false,
}: {
  size?: number;
  className?: string;
  /** mini: skip blush + shadow for tiny placements */
  mini?: boolean;
}) {
  const h = Math.round((size * 118) / 120);
  return (
    <div className={`mascot ${className ?? ""}`}>
      <svg viewBox="0 0 120 118" width={size} height={h} aria-hidden="true">
        {!mini && (
          <ellipse
            className="m-shadow"
            cx="60"
            cy="110"
            rx="30"
            ry="6"
            fill="#000"
          />
        )}
        <line
          x1="60"
          y1="30"
          x2="60"
          y2="17"
          stroke="#a3e635"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle className="m-ant" cx="60" cy="12" r="7" fill="#a3e635" />
        <rect x="18" y="30" width="84" height="72" rx="26" fill="#a3e635" />
        {/* >_< face */}
        <path
          d="M36 56 L47 65 L36 74"
          stroke="#0a0a0b"
          strokeWidth="6.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M84 56 L73 65 L84 74"
          stroke="#0a0a0b"
          strokeWidth="6.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="52"
          y1="86"
          x2="68"
          y2="86"
          stroke="#0a0a0b"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        {!mini && (
          <>
            <circle cx="33" cy="78" r="4" fill="#0a0a0b" opacity="0.14" />
            <circle cx="87" cy="78" r="4" fill="#0a0a0b" opacity="0.14" />
          </>
        )}
      </svg>
    </div>
  );
}
