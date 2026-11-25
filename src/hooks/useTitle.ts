import { useEffect } from "react";
import { BRAND } from "../brand";

export function useTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — ${BRAND.name}` : BRAND.name;
    return () => { document.title = prev; };
  }, [title]);
}
