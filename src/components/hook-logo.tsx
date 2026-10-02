/**
 * Hook mascot logo — the brand symbol for My Kait.
 * Brutalist hook shape. Thick black stroke. No decoration.
 * Pure SVG, structural, no tilt.
 */

export function HookLogo({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hook shape — thick black stroke */}
      <path
        d="M50 8 C50 8, 50 30, 50 55 C50 70, 40 78, 30 75 C20 72, 18 62, 25 55"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="square"
        fill="none"
      />
      {/* Eye / square block on top */}
      <rect x="42" y="2" width="16" height="16" fill="currentColor" />
      {/* Barb */}
      <path
        d="M25 55 C25 55, 22 48, 28 45"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}
