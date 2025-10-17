import { useEffect, useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { usePages } from "@/hooks/usePages";
import type { Page } from "@/lib/storage";

type FormState = {
  title: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:mm (valfri)
  place: string;
  people: string;   // komma-separerat
  senses: {
    sight: string;
    sound: string;
    smell: string;
    taste: string;
    touch: string;
  };
  valence: number;  // -5..+5
  energy: number;   // 0..5
  clarity: "skarpt" | "dim";
  summary: string;  // kort berättelse
  tags: string;     // komma-separerat
  privacy: "open" | "lock" | "ritual-lock";
  hint: string;
};

const initialForm: FormState = {
  title: "",
  date: "",
  time: "",
  place: "",
  people: "",
  senses: { sight: "", sound: "", smell: "", taste: "", touch: "" },
  valence: 0,
  energy: 3,
  clarity: "skarpt",
  summary: "",
  tags: "",
  privacy: "open",
  hint: "",
};

export default function Minne() {
  const { pages, create, update, remove, exportOne, importOneFromText } = usePages("minne");
  const [form, setForm] = useState<FormState>(initialForm);
  const [editing, setEditing] = useState<Page | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  // När vi redigerar – mappa Page → FormState
  useEffect(() => {
    if (!editing) return;
    const p = (editing.props ?? {}) as any;
    setForm({
      title: editing.title ?? "",
      date: p.date ?? "",
      time: p.time ?? "",
      place: p.place?.name ?? "",
      people: (p.people ?? []).join(", "),
      senses: {
        sight: p.senses?.sight ?? "",
        sound: p.senses?.sound ?? "",
        smell: p.senses?.smell ?? "",
        taste: p.senses?.taste ?? "",
        touch: p.senses?.touch ?? "",
      },
      valence: typeof p.valence === "number" ? p.valence : 0,
      energy: typeof p.energy === "number" ? p.energy : 3,
      clarity: (p.clarity as FormState["clarity"]) ?? "skarpt",
      summary: p.summary ?? "",
      tags: (editing.tags ?? []).join(", "),
      privacy: (editing.privacy?.mode as FormState["privacy"]) ?? "open",
      hint: editing.privacy?.hint ?? "",
    });
  }, [editing]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Partial<Page> = {
      title: form.title || form.summary || "Minne",
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      props: {
        date: form.date || null,
        time: form.time || null,
        place: form.place ? { name: form.place } : null,
        people: form.people
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        senses: form.senses,
        valence: Number(form.valence),
        energy: Number(form.energy),
        clarity: form.clarity,
        summary: form.summary,
      },
      privacy: { mode: form.privacy, hint: form.hint || undefined },
    };

    if (editing) {
      update(editing.id, payload);
    } else {
      create({ kind: "minne", ...payload });
    }
    setEditing(null);
    setForm(initialForm);
  }

  const startEdit = (p: Page) => setEditing(p);
  const cancelEdit = () => { setEditing(null); setForm(initialForm); };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    importOneFromText(text);
    e.currentTarget.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Minne</h2>
          <p className="meta">Fånga ett minne med detaljer. Allt sparas lokalt per post.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setEditing(null)}>Ny</button>

          {/* Import */}
          <input ref={importRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
          <button className="btn-outline" onClick={() => importRef.current?.click()}>Importera (JSON)</button>
        </div>
      </header>

      {/* Lista */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-3">Dina minnen</h3>
        {pages.length === 0 ? (
          <EmptyState title="Inga minnen ännu" hint="Skapa ditt första via Ny-knappen." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => {
              const props = (p.props ?? {}) as any;
              return (
                <li key={p.id} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium line-clamp-1">{p.title || "(utan titel)"}</div>
                      <div className="meta">
                        {props.date ?? "—"} • {props.place?.name ?? "—"} • {new Date(p.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(p.tags) && p.tags.slice(0, 4).map((t) => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                    <span className="badge">{props.clarity ?? "—"}</span>
                    <span className="badge">valens: {typeof props.valence === "number" ? props.valence : "—"}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-outline" onClick={() => startEdit(p)}>Redigera</button>
                    <button
                      className="btn-outline"
                      onClick={() =>
                        exportOne(p.id, `${(p.title || "minne").replace(/\s+/g, "_").toLowerCase()}.json`)
                      }
                    >
                      Exportera
                    </button>
                    <button className="btn-outline" onClick={() => remove(p.id)}>Ta bort</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Formulär */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium">{editing ? "Redigera minne" : "Nytt minne"}</h3>
        <p className="meta mb-3">Börja kort – du kan alltid fördjupa i dagboken sen.</p>

        <form className="grid gap-4 max-w-2xl" onSubmit={onSubmit}>
          {/* Titel */}
          <label className="grid gap-1">
            <span className="label">Titel</span>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Caféet vid stationen"
            />
          </label>

          {/* Datum/Tid */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Datum (ungefär funkar)</span>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="label">Tid (valfri)</span>
              <input
                type="time"
                className="input"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </label>
          </div>

          {/* Plats/Personer */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Plats</span>
              <input
                className="input"
                value={form.place}
                onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
                placeholder="Namn eller beskrivning"
              />
            </label>
            <label className="grid gap-1">
              <span className="label">Personer (komma-separerat)</span>
              <input
                className="input"
                value={form.people}
                onChange={(e) => setForm((f) => ({ ...f, people: e.target.value }))}
                placeholder="Mormor, …"
              />
            </label>
          </div>

          {/* Sinneintryck */}
          <fieldset className="grid gap-2">
            <legend className="label">Sinneintryck</legend>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="input"
                value={form.senses.sight}
                onChange={(e) => setForm((f) => ({ ...f, senses: { ...f.senses, sight: e.target.value } }))}
                placeholder="Syn – t.ex. vårsol"
              />
              <input
                className="input"
                value={form.senses.sound}
                onChange={(e) => setForm((f) => ({ ...f, senses: { ...f.senses, sound: e.target.value } }))}
                placeholder="Ljud – t.ex. tåg"
              />
              <input
                className="input"
                value={form.senses.smell}
                onChange={(e) => setForm((f) => ({ ...f, senses: { ...f.senses, smell: e.target.value } }))}
                placeholder="Doft – t.ex. kaffe"
              />
              <input
                className="input"
                value={form.senses.taste}
                onChange={(e) => setForm((f) => ({ ...f, senses: { ...f.senses, taste: e.target.value } }))}
                placeholder="Smak – t.ex. kanel"
              />
              <input
                className="input md:col-span-2"
                value={form.senses.touch}
                onChange={(e) => setForm((f) => ({ ...f, senses: { ...f.senses, touch: e.target.value } }))}
                placeholder="Känsel – t.ex. kall kopp"
              />
            </div>
          </fieldset>

          {/* Valens/Energi/Klarhet */}
          <div className="grid md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="label">Valens (-5…+5)</span>
              <input
                type="number"
                min={-5}
                max={5}
                className="input"
                value={form.valence}
                onChange={(e) => setForm((f) => ({ ...f, valence: parseInt(e.target.value || "0", 10) }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="label">Energi (0–5)</span>
              <input
                type="number"
                min={0}
                max={5}
                className="input"
                value={form.energy}
                onChange={(e) => setForm((f) => ({ ...f, energy: parseInt(e.target.value || "0", 10) }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="label">Klarhet</span>
              <select
                className="input"
                value={form.clarity}
                onChange={(e) => setForm((f) => ({ ...f, clarity: e.target.value as FormState["clarity"] }))}
              >
                <option value="skarpt">skarpt</option>
                <option value="dim">dim</option>
              </select>
            </label>
          </div>

          {/* Kort berättelse */}
          <label className="grid gap-1">
            <span className="label">Kort berättelse</span>
            <textarea
              className="textarea"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="Vi satt vid fönstret, solen låg lågt…"
            />
          </label>

          {/* Taggar + Sekretess */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Taggar (komma-separerat)</span>
              <input
                className="input"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="vår, resa, …"
              />
            </label>
            <label className="grid gap-1">
              <span className="label">Sekretess</span>
              <select
                className="input"
                value={form.privacy}
                onChange={(e) => setForm((f) => ({ ...f, privacy: e.target.value as FormState["privacy"] }))}
              >
                <option value="open">open</option>
                <option value="lock">lock</option>
                <option value="ritual-lock">ritual-lock</option>
              </select>
            </label>
          </div>

          {/* Hint */}
          <label className="grid gap-1">
            <span className="label">Lösenfras-hint (om låst)</span>
            <input
              className="input"
              value={form.hint}
              onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
              placeholder="t.ex. ‘Tänd ljuset’"
            />
          </label>

          {/* Actions */}
          <div className="divider my-1"></div>
          <div className="flex items-center justify-end gap-2">
            {editing && (
              <button type="button" className="btn-outline" onClick={cancelEdit}>
                Avbryt
              </button>
            )}
            <button className="btn-accent">{editing ? "Spara ändringar" : "Spara"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}