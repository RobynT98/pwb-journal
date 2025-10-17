import { useEffect, useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { usePages } from "@/hooks/usePages";
import type { Page } from "@/lib/storage";

type ExerciseType =
  | "brev"
  | "dialog-datidsjag"
  | "abc"
  | "varderingskompass"
  | "grounding-54321"
  | "kroppskarta";

type FormState = {
  exercise: ExerciseType;
  goal: string;
  focus: string;
  level: "låg" | "medel" | "hög";
  status: "pågående" | "avslutad" | "arkiverad";
  feelBefore: number; // 0..10
  feelAfter: number;  // 0..10
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  notes: string;
  privacy: "open" | "lock" | "ritual-lock";
  hint: string;
};

const initialForm: FormState = {
  exercise: "brev",
  goal: "",
  focus: "",
  level: "medel",
  status: "pågående",
  feelBefore: 5,
  feelAfter: 3,
  startDate: "",
  endDate: "",
  notes: "",
  privacy: "open",
  hint: "",
};

export default function Bearbetning() {
  const { pages, create, update, remove, exportOne, importOneFromText } = usePages("bearbetning");
  const [form, setForm] = useState<FormState>(initialForm);
  const [editing, setEditing] = useState<Page | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  // Ladda form från vald sida
  useEffect(() => {
    if (!editing) return;
    const p = (editing.props ?? {}) as any;
    setForm({
      exercise: (p.exercise as ExerciseType) ?? "brev",
      goal: p.goal ?? "",
      focus: p.focus ?? "",
      level: (p.level as FormState["level"]) ?? "medel",
      status: (p.status as FormState["status"]) ?? "pågående",
      feelBefore: typeof p.feelBefore === "number" ? p.feelBefore : 5,
      feelAfter: typeof p.feelAfter === "number" ? p.feelAfter : 3,
      startDate: p.startDate ?? "",
      endDate: p.endDate ?? "",
      notes: p.notes ?? "",
      privacy: (editing.privacy?.mode as FormState["privacy"]) ?? "open",
      hint: editing.privacy?.hint ?? "",
    });
  }, [editing]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const title = (() => {
      switch (form.exercise) {
        case "brev": return "Brev som inte skickas";
        case "dialog-datidsjag": return "Dialog med dåtids-jag";
        case "abc": return "ABC-omramning";
        case "varderingskompass": return "Värderingskompass";
        case "grounding-54321": return "Grounding 5-4-3-2-1";
        case "kroppskarta": return "Kroppskarta";
      }
    })();

    const payload: Partial<Page> = {
      title: `${title}${form.focus ? ` – ${form.focus}` : ""}`,
      props: {
        exercise: form.exercise,
        goal: form.goal,
        focus: form.focus,
        level: form.level,
        status: form.status,
        feelBefore: Number(form.feelBefore),
        feelAfter: Number(form.feelAfter),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        notes: form.notes,
      },
      privacy: { mode: form.privacy, hint: form.hint || undefined },
    };

    if (editing) {
      update(editing.id, payload);
    } else {
      create({ kind: "bearbetning", ...payload });
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
          <h2 className="text-2xl font-semibold tracking-tight">Bearbetning</h2>
          <p className="meta">Övningar du kan återkomma till. Allt sparas lokalt.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => setEditing(null)}>Ny övning</button>

          {/* Import */}
          <input ref={importRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
          <button className="btn-outline" onClick={() => importRef.current?.click()}>Importera (JSON)</button>
        </div>
      </header>

      {/* Lista */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-3">Dina övningar</h3>
        {pages.length === 0 ? (
          <EmptyState title="Inga övningar ännu" hint="Skapa din första via Ny övning." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => {
              const props = (p.props ?? {}) as any;
              return (
                <li key={p.id} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
                  <div className="font-medium line-clamp-1">{p.title || "(utan titel)"}</div>
                  <div className="meta">
                    {props.status ?? "—"} • före {props.feelBefore ?? "—"}/10 → efter {props.feelAfter ?? "—"}/10 • {new Date(p.updatedAt).toLocaleString()}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge">{props.exercise ?? "övning"}</span>
                    <span className="badge">{props.level ?? "nivå"}</span>
                    <span className="badge">{p.privacy?.mode ?? "open"}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-outline" onClick={() => startEdit(p)}>Redigera</button>
                    <button
                      className="btn-outline"
                      onClick={() =>
                        exportOne(p.id, `${(p.title || "ovning").replace(/\s+/g, "_").toLowerCase()}.json`)
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
        <h3 className="font-medium">{editing ? "Redigera övning" : "Ny övning"}</h3>
        <p className="meta mb-3">Fyll i det som hjälper dig nu. Du kan alltid ändra senare.</p>

        <form className="grid gap-4 max-w-2xl" onSubmit={onSubmit}>
          {/* Typ & syfte */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Övningstyp</span>
              <select
                className="input"
                value={form.exercise}
                onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value as ExerciseType }))}
              >
                <option value="brev">Brev som inte skickas</option>
                <option value="dialog-datidsjag">Dialog med dåtids-jag</option>
                <option value="abc">ABC-omramning</option>
                <option value="varderingskompass">Värderingskompass</option>
                <option value="grounding-54321">Grounding 5-4-3-2-1</option>
                <option value="kroppskarta">Kroppskarta</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="label">Syfte</span>
              <input
                className="input"
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                placeholder="t.ex. avlasta skuld, förstå reaktion"
              />
            </label>
          </div>

          {/* Fokus & nivå */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Fokusområde</span>
              <input
                className="input"
                value={form.focus}
                onChange={(e) => setForm((f) => ({ ...f, focus: e.target.value }))}
                placeholder="relation, kropp, minne…"
              />
            </label>

            <label className="grid gap-1">
              <span className="label">Svårighetsnivå</span>
              <select
                className="input"
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as FormState["level"] }))}
              >
                <option value="låg">låg</option>
                <option value="medel">medel</option>
                <option value="hög">hög</option>
              </select>
            </label>
          </div>

          {/* Status & känsla före/efter */}
          <div className="grid md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <span className="label">Status</span>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormState["status"] }))}
              >
                <option value="pågående">pågående</option>
                <option value="avslutad">avslutad</option>
                <option value="arkiverad">arkiverad</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="label">Känsla före (0–10)</span>
              <input
                type="number" min={0} max={10} className="input"
                value={form.feelBefore}
                onChange={(e) => setForm((f) => ({ ...f, feelBefore: parseInt(e.target.value || "0", 10) }))}
              />
            </label>

            <label className="grid gap-1">
              <span className="label">Känsla efter (0–10)</span>
              <input
                type="number" min={0} max={10} className="input"
                value={form.feelAfter}
                onChange={(e) => setForm((f) => ({ ...f, feelAfter: parseInt(e.target.value || "0", 10) }))}
              />
            </label>
          </div>

          {/* Datum */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="label">Startdatum</span>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </label>
            <label className="grid gap-1">
              <span className="label">Avslutdatum</span>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </label>
          </div>

          {/* Reflektion / anteckningar */}
          <label className="grid gap-1">
            <span className="label">Reflektion / anteckningar</span>
            <textarea
              className="textarea"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Vad hände? Vad tog du med dig?"
            />
          </label>

          {/* Sekretess */}
          <div className="grid md:grid-cols-2 gap-4">
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