import { useEffect, useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { usePages } from "@/hooks/usePages";
import type { Page } from "@/lib/storage";

type FormState = {
  lossType: string;
  subject: string;
  dateEvent: string;
  dateAnniv: string;
  intensity: number;
  summary: string;
  privacy: "open" | "lock" | "ritual-lock";
  hint: string;
};

const initialForm: FormState = {
  lossType: "person",
  subject: "",
  dateEvent: "",
  dateAnniv: "",
  intensity: 5,
  summary: "",
  privacy: "open",
  hint: "",
};

export default function Sorg() {
  const { pages, create, update, remove, exportOne, importOneFromText } = usePages("sorg");
  const [form, setForm] = useState<FormState>(initialForm);
  const [editing, setEditing] = useState<Page | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) return;
    // mappa in props → form
    const p = (editing.props ?? {}) as any;
    setForm({
      lossType: p.lossType ?? "person",
      subject: p.subject ?? "",
      dateEvent: p.dates?.event ?? "",
      dateAnniv: p.dates?.anniversary ?? "",
      intensity: typeof p.intensity === "number" ? p.intensity : 5,
      summary: editing.title ?? "",
      privacy: (editing.privacy?.mode as FormState["privacy"]) ?? "open",
      hint: editing.privacy?.hint ?? "",
    });
  }, [editing]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Partial<Page> = {
      title: form.summary,
      props: {
        lossType: form.lossType,
        subject: form.subject,
        dates: { event: form.dateEvent || null, anniversary: form.dateAnniv || null },
        intensity: form.intensity,
      },
      privacy: { mode: form.privacy, hint: form.hint || undefined },
    };

    if (editing) {
      update(editing.id, payload);
    } else {
      create({ kind: "sorg", ...payload });
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
          <h2 className="text-2xl font-semibold tracking-tight">Sorg</h2>
          <p className="meta">Strukturerat formulär som sparar lokalt. Export/Import per post (JSON).</p>
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
        <h3 className="font-medium mb-3">Dina poster</h3>
        {pages.length === 0 ? (
          <EmptyState title="Inga poster ännu" hint="Skapa din första via Ny-knappen." />
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
                        {props.lossType ?? "—"} • {props.dates?.event ?? "—"} • {new Date(p.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge">{props.lossType ?? "okänd"}</span>
                    <span className="badge">{p.privacy?.mode ?? "open"}</span>
                    {props.subject && <span className="badge">{props.subject}</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-outline" onClick={() => startEdit(p)}>Redigera</button>
                    <button
                      className="btn-outline"
                      onClick={() => exportOne(p.id, `${(p.title || "sorg").replace(/\s+/g, "_").toLowerCase()}.json`)}
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
        <h3 className="font-medium">{editing ? "Redigera sorg-post" : "Ny sorg-post"}</h3>
        <p className="meta mb-3">Fyll i det du vill nu. Allt kan ändras senare.</p>

        <form className="grid gap-4 max-w-2xl" onSubmit={onSubmit}>
          {/* Typ + Subjekt */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Typ av förlust</span>
              <select
                className="input"
                value={form.lossType}
                onChange={(e) => setForm((f) => ({ ...f, lossType: e.target.value }))}
              >
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
              <input
                className="input"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Namn eller beskrivning"
              />
            </label>
          </div>

          {/* Datum */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Händelsedatum</span>
              <input
                type="date"
                className="input"
                value={form.dateEvent}
                onChange={(e) => setForm((f) => ({ ...f, dateEvent: e.target.value }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="label">Årsdag (valfri)</span>
              <input
                type="date"
                className="input"
                value={form.dateAnniv}
                onChange={(e) => setForm((f) => ({ ...f, dateAnniv: e.target.value }))}
              />
            </label>
          </div>

          {/* Intensitet */}
          <div className="grid gap-2">
            <span className="label">Intensitet idag</span>
            <input
              type="range"
              min={0}
              max={10}
              value={form.intensity}
              onChange={(e) => setForm((f) => ({ ...f, intensity: parseInt(e.target.value) }))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex gap-2">
              <span className="badge">intensitet: {form.intensity}</span>
            </div>
          </div>

          {/* Sekretess */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Sekretess</span>
              <select
                className="input"
                value={form.privacy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, privacy: e.target.value as FormState["privacy"] }))
                }
              >
                <option value="open">open</option>
                <option value="lock">lock</option>
                <option value="ritual-lock">ritual-lock</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label">Lösenfras-hint (om låst)</span>
              <input
                className="input"
                value={form.hint}
                onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
                placeholder="t.ex. ‘Tänd ljuset’"
              />
            </label>
          </div>

          {/* Sammanfattning */}
          <label className="grid gap-1">
            <span className="label">Kort sammanfattning (titel)</span>
            <textarea
              className="textarea"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="En eller två meningar…"
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