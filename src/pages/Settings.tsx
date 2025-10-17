import { useEffect, useMemo, useState } from "react";
import { clearAll } from "@/lib/storage";

type Theme = "light" | "sepia" | "dark";
type Language = "sv" | "en";
type Privacy = "open" | "lock" | "ritual-lock";

type Settings = {
  theme: Theme;
  language: Language;
  privacyDefault: Privacy;
  paniklas: boolean; // UI-stub för framtida lås
};

const KEY = "pwb:settings:v1";

const DEFAULTS: Settings = {
  theme: "sepia",
  language: "sv",
  privacyDefault: "open",
  paniklas: false,
};

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(() => loadSettings());
  const [confirmClear, setConfirmClear] = useState(false);

  // Applicera tema direkt när det ändras
  useEffect(() => {
    applyTheme(s.theme);
    saveSettings(s);
  }, [s]);

  const themePreviewColors = useMemo(() => {
    return THEME_MAP[s.theme];
  }, [s.theme]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Inställningar</h2>
          <p className="meta">Tema, språk och standardsekretess. Allt sparas lokalt.</p>
        </div>
      </header>

      {/* Tema */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Tema</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                checked={s.theme === "light"}
                onChange={() => setS((prev) => ({ ...prev, theme: "light" }))}
              />
              <span>Ljus</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                checked={s.theme === "sepia"}
                onChange={() => setS((prev) => ({ ...prev, theme: "sepia" }))}
              />
              <span>Papper (sepia)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                checked={s.theme === "dark"}
                onChange={() => setS((prev) => ({ ...prev, theme: "dark" }))}
              />
              <span>Mörk</span>
            </label>
          </div>

          {/* Förhandsvisning */}
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: themePreviewColors.border,
              background: themePreviewColors.card,
              color: themePreviewColors.fg,
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <div className="text-sm opacity-70 mb-1">Förhandsvisning</div>
            <div className="font-medium mb-1">Rubrik på kort</div>
            <p className="text-sm">
              Så här ser ytan och kontrasterna ut i vald stil. Pastell och lugn
              läsbarhet utan att bli platt.
            </p>
          </div>
        </div>
      </section>

      {/* Språk */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Språk</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="lang"
              checked={s.language === "sv"}
              onChange={() => setS((prev) => ({ ...prev, language: "sv" }))}
            />
            <span>Svenska</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="lang"
              checked={s.language === "en"}
              onChange={() => setS((prev) => ({ ...prev, language: "en" }))}
            />
            <span>English</span>
          </label>
        </div>
        <p className="meta mt-2">
          (Stub just nu – själva texterna byter inte ännu. Vi kopplar i18n senare.)
        </p>
      </section>

      {/* Sekretess default */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Standardsekretess</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {(["open", "lock", "ritual-lock"] as Privacy[]).map((mode) => (
            <label key={mode} className="flex items-center gap-2">
              <input
                type="radio"
                name="privacy"
                checked={s.privacyDefault === mode}
                onChange={() => setS((prev) => ({ ...prev, privacyDefault: mode }))}
              />
              <span>{mode}</span>
            </label>
          ))}
        </div>
        <p className="meta mt-2">
          Detta blir förvalt när du skapar nya poster (kan ändras per post).
        </p>
      </section>

      {/* Paniklås – stub */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Paniklås (stub)</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.paniklas}
            onChange={(e) => setS((prev) => ({ ...prev, paniklas: e.target.checked }))}
          />
          <span>Aktivera dubbel-Esc för att dölja innehåll</span>
        </label>
        <p className="meta mt-2">
          Vi kopplar detta till en riktig låsskärm i nästa steg.
        </p>
      </section>

      {/* Datahantering */}
      <section className="card-paper p-4 lift">
        <h3 className="font-medium mb-2">Data</h3>
        {!confirmClear ? (
          <button className="btn-outline" onClick={() => setConfirmClear(true)}>
            Rensa allt lokalt innehåll…
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">Säker på att du vill tömma allt?</span>
            <button
              className="btn-accent"
              onClick={() => {
                clearAll();
                setConfirmClear(false);
              }}
            >
              Ja, rensa allt
            </button>
            <button className="btn-outline" onClick={() => setConfirmClear(false)}>
              Avbryt
            </button>
          </div>
        )}
        <p className="meta mt-2">
          Gäller endast lokalt i din webbläsare. Exportera viktiga poster innan.
        </p>
      </section>
    </div>
  );
}

/* ----------------- helpers ----------------- */

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function applyTheme(t: Theme) {
  const root = document.documentElement;

  const theme = THEME_MAP[t];
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--fg", theme.fg);
  root.style.setProperty("--ink", theme.ink);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--card", theme.card);
  // ring/accents lämnas som i index.css (mörkröd), funkar fint med alla tre teman.
}

const THEME_MAP: Record<
  Theme,
  { bg: string; fg: string; ink: string; muted: string; card: string; border: string }
> = {
  light: {
    bg: "#f7f7f8",
    fg: "#1f1f1f",
    ink: "#111111",
    muted: "#6b6b6b",
    card: "#ffffff",
    border: "#e7e5e4",
  },
  sepia: {
    bg: "#faf7f2",
    fg: "#2b2b2b",
    ink: "#1f1f1f",
    muted: "#6b6b6b",
    card: "#ffffffee",
    border: "#e7e5e4",
  },
  dark: {
    bg: "#0b0b0c",
    fg: "#e7e7e7",
    ink: "#ffffff",
    muted: "#a3a3a3",
    card: "#141416",
    border: "#27272a",
  },
};