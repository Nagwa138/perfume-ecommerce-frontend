import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Heart, ChevronDown } from "lucide-react";
import { useUI } from "../ui";
import { useCart, useWishlist } from "../store";

const DEPARTMENTS: Record<string, string[]> = {
  Men:   ["Tops", "Hoodies & Sweatshirts", "Outerwear", "Bottoms", "Footwear", "Accessories"],
  Women: ["Tops", "Hoodies & Sweatshirts", "Outerwear", "Dresses", "Bottoms", "Footwear", "Accessories"],
  Kids:  ["Tops", "Outerwear", "Bottoms", "Footwear", "Accessories"],
};

const QUICK_NAV = [
  { label: "New Arrivals", to: "/shop?sort=newest" },
  { label: "Sale", to: "/shop?on_sale=true" },
];

export default function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  const cartCount = useCart((s) => s.lines.reduce((t, l) => t + l.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const toggleCart = useCart((s) => s.toggle);
  const [openDep, setOpenDep] = useState<string | null>(null);

  if (!mobileMenuOpen) return null;

  const close = () => setMobileMenuOpen(false);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" onClick={close} className="font-display text-2xl font-bold tracking-widest">
          NOVA WEAR
        </Link>
        <button onClick={close} aria-label="Close menu">
          <X size={24} />
        </button>
      </div>

      {/* nav links */}
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        {/* Department accordions */}
        {Object.entries(DEPARTMENTS).map(([dep, cats]) => (
          <div key={dep} className="border-b border-border">
            <button
              onClick={() => setOpenDep(openDep === dep ? null : dep)}
              className="flex w-full items-center justify-between py-4 font-display text-2xl font-bold tracking-wide hover:text-accent transition-colors"
            >
              {dep}
              <ChevronDown
                size={18}
                className={`transition-transform text-muted ${openDep === dep ? "rotate-180" : ""}`}
              />
            </button>
            {openDep === dep && (
              <div className="pb-3 pl-2 space-y-1">
                <Link
                  to={`/shop?department=${dep}`}
                  onClick={close}
                  className="block py-2 text-sm font-semibold text-accent hover:text-accent-2 transition-colors"
                >
                  Shop All {dep}
                </Link>
                {cats.map((cat) => (
                  <Link
                    key={cat}
                    to={`/shop?department=${dep}&category=${encodeURIComponent(cat)}`}
                    onClick={close}
                    className="block py-2 text-sm text-muted hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Quick links */}
        {QUICK_NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={close}
            className="block border-b border-border py-4 font-display text-2xl font-bold tracking-wide hover:text-accent transition-colors"
          >
            {n.label}
          </Link>
        ))}

        <Link
          to="/admin"
          onClick={close}
          className="mt-4 block text-sm text-muted hover:text-white transition-colors"
        >
          Admin
        </Link>
      </nav>

      {/* bottom actions */}
      <div className="flex items-center gap-6 border-t border-border px-6 py-5">
        <button
          onClick={() => { toggleCart(); close(); }}
          className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
        >
          <ShoppingBag size={18} />
          Cart{" "}
          {cartCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-[11px] text-white">{cartCount}</span>
          )}
        </button>
        <Link
          to="/wishlist"
          onClick={close}
          className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
        >
          <Heart size={18} />
          Wishlist{" "}
          {wishCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-[11px] text-white">{wishCount}</span>
          )}
        </Link>
      </div>
    </div>
  );
}
