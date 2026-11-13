import { useEffect } from "react";
import { BRAND } from "../brand";

export function useTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — ${BRAND.name} Beauty` : `${BRAND.name} Beauty`;
    return () => { document.title = prev; };
  }, [title]);
}
