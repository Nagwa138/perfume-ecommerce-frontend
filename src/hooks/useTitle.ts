import { useEffect } from "react";

export function useTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — NOVA WEAR` : "NOVA WEAR";
    return () => { document.title = prev; };
  }, [title]);
}
