import { useMemo, useRef, useState } from "react";
import { usePages } from "@/hooks/usePages";

type Kind = "sorg" | "minne" | "bearbetning" | "journal";

export default function ImportExport() {
  const { pages, importOneFromText } = usePages(); // alla typer
  const [selectedKinds, setSelectedKinds] = useState<Record<Kind, boolean>>({
    sorg: true, minne: true, bearbetning: true, journal: true
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const importRef = useRef<HTMLInputElement | null>(null);

  // Statistik per typ
  const stats = useMemo(() => {
    const byKind: Record<Kind, number> = { sorg: 0, minne: 0, bearbetning: 0, journal: 0 };
    for (const p of pages) byKind[p.kind as Kind] += 1;
    return byKind;
  }, [pages]);

  // Filtrering (visuellt – ingen riktig export här än)
  const filteredCount = useMemo(() => {
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
    const toMs = dateTo ? new Date(dateTo).getTime() + 24 * 3600 * 1000 : Infinity;
    return pages.filter(p =>
      selectedKinds[p.kind as Kind] &&
      new Date(p.updatedAt).getTime() >= fromMs &&
      new Date(p.updatedAt).getTime() <= toMs
    ).length;
  }, [pages, selectedKinds, dateFrom, dateTo]);

  const downloadStub = (label: string) => {
    alert(`${label} – funktion kommer snart.\n\nJust nu är detta bara layout.`);
  };

  const onImportClick = () => importRef.current?.click();

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    const ok = importOneFromText(txt);
    if (!ok) alert("Kunde inte läsa filen. Kontrollera att det är en JSON-export av en sida.");
    e.currentTarget.value = "";
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Export / Import</h2>
          <p className="meta">Ta ut dina poster eller läs in dem igen. Allt sker lokalt.</p>
        </div>
      </header>

      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Översikt</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Sorg" value={stats.sorg} />
          <Stat label="Minne" value={stats.minne} />
          <Stat label="Bearbetning" value={stats.bearbetning} />
          <Stat label="Dagbok" value={stats.journal} />
        </div>
      </section>

      {/* EXPORT */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium">Exportera</h3>
        <p className="meta mb-3">Välj vilka rum och period du vill exportera. (ZIP + assets kommer.)</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Typer */}
          <fieldset className="grid gap-2">
            <legend className="label mb-1">Rum</legend>
            {(["sorg","minne","bearbetning","journal"] as Kind[]).map(k => (
              <label key={k} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedKinds[k]}
                  onChange={(e) => setSelectedKinds(s => ({ ...s, [k]: e.target.checked }))}
                />
                <span className="text-sm capitalize">{k}</span>
              </label>
            ))}
          </fieldset>

          {/* Datumintervall */}
          <div className="grid gap-2">
            <span className="label">Period (valfri)</span>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="input" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
              <input type="date" className="input" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
            </div>
            <p className="meta">Matchar på “senast uppdaterad”. Lämna tomt för allt.</p>
          </div>

          {/* Förhandsinfo */}
          <div className="grid gap-2">
            <span className="label">Urval</span>
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <div className="text-sm">Poster som matchar med ovan:</div>
              <div className="text-lg font-semibold">{filteredCount}</div>
            </div>
          </div>
        </div>

        <div className="divider my-4" />

        <div className="flex flex-wrap gap-2">
          <button className="btn-accent" onClick={() => downloadStub("Exportera som ZIP")}>
            Exportera som ZIP
          </button>
          <button className="btn-outline" onClick={() => downloadStub("Exportera som NDJSON")}>
            Exportera som NDJSON
          </button>
          <button className="btn-outline" onClick={() => downloadStub("Exportera som Markdown-paket")}>
            Exportera som Markdown
          </button>
        </div>
      </section>

      {/* IMPORT */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium">Importera</h3>
        <p className="meta mb-3">Läs in antingen en enskild JSON-post (från appen) eller ett paket senare.</p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            onChange={onImportFile}
            className="hidden"
          />
          <button className="btn-outline" onClick={onImportClick}>
            Importera en sida (JSON)
          </button>

          <button className="btn-outline" onClick={() => downloadStub("Importera från ZIP/NDJSON")}>
            Importera paket (ZIP/NDJSON)
          </button>
          <span className="meta">Dubbletter får ny ID; ändras inte i original.</span>
        </div>
      </section>

      {/* HJÄLP */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium">Format & säkerhet (kort)</h3>
        <ul className="list-disc pl-5 text-sm text-stone-700 space-y-1">
          <li><b>JSON (en sida):</b> 1 fil per post. Kan importeras direkt här.</li>
          <li><b>NDJSON (kommer):</b> 1 rad per post – lätt att batcha.</li>
          <li><b>ZIP (kommer):</b> mappar med JSON + bilagor (bilder/ljud).</li>
          <li><b>Kryptering (plan):</b> lokal lösenfras → krypterad ZIP.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}