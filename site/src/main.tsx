import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

// import.meta.env.BASE_URL is Vite's `base` (e.g. "/wedding-monogram/").
// The router wants it without the trailing slash; "/" stays "/".
const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const router = createRouter({
  routeTree,
  basepath,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// NB: no <StrictMode> — its dev-only double-mount makes framer-motion replay
// every entrance animation ("animates in twice"). Dropping it keeps dev visuals
// matching production for this animation-heavy site.
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
