// Lokal lagring i localStorage

export type PageKind = "sorg" | "minne" | "bearbetning" | "journal";

export type Page = {
  id: string;
  kind: PageKind;
  title?: string | null;
  tags?: string[];
  props?: Record<string, any> | null;
  /** Fri editor-innehåll – används av Journal */
  blocks?: any[];
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
    return normalize(arr as Page[]);
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

export function uid(prefix = "pg") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* ---------------- helpers ---------------- */

function normalize(arr: Page[]): Page[] {
  return arr
    .filter(Boolean)
    .map((p) => ({
      id: p.id ?? uid(),
      kind: p.kind,
      title: p.title ?? null,
      tags: Array.isArray(p.tags) ? p.tags : [],
      props: p.props ?? {},
      blocks: Array.isArray(p.blocks) ? p.blocks : [],
      privacy: p.privacy ?? { mode: "open" },
      createdAt: p.createdAt ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? p.createdAt ?? new Date().toISOString(),
    }));
}