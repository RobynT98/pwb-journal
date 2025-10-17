import { useState } from "react";
import EmptyState from "@/components/EmptyState";

export default function Minne() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Minne</h2>
          <p className="meta">Fånga ett minne – sen kan du utveckla det fritt i dagboken.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setShowForm(true)}>Ny</button>
          <button className="btn-outline">Import</button>
          <button className="btn-accent">Export</button>
        </div>
      </header>

      {/* Lista (tom tills lagring kopplas) */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Dina minnen</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="badge">positiv</span>
          <span className="badge">neutral</span>
          <span className="badge">utmanande</span>
          <span className="badge">skarpt</span>
          <span className="badge">dim</span>
        </div>
        <EmptyState title="Inga minnen ännu" hint="Skapa ditt första via Ny-knappen." />
      </section>

      {/* Formulär (stub) */}
      {showForm && (
        <section className="card-paper p-4 lift">
          <h3 className="font-medium">Nytt minne</h3>
          <p className="meta mb-3">Börja kort; lägg till detaljer senare.</p>

          <form
            className="grid gap-4 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Sparstub – kopplas till lagring senare.");
            }}
          >
            {/* Titel + datum/tid */}
            <label className="grid gap-1">
              <span className="label">Titel</span>
              <input className="input" placeholder="Caféet vid stationen" />
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Datum (ungefär går bra)</span>
                <input type="date" className="input" />
              </label>
              <label className="grid gap-1">
                <span className="label">Tid (valfri)</span>
                <input type="time" className="input" />
              </label>
            </div>

            {/* Plats + personer */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Plats</span>
                <input className="input" placeholder="Namn eller beskrivning av platsen" />
              </label>
              <label className="grid gap-1">
                <span className="label">Personer (komma-separerat)</span>
                <input className="input" placeholder="Mormor, …" />
              </label>
            </div>

            {/* Sinneintryck */}
            <fieldset className="grid gap-2">
              <legend className="label">Sinneintryck</legend>
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input" placeholder="Syn – t.ex. vårsol" />
                <input className="input" placeholder="Ljud – t.ex. tåg" />
                <input className="input" placeholder="Doft – t.ex. kaffe" />
                <input className="input" placeholder="Smak – t.ex. kanel" />
                <input className="input md:col-span-2" placeholder="Känsel – t.ex. kall kopp i handen" />
              </div>
            </fieldset>

            {/* Valens / energi / klarhet */}
            <div className="grid md:grid-cols-3 gap-4">
              <label className="grid gap-1">
                <span className="label">Valens (-5…+5)</span>
                <input type="number" min={-5} max={5} className="input" defaultValue={0} />
              </label>
              <label className="grid gap-1">
                <span className="label">Energi (0–5)</span>
                <input type="number" min={0} max={5} className="input" defaultValue={3} />
              </label>
              <label className="grid gap-1">
                <span className="label">Klarhet</span>
                <select className="input">
                  <option>skarpt</option>
                  <option>dim</option>
                </select>
              </label>
            </div>

            {/* Sammanfattning */}
            <label className="grid gap-1">
              <span className="label">Kort berättelse</span>
              <textarea className="textarea" placeholder="Vi satt vid fönstret, solen låg lågt…"></textarea>
            </label>

            {/* Taggar + sekretess */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="label">Taggar (komma-separerat)</span>
                <input className="input" placeholder="vår, resa, …" />
              </label>
              <label className="grid gap-1">
                <span className="label">Sekretess</span>
                <select className="input">
                  <option>open</option>
                  <option>lock</option>
                  <option>ritual-lock</option>
                </select>
              </label>
            </div>

            {/* Bilagor – kommer senare i UI (bild/ljud/video) */}

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