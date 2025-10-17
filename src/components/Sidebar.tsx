import { NavLink } from "react-router-dom";

const linkBase =
  "block px-4 py-2 rounded-md text-sm transition-colors hover:bg-stone-100";
const linkActive =
  "bg-accent text-white hover:bg-accent/90";

export default function Sidebar() {
  return (
    <aside className="border-r border-stone-200 bg-white/90 backdrop-blur-sm p-3">
      <nav className="space-y-2">
        <NavLink to="/" end className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`}>Startsida</NavLink>
        <NavLink to="/sorg" className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`}>Sorg</NavLink>
        <NavLink to="/minne" className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`}>Minne</NavLink>
        <NavLink to="/bearbetning" className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`}>Bearbetning</NavLink>
        <NavLink to="/journal" className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ""}`}>Dagbok</NavLink>
      </nav>
    </aside>
  );
}