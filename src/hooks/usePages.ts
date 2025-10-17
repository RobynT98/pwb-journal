import { useEffect, useMemo, useState } from "react";
import { loadPages, savePages, uid } from "@/lib/storage";
import type { Page, PageKind } from "@/lib/storage";

/**
 * usePages – hämta och manipulera poster. Allt lokalt i localStorage.
 * Om du skickar in ett "kind" filtreras listan direkt.
 */
export function usePages(kind?: PageKind) {
  // 🛑 FIX: loadPages() returnerar redan en ren, normaliserad array.
  // Vi tar bort det redundanta anropet till normalize() här.
  const [all, setAll] = useState<Page[]>(() => loadPages());

  // sortera nyast först varje gång listan ändras
  const pages = useMemo(() => {
    const list = [...all].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return kind ? list.filter((p) => p.kind === kind) : list;
  }, [all, kind]);

  // Spara vid förändring
  useEffect(() => {
    savePages(all);
  }, [all]);

  // Lyssna på andra flikar (defensivt)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "pwb:pages:v1") {
        // 🛑 FIX: Ladda bara om. Datan är redan ren.
        setAll(loadPages());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function create(p: Omit<Page, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    const now = new Date().toISOString();
    const page: Page = {
      id: p.id ?? uid("pg"),
      createdAt: now,
      updatedAt: now,
      ...p,
    };
    setAll((prev) => [page, ...prev]);
    return page.id;
  }

  function update(id: string, patch: Partial<Page>) {
    setAll((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch,
              // slå ihop delar som ofta skickas:
              tags: patch.tags ?? p.tags,
              props: patch.props ?? p.props,
              blocks: patch.blocks ?? p.blocks, // Lade till blocks här också
              privacy: patch.privacy ?? p.privacy,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  }

  function remove(id: string) {
    setAll((prev) => prev.filter((p) => p.id !== id));
  }

  // Exportera en post som JSON-fil
  function exportOne(id: string, filename = "page.json") {
    const page = all.find((p) => p.id === id);
    if (!page) return false;
    const blob = new Blob([JSON.stringify(page, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  }

  // Importera en enda post från JSON-text
  function importOneFromText(text: string) {
    try {
      const parsed = JSON.parse(text) as Partial<Page>;
      if (!parsed || typeof parsed !== "object") return false;
      // Minimal validering:
      const id = uid("pg");
      const now = new Date().toISOString();
      const page: Page = {
        id,
        kind: (parsed.kind as PageKind) ?? "journal",
        title: parsed.title ?? "(importerad)",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        props: parsed.props ?? {},
        blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [], // Lade till blocks
        privacy:
          parsed.privacy && typeof parsed.privacy === "object"
            ? (parsed.privacy as Page["privacy"])
            : { mode: "open" },
        createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : now,
        updatedAt: now,
      };
      setAll((prev) => [page, ...prev]);
      return true;
    } catch {
      return false;
    }
  }

  return { pages, create, update, remove, exportOne, importOneFromText };
}

// 🛑 FIX: Hela den privata "normalize"-funktionen är borttagen härifrån.
// Den finns (och behövs) bara i storage.ts.
