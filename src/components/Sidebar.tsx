import { NavLink } from "react-router-dom";

const linkBase =
  "block px-4 py-2 rounded-md text-sm transition-colors focus-ring";
const linkIdle =
  "text-stone-800 hover:bg-stone-100";
const linkActive =
  "bg-accent text-white hover:bg-accent/90";

export default function Sidebar() {
  return (
    <aside className="card-paper p-3">
      <nav className="space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          Startsida
        </NavLink>

        <NavLink
          to="/sorg"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          Sorg
        </NavLink>

        <NavLink
          to="/minne"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          Minne
        </NavLink>

        <NavLink
          to="/bearbetning"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          Bearbetning
        </NavLink>

        <NavLink
          to="/journal"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          Dagbok
        </NavLink>
      </nav>
    </aside>
  );
}