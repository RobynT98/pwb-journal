import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Topbar() {
  const location = useLocation();
  const [path, setPath] = useState(location.pathname);

  useEffect(() => {
    setPath(location.pathname);
  }, [location]);

  const nav = [
    { to: "/", label: "Start" },
    { to: "/sorg", label: "Sorg" },
    { to: "/minne", label: "Minne" },
    { to: "/bearbetning", label: "Bearbetning" },
    { to: "/journal", label: "Dagbok" },
    { to: "/settings", label: "Inställningar" }, // ← ny knapp
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur border-b border-stone-200 dark:border-stone-700">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-[var(--ink)] select-none">
            pwb-journal
          </span>
          <ul className="hidden sm:flex items-center gap-4">
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

        {/* mobil meny – placeholder */}
        <div className="sm:hidden text-[var(--muted)] text-sm">
          {nav.find((n) => n.to === path)?.label ?? "Meny"}
        </div>
      </nav>
    </header>
  );
}