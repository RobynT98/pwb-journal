import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Topbar() {
  const location = useLocation();
  const [path, setPath] = useState(location.pathname);
  useEffect(() => setPath(location.pathname), [location]);

  const nav = [
    { to: "/", label: "Start" },
    { to: "/sorg", label: "Sorg" },
    { to: "/minne", label: "Minne" },
    { to: "/bearbetning", label: "Bearbetning" },
    { to: "/journal", label: "Dagbok" },
    { to: "/settings", label: "Inställningar" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur border-b border-stone-200">
      {/* Överrad: titel + desktop-nav */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-[var(--ink)] select-none">pwb-journal</span>

          {/* Desktop-nav */}
          <ul className="hidden md:flex items-center gap-4">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={`transition-colors ${
                    path === n.to
                      ? "text-[var(--ink)] font-medium"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Högersida kan få knappar senare (sök, export etc) */}
        <div className="hidden md:block text-sm text-[var(--muted)]" />
      </nav>

      {/* Mobil/tab-nav (ingen hamburgare) */}
      <div className="md:hidden border-t border-stone-200">
        <div
          className="max-w-6xl mx-auto px-3 py-2 overflow-x-auto no-scrollbar"
          aria-label="Primär navigering"
        >
          <ul className="flex items-center gap-2 min-w-max">
            {nav.map((n) => {
              const active = path === n.to;
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={`px-3 h-9 inline-grid place-items-center rounded-full text-sm border transition 
                      ${active
                        ? "bg-accent text-white border-accent"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
}