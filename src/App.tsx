import { Outlet } from "react-router-dom";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function App() {
  return (
    <div className="h-dvh grid grid-cols-[240px_1fr] grid-rows-[56px_1fr] text-stone-800">
      <Topbar className="col-span-2" />
      <Sidebar />
      <main className="bg-stone-50 border-l border-stone-200 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}