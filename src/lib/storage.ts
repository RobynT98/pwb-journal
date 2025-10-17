/* -------------------------------------------
 * PWB-Journal – lokal lagringsadapter (v1)
 * Implementation: localStorage (byts lätt mot Tauri/SQLite senare)
 * ------------------------------------------- */

export type Kind = "sorg" | "minne" | "bearbetning" | "journal";
export type PrivacyMode = "open" | "lock" | "ritual-lock";

export type Page = {
  id: string;
  kind: Kind;
  title?: string;
  props?: Record<string, unknown>; // rums-specifika fält (sorg/minne/bearbetning)
  tags?: string[];
  privacy?: { mode: PrivacyMode; hint?: string };
  blocks?: unknown[]; // används av journal (fri-editor)
  createdAt: string;  // ISO
  updatedAt: string;  // ISO
};

const KEY = "pwb:pages:v1";

/* --------- Intern hjälp --------- */
function nowISO() {
  return new Date().toISOString();
}
function uuid() {
  return crypto.randomUUID();
}

/* --------- Pub/Sub (superenkel) --------- */
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* --------- Låg-nivå I/O --------- */
export function loadAll(): Page[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: Page[] = raw ? JSON.parse(raw) : [];
    // sanity: sortera på updatedAt desc
    return arr.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  } catch {
    return [];
  }
}

function saveAll(pages: Page[]) {
  localStorage.setItem(KEY, JSON.stringify(pages));
  notify();
}

/* --------- API: Läsning --------- */
export function list(kind?: Kind): Page[] {
  const all = loadAll();
  return kind ? all.filter((p) => p.kind === kind) : all;
}

export function get(id: string): Page | undefined {
  return loadAll().find((p) => p.id === id);
}

/* --------- API: Skrivning --------- */
export function create(partial: Partial<Page> & { kind: Kind }): Page {
  const now = nowISO();
  const page: Page = {
    id: uuid(),
    kind: partial.kind,
    title: partial.title ?? "",
    props: partial.props ?? {},
    tags: partial.tags ?? [],
    privacy: partial.privacy ?? { mode: "open" },
    blocks: partial.blocks ?? [],
    createdAt: now,
    updatedAt: now,
  };
  const pages = loadAll();
  pages.unshift(page);
  saveAll(pages);
  return page;
}

export function update(id: string, patch: Partial<Page>): Page | undefined {
  const pages = loadAll();
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const updated: Page = {
    ...pages[idx],
    ...patch,
    // slå ihop fält som ofta patchas
    props: { ...(pages[idx].props ?? {}), ...(patch.props ?? {}) },
    tags: patch.tags ?? pages[idx].tags,
    blocks: patch.blocks ?? pages[idx].blocks,
    updatedAt: nowISO(),
  };
  pages[idx] = updated;
  saveAll(pages);
  return updated;
}

export function remove(id: string): boolean {
  const pages = loadAll();
  const next = pages.filter((p) => p.id !== id);
  if (next.length === pages.length) return false;
  saveAll(next);
  return true;
}

export function clearAll() {
  saveAll([]);
}

/* --------- Export/Import (enkel v1) --------- */

/** Exportera EN sida som JSON-blob */
export function exportPageJSON(id: string): Blob | undefined {
  const page = get(id);
  if (!page) return undefined;
  return new Blob([JSON.stringify(page, null, 2)], {
    type: "application/json;charset=utf-8",
  });
}

/** Ladda in EN sida från JSON-text (returnerar Page om ok) */
export function importPageJSON(jsonText: string): Page | undefined {
  try {
    const data = JSON.parse(jsonText) as Page;
    // enkel validering
    if (!data || typeof data !== "object") return undefined;
    if (!data.kind) return undefined;
    // ny id & tider så vi inte krockar
    const now = nowISO();
    const page: Page = {
      ...data,
      id: uuid(),
      createdAt: data.createdAt ?? now,
      updatedAt: now,
    };
    const pages = loadAll();
    pages.unshift(page);
    saveAll(pages);
    return page;
  } catch {
    return undefined;
  }
}

/* --------- Hjälp för nedladdning i UI --------- */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}