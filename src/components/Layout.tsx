import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Footer from "./Footer";
import Toast from "./Toast";
import CommandPalette from "./CommandPalette";
import MobileMenu from "./MobileMenu";
import Cart from "../Cart";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex flex-1 flex-col"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <Footer />

      {/* Global overlays */}
      <Toast />
      <CommandPalette />
      <MobileMenu />
      <Cart />
    </div>
  );
}
