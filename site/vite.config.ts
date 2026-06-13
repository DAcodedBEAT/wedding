import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// The site is served from a GitHub Pages *project* subpath by default
// (https://<user>.github.io/<repo>/). `BASE_PATH` is the single knob to
// change when the repo/dir is renamed or moved to a custom domain ("/").
// It feeds Vite's asset base, which Vite exposes to the app as
// import.meta.env.BASE_URL — the router reads that for its basepath.
export default defineConfig(({ mode }) => {
  // Prefix "" → load *all* keys (incl. non-VITE_ ones like BASE_PATH) from
  // .env files; a real process.env.BASE_PATH (e.g. from CI) overrides them.
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.BASE_PATH || "/wedding-monogram/";

  return {
    base,
    // Dev/preview are served on the LAN (e.g. phone testing) where the
    // request Host may be a machine hostname like "mediaserver" rather than
    // an IP. Vite blocks unknown hosts by default; allow any in local dev.
    server: { host: true, allowedHosts: true },
    preview: { host: true, allowedHosts: true },
    plugins: [
      // Must come before the React plugin. Generates src/routeTree.gen.ts
      // from the files in src/routes/.
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
    ],
  };
});
