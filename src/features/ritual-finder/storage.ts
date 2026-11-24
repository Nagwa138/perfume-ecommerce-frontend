import type { RitualAnswers } from "./questions";

const KEY = "h-store.ritual.v1";
const TTL_DAYS = 30;

export type StoredRitual = {
  answers:     RitualAnswers;
  resultIds:   number[];
  completedAt: string;
};

export function saveRitual(data: StoredRitual): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing — silent fail
  }
}

export function loadRitual(): StoredRitual | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredRitual;
    const age = Date.now() - new Date(data.completedAt).getTime();
    if (age > TTL_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearRitual(): void {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}
