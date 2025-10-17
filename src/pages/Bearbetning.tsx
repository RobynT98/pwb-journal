import { useState } from "react";
import EmptyState from "@/components/EmptyState";

export default function Bearbetning() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Bearbetning</h2>
          <p className="meta">
            Övningar och verktyg för att möta, släppa, skriva om. 
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setShowForm(true)}>
            Ny övning
          </button>
          <button className="btn-outline">Import</button>
          <button className="btn-accent">Export</button>
        </div>
      </header>

      {/* Lista (tom) */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Övningar</h3>
        <EmptyState
          title="Inga övningar ännu"
          hint="När du skapar en övning visas den här."
        />
      </section>

      {/* Formulär (stub) */}
      {showForm && (
        <section className="card-paper p-4 lift">
          <h3 className="font-medium">Ny övning</h3>
          <p className="meta mb-3">Allt sparas lokalt senare. Nu är det bara utseendet.</p>

          <form
            className="grid gap-4 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Sparstub – kopplas till lagring senare.");
            }}
          >
            {/* Övningstyp */}
            <label className="grid gap-1">
              <span className="label">Övningstyp</span>
              <select className="input">
                <option>Brev som inte skickas</option>
                <option>Dialog med dåtids-jag</option>
                <option>ABC-omramning</option>
                <option>Värderingskompass</option>
                <option>Grounding 5-4-3-2-1</option>
                <option>Kroppskarta</option>
              </select>
            </label>

            {/* Syfte + fokus */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Syfte</span>
                <input
                  className="input"
                  placeholder="t.ex. att förstå en reaktion"
                />
              </label>
              <label className="grid gap-1">
                <span className="label">Fokusområde</span>
                <input
                  className="input"
                  placeholder="relation, kropp, skuld, saknad…"
                />
              </label>
            </div>

            {/* Textarea för övningens innehåll */}
            <label className="grid gap-1">
              <span className="label">Instruktioner / text</span>
              <textarea
                className="textarea"
                placeholder="Här kan du skriva instruktionerna, frågorna, eller bara dina tankar."
              ></textarea>
            </label>

            {/* Nivå & status */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Svårighetsnivå</span>
                <select className="input">
                  <option>låg</option>
                  <option>medel</option>
                  <option>hög</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="label">Status</span>
                <select className="input">
                  <option>pågående</option>
                  <option>avslutad</option>
                  <option>arkiverad</option>
                </select>
              </label>
            </div>

            {/* Känsla före/efter */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Känsla före (0–10)</span>
                <input type="number" min={0} max={10} className="input" />
              </label>
              <label className="grid gap-1">
                <span className="label">Känsla efter (0–10)</span>
                <input type="number" min={0} max={10} className="input" />
              </label>
            </div>

            {/* Datum */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Startdatum</span>
                <input type="date" className="input" />
              </label>
              <label className="grid gap-1">
                <span className="label">Avslutdatum</span>
                <input type="date" className="input" />
              </label>
            </div>

            {/* Kommentar */}
            <label className="grid gap-1">
              <span className="label">Reflektion</span>
              <textarea
                className="textarea"
                placeholder="Vad lärde du dig? Hur känns det nu?"
              ></textarea>
            </label>

            {/* Actions */}
            <div className="divider my-1"></div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowForm(false)}
              >
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