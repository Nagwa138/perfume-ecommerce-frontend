import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Footer from "./Footer";
import Toast from "./Toast";
import CommandPalette from "./CommandPalette";
import MobileMenu from "./MobileMenu";
import Cart from "../Cart";
import ThemeSwitcher from "./ThemeSwitcher";
import CursorSpotlight from "./CursorSpotlight";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="relative z-0 flex min-h-screen flex-col mesh-bg overflow-x-hidden">
      <AnnouncementBar />
      <Header />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex w-full flex-1 flex-col"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <Footer />

      <Toast />
      <CommandPalette />
      <MobileMenu />
      <Cart />
      <CursorSpotlight />
      {import.meta.env.DEV && <ThemeSwitcher />}
    </div>
  );
}