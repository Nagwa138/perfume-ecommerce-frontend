import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./Home";
import ProductPage from "./ProductPage";
import ShopPage from "./ShopPage";
import AdminPage from "./AdminPage";
import WishlistPage from "./WishlistPage";

const QuizHub        = lazy(() => import("./QuizHub"));
const FragranceQuiz  = lazy(() => import("./FragranceQuiz"));
const SkincareQuiz   = lazy(() => import("./SkincareQuiz"));

const LazyPage = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="flex flex-1 items-center justify-center py-40"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>}>
    {children}
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/quiz" element={<LazyPage><QuizHub /></LazyPage>} />
        <Route path="/quiz/fragrance" element={<LazyPage><FragranceQuiz /></LazyPage>} />
        <Route path="/quiz/skincare"  element={<LazyPage><SkincareQuiz /></LazyPage>} />
        <Route path="/quiz/shade-finder" element={<LazyPage><QuizHub /></LazyPage>} />
        <Route
          path="*"
          element={
            <div className="flex flex-1 items-center justify-center py-40">
              <div className="text-center">
                <p className="font-display text-8xl font-bold text-muted">404</p>
                <p className="mt-2 text-muted">That page doesn&apos;t exist.</p>
                <a
                  href="/"
                  className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
                >
                  Go home
                </a>
              </div>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
