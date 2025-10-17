import { Outlet } from "react-router-dom";
import Topbar from "@/components/Topbar";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <Topbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Viktigt: ge inte className direkt till <Outlet /> */}
        <div className="space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}