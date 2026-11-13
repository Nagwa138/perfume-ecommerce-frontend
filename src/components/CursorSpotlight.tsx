import { useEffect, useRef } from "react";

export default function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const el = ref.current;
    if (!el) return;
    el.style.display = "block";
    const move = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9996,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "var(--h-accent)",
        opacity: 0.045,
        filter: "blur(90px)",
        willChange: "transform",
      }}
    />
  );
}
