import { useState } from "react";
import EmptyState from "@/components/EmptyState";

export default function Sorg() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sorg</h2>
          <p className="meta">Strukturerat formulär + fri redigering (kommer sen).</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setShowForm(true)}>Ny</button>
          <button className="btn-outline">Import</button>
          <button className="btn-accent">Export</button>
        </div>
      </header>

      {/* Lista (tom tills vi kopplar lagring) */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Dina poster</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="badge">person</span>
          <span className="badge">djur</span>
          <span className="badge">relation</span>
          <span className="badge">plats</span>
          <span className="badge">hälsa</span>
        </div>
        <EmptyState title="Inga poster ännu" hint="Skapa din första via Ny-knappen." />
      </section>

      {/* Formulär (stub) */}
      {showForm && (
        <section className="card-paper p-4 lift">
          <h3 className="font-medium">Ny sorg-post</h3>
          <p className="meta mb-3">Fyll i det du vill nu. Allt kan ändras senare.</p>

          <form
            className="grid gap-4 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Sparstub – kopplas till lagring senare.");
            }}
          >
            {/* Typ + Subjekt */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Typ av förlust</span>
                <select className="input">
                  <option>person</option>
                  <option>djur</option>
                  <option>relation</option>
                  <option>plats</option>
                  <option>hälsa</option>
                  <option>annat</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="label">Vem/Vad</span>
                <input className="input" placeholder="Namn eller beskrivning" />
              </label>
            </div>

            {/* Datum */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Händelsedatum</span>
                <input type="date" className="input" />
              </label>
              <label className="grid gap-1">
                <span className="label">Årsdag (valfri)</span>
                <input type="date" className="input" />
              </label>
            </div>

            {/* Intensitet */}
            <div className="grid gap-2">
              <span className="label">Intensitet idag</span>
              <input type="range" min={0} max={10} defaultValue={6} className="w-full accent-[var(--accent)]" />
              <div className="flex gap-2">
                <span className="badge">saknad: —</span>
                <span className="badge">vrede: —</span>
                <span className="badge">skuld: —</span>
                <span className="badge">tacksamhet: —</span>
              </div>
            </div>

            {/* Kropp & triggers */}
            <div className="grid md:grid-cols-2 gap-4">
              <fieldset className="grid gap-2">
                <legend className="label">Kroppskänsla</legend>
                <div className="grid grid-cols-2 gap-2">
                  {["hjärta", "bröst", "mage", "käkar", "sömn", "aptit"].map((k) => (
                    <label key={k} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" /> <span className="text-sm">{k}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="grid gap-1">
                <span className="label">Triggers (komma-separerat)</span>
                <input className="input" placeholder="åska, badrum, datum, doft…" />
              </label>
            </div>

            {/* Stöd & ritual */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Stöd just nu</span>
                <input className="input" placeholder="Skriva, vila, ringa vän…" />
              </label>

              <label className="grid gap-1">
                <span className="label">Ritual</span>
                <select className="input">
                  <option>inget</option>
                  <option>tänd ljus</option>
                  <option>brev som inte skickas</option>
                  <option>andning 4-7-8</option>
                </select>
              </label>
            </div>

            {/* Sekretess */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Sekretess</span>
                <select className="input">
                  <option>open</option>
                  <option>lock</option>
                  <option>ritual-lock</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="label">Lösenfras-hint (om låst)</span>
                <input className="input" placeholder="t.ex. ‘Tänd ljuset’" />
              </label>
            </div>

            {/* Sammanfattning */}
            <label className="grid gap-1">
              <span className="label">Kort sammanfattning</span>
              <textarea className="textarea" placeholder="En eller två meningar…"></textarea>
            </label>

            {/* Actions */}
            <div className="divider my-1"></div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
                Avbryt
              </button>
              <button className="btn-accent">Spara (stub)</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}