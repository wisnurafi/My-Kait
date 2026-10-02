/**
 * HookLogo — brand mark for My Kait.
 * Lime rounded square with the >_< kaomoji face.
 * Replaces the old hook glyph.
 */

export function HookLogo({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(6, Math.round(size * 0.27)),
        background: "var(--accent-primary)",
        color: "#0a0a0b",
        display: "inline-grid",
        placeItems: "center",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        fontSize: Math.round(size * 0.34),
        letterSpacing: "-0.05em",
        lineHeight: 1,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      &gt;_&lt;
    </span>
  );
}
