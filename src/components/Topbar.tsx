import React from "react";

type Props = { className?: string };

export default function Topbar({ className = "" }: Props) {
  return (
    <header
      className={`card-paper ${className} flex items-center justify-between px-4 h-14`}
    >
      {/* Vänster: logotyp + namn */}
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-lg bg-accent shadow-sm" aria-hidden />
        <h1 className="font-semibold tracking-tight">PWB-Journal</h1>
        <span className="meta">offline • privat</span>
      </div>

      {/* Höger: sök + import/export + paniklås */}
      <div className="flex items-center gap-2">
        <label className="relative">
          <span className="sr-only">Sök</span>
          <input
            placeholder="Sök (⌘K)"
            className="input w-64"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden text-[10px] text-stone-500 sm:inline">
            ⌘K
          </kbd>
        </label>

        <button className="btn-outline" title="Importera (ZIP)">Import</button>
        <button className="btn-accent glow" title="Exportera (ZIP)">Export</button>
        <button className="btn-outline" title="Paniklås (Esc Esc)" aria-label="Paniklås">
          🔒
        </button>
      </div>
    </header>
  );
}