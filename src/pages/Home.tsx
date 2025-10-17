import { Link } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { useState } from "react";

/**
 * Startsida – lugn överblick.
 * Allt är “tomt” logiskt – vi wire:ar bara UI:t.
 * Sen kopplar vi spar/last till local/Tauri.
 */
export default function Home() {
  const [quickText, setQuickText] = useState("");
  const [mood, setMood] = useState<number>(3);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Startsida</h2>
          <p className="meta">Lugn arbetsyta. Allt stannar lokalt.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/journal" className="btn-outline">Ny dagbokssida</Link>
          <Link to="/minne" className="btn-outline">Nytt minne</Link>
          <Link to="/sorg" className="btn-outline">Ny sorg-post</Link>
          <Link to="/bearbetning" className="btn-accent">Ny övning</Link>
        </div>
      </header>

      {/* Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Snabbskriv */}
        <Widget title="Snabbskriv (Inbox)" subtitle="En rad som blir ett utkast i Dagbok.">
          <textarea
            className="textarea"
            placeholder="Fånga en tanke…"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="meta">{quickText.length}/500</span>
            <button className="btn-primary">Spara (stub)</button>
          </div>
        </Widget>

        {/* Dagens läge */}
        <Widget title="Dagens läge" subtitle="En mjuk markering – bara för dig.">
          <div className="grid gap-3">
            <label className="label">Humör</label>
            <input
              type="range"
              min={0}
              max={5}
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex items-center gap-2">
              <span className="badge">mood: {mood}</span>
              <span className="badge">energi: —</span>
              <span className="badge">fokus: —</span>
            </div>
            <div className="flex justify-end">
              <button className="btn-outline">Markera (stub)</button>
            </div>
          </div>
        </Widget>

        {/* Snabbknappar */}
        <Widget title="Snabbknappar" subtitle="Hoppa dit du vill skapa.">
          <div className="grid gap-2">
            <Quick to="/sorg">Ny Sorg</Quick>
            <Quick to="/minne">Nytt Minne</Quick>
            <Quick to="/bearbetning">Ny Bearbetning</Quick>
            <Quick to="/journal">Ny Dagbok</Quick>
          </div>
        </Widget>

        {/* Senaste */}
        <Widget title="Senaste" subtitle="Visar dina fem senaste när de finns.">
          <EmptyState title="Inget ännu" hint="Dina senaste poster landar här." />
        </Widget>

        {/* Årsdagar & markeringar */}
        <Widget title="Årsdagar & markeringar" subtitle="Kommer från Sorg-rummet.">
          <EmptyState title="Inga markeringar" hint="Skapa en sorg-post med årsdag för att se den här." />
        </Widget>
      </div>
    </div>
  );
}

/* --- Små hjälpare --- */
function Widget({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-paper p-4 lift focus-ring" tabIndex={0}>
      <h3 className="font-medium">{title}</h3>
      {subtitle && <p className="meta mb-3">{subtitle}</p>}
      {children}
    </section>
  );
}

function Quick({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="h-10 rounded-md border border-stone-300 grid place-items-center hover:bg-stone-50 focus-ring"
    >
      {children}
    </Link>
  );
}