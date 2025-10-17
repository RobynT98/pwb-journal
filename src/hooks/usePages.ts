import { useEffect, useMemo, useState } from "react";
import type { Kind, Page } from "@/lib/storage";
import {
  list as storageList,
  create as storageCreate,
  update as storageUpdate,
  remove as storageRemove,
  subscribe as storageSubscribe,
  exportPageJSON,
  importPageJSON,
  downloadBlob,
} from "@/lib/storage";

/**
 * usePages – React-hook för att läsa/uppdatera sidor ur lagringen.
 * Byter backend enkelt senare (Tauri/SQLite) utan att ändra vyerna.
 */
export function usePages(kind?: Kind) {
  const [pages, setPages] = useState<Page[]>(() => storageList(kind));

  useEffect(() => {
    setPages(storageList(kind));
    const unsub = storageSubscribe(() => setPages(storageList(kind)));
    return unsub;
  }, [kind]);

  const api = useMemo(() => {
    return {
      create: (partial: Partial<Page> & { kind: Kind }) => storageCreate(partial),
      update: (id: string, patch: Partial<Page>) => storageUpdate(id, patch),
      remove: (id: string) => storageRemove(id),
      exportOne: (id: string, filename?: string) => {
        const blob = exportPageJSON(id);
        if (!blob) return;
        downloadBlob(blob, filename ?? `${id}.json`);
      },
      importOneFromText: (jsonText: string) => importPageJSON(jsonText),
    };
  }, []);

  return { pages, ...api };
}