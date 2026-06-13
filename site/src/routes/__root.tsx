import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Ambient } from "../components/Ambient";
import { Nav } from "../components/Nav";
import { Monogram } from "../components/Monogram";
import { GoldText } from "../components/GoldText";
import { pageVariants } from "../lib/motion";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  // Key the animated wrapper on the path so AnimatePresence runs the
  // exit → enter sequence (and replays the veil sweep) on each navigation.
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <Ambient />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="relative z-10 min-h-dvh"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Nav />
    </>
  );
}

function NotFound() {
  return (
    <>
      <Ambient />
      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Monogram className="h-28 w-28 opacity-90" />
        <GoldText as="h1" className="mt-6 text-3xl font-light">
          This page wandered off
        </GoldText>
        <p className="mt-2 font-sans text-sm text-lilac-700">
          Let's get you back to the celebration.
        </p>
        <Link to="/" className="btn-gold mt-8">
          Return home
        </Link>
      </main>
    </>
  );
}
