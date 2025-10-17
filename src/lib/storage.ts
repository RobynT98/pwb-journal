// Enkel, stabil lagring i localStorage. Används av usePages-hooken.

export type PageKind = "sorg" | "minne" | "bearbetning" | "journal";

export type Page = {
  id: string;
  kind: PageKind;
  title?: string | null;
  tags?: string[];
  props?: Record<string, any> | null;
  privacy?: { mode: "open" | "lock" | "ritual-lock"; hint?: string };
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export const STORE_KEY = "pwb:pages:v1";

export function loadPages(): Page[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as Page[];
  } catch {
    return [];
  }
}

export function savePages(pages: Page[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(pages));
}

export function clearAll() {
  localStorage.removeItem(STORE_KEY);
}

export function uid(prefix = "p") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}