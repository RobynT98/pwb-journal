import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import "./index.css";

import Home from "./pages/Home";
import Sorg from "./pages/Sorg";
import Minne from "./pages/Minne";
import Bearbetning from "./pages/Bearbetning";
import Dagbok from "./pages/Dagbok";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/sorg", element: <Sorg /> },
      { path: "/minne", element: <Minne /> },
      { path: "/bearbetning", element: <Bearbetning /> },
      { path: "/dagbok", element: <Dagbok /> },
      { path: "*", element: <NotFound /> }, // fångar ogiltiga vägar
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);