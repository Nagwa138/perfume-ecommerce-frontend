/**
 * H STORE wordmark — text placeholder.
 * To use a real logo: add public/brand/logo.svg (light-bg) and
 * public/brand/logo-inv.svg (dark-bg), then swap the spans below for:
 *   <img src={variant === "light" ? "/brand/logo-inv.svg" : "/brand/logo.svg"}
 *        alt="H STORE" className={`h-[1em] w-auto ${className}`} />
 */

interface LogoProps {
  /** "dark" = wordmark on a light background (default).
   *  "light" = wordmark on a dark/coloured background. */
  variant?: "dark" | "light";
  className?: string;
}

export default function Logo({ variant = "dark", className = "" }: LogoProps) {
  const hColor   = variant === "light" ? "var(--color-highlight)" : "var(--color-accent)";
  const txtColor = variant === "light" ? "#ffffff"                : "var(--color-ink)";

  return (
    <span
      aria-label="H STORE"
      className={`inline-flex items-baseline select-none ${className}`}
      style={{ gap: "0.12em" }}
    >
      {/* The mark */}
      <span
        className="font-sans font-black leading-none tracking-tight"
        style={{ color: hColor }}
      >
        H
      </span>
      {/* The descriptor */}
      <span
        className="font-sans font-semibold tracking-[0.28em] leading-none"
        style={{ fontSize: "0.68em", color: txtColor }}
      >
        STORE
      </span>
    </span>
  );
}
