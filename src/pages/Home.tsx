import { Link } from "react-router-dom";
import { usePages } from "@/hooks/usePages";

/**
 * Startsida – ren, lugn presentation.
 * Ingen input/spara här. Visar genvägar + senaste fem poster (alla typer).
 */
export default function Home() {
  const { pages } = usePages(); // alla typer
  const latest = pages.slice(0, 5);

  const counts = {
    sorg: pages.filter(p => p.kind === "sorg").length,
    minne: pages.filter(p => p.kind === "minne").length,
    bearbetning: pages.filter(p => p.kind === "bearbetning").length,
    journal: pages.filter(p => p.kind === "journal").length,
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Startsida</h2>
          <p className="meta">Allt lagras lokalt. Fem rum: Sorg • Minne • Bearbetning • Dagbok • Startsida.</p>
        </div>
        <div className="flex gap-2">
          <Stat label="Sorg" value={counts.sorg} to="/sorg" />
          <Stat label="Minne" value={counts.minne} to="/minne" />
          <Stat label="Bearbetning" value={counts.bearbetning} to="/bearbetning" />
          <Stat label="Dagbok" value={counts.journal} to="/journal" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Presentation */}
        <Widget title="Om den här appen" subtitle="Lugn arbetsyta för sorg, minnen, bearbetning och fri dagbok.">
          <ul className="list-disc pl-5 text-sm text-stone-700 space-y-1">
            <li>Offline först. Ingen molnsynk.</li>
            <li>Export/Import per post (JSON). ZIP + assets kommer senare.</li>
            <li>Fri block-editor i Dagbok (rubrik, stycke, citat, checklista, bild, skiss).</li>
            <li>Formulär i Sorg/Minne/Bearbetning sparar strukturerat + går att ändra.</li>
          </ul>
        </Widget>

        {/* Genvägar */}
        <Widget title="Genvägar" subtitle="Hoppa direkt till ett rum.">
          <div className="grid gap-2">
            <Quick to="/sorg">Öppna Sorg</Quick>
            <Quick to="/minne">Öppna Minne</Quick>
            <Quick to="/bearbetning">Öppna Bearbetning</Quick>
            <Quick to="/journal">Öppna Dagbok</Quick>
          </div>
        </Widget>

        {/* Senaste fem */}
        <Widget title="Senaste fem" subtitle="Senast uppdaterade poster, alla rum.">
          {latest.length === 0 ? (
            <p className="text-stone-600">Inget ännu. Skapa något i valfri vy.</p>
          ) : (
            <ul className="space-y-2">
              {latest.map((p) => (
                <li key={p.id} className="rounded-lg border border-stone-200 bg-white p-3 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium line-clamp-1">{p.title || "(utan titel)"}</div>
                      <div className="meta">{new Date(p.updatedAt).toLocaleString()}</div>
                    </div>
                    <span className="badge">{p.kind}</span>
                  </div>
                  <div className="mt-2">
                    <GoTo kind={p.kind} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </div>
    </div>
  );
}

/* --- Hjälpare/mini-komponenter --- */
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

function Stat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="card-paper px-3 py-2 text-center lift focus-ring">
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </Link>
  );
}

function GoTo({ kind }: { kind: "sorg" | "minne" | "bearbetning" | "journal" }) {
  const path = `/${kind}`;
  const label =
    kind === "sorg" ? "Öppna i Sorg" :
    kind === "minne" ? "Öppna i Minne" :
    kind === "bearbetning" ? "Öppna i Bearbetning" :
    "Öppna i Dagbok";
  return (
    <Link to={path} className="btn-outline inline-flex">{label}</Link>
  );
}