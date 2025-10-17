import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "@/index.css";
import App from "@/App";

import Home from "@/pages/Home";
import Sorg from "@/pages/Sorg";
import Minne from "@/pages/Minne";
import Bearbetning from "@/pages/Bearbetning";
import Journal from "@/pages/Journal";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "sorg", element: <Sorg /> },
      { path: "minne", element: <Minne /> },
      { path: "bearbetning", element: <Bearbetning /> },
      { path: "journal", element: <Journal /> },   // ⟵ fixad dagbokslänk
      { path: "settings", element: <Settings /> },
      { path: "*", element: <NotFound /> },        // fångar ogiltiga routes
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);