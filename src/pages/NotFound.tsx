import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid place-items-center h-screen text-center bg-stone-50 dark:bg-stone-900 transition-colors">
      <div className="p-6">
        <h1 className="text-5xl font-bold text-stone-700 dark:text-stone-100 mb-2">
          404
        </h1>
        <p className="text-stone-600 dark:text-stone-300 mb-6">
          Den här sidan verkar ha vandrat vilse i minnets korridorer.
        </p>
        <Link
          to="/"
          className="btn-accent lift text-sm"
        >
          Tillbaka hem
        </Link>
      </div>
    </div>
  );
}