import React from "react";

type Props = { className?: string };

export default function Topbar({ className = "" }: Props) {
  return (
    <header
      className={`flex items-center justify-between px-4 border-b border-stone-200 bg-white/90 backdrop-blur-sm ${className}`}
    >
      {/* Vänster: logotyp + namn */}
      <div className="flex items-center gap-3">
        <div
          className="size-7 rounded-lg bg-accent"
          aria-hidden
          title="PWB-Journal"
        />
        <h1 className="font-semibold tracking-tight">PWB-Journal</h1>
      </div>

      {/* Höger: sök + import/export + paniklås */}
      <div className="flex items-center gap-2">
        <label className="relative">
          <span className="sr-only">Sök</span>
          <input
            placeholder="Sök (⌘K)"
            className="h-9 w-64 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden text-[10px] text-stone-500 sm:inline">
            ⌘K
          </kbd>
        </label>

        <button
          className="h-9 px-3 rounded-md border border-stone-300 text-sm hover:bg-stone-50"
          title="Importera (ZIP)"
        >
          Import
        </button>
        <button
          className="h-9 px-3 rounded-md bg-stone-900 text-white text-sm hover:bg-stone-800"
          title="Exportera (ZIP)"
        >
          Export
        </button>

        <button
          className="h-9 px-3 rounded-md border border-stone-300 text-sm hover:bg-stone-50"
          title="Paniklås (Esc Esc)"
          aria-label="Paniklås"
        >
          🔒
        </button>
      </div>
    </header>
  );
}