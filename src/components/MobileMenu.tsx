import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Heart, ChevronDown } from "lucide-react";
import { useUI } from "../ui";
import { useCart, useWishlist } from "../store";
import Logo from "./Logo";

const CATEGORIES: Record<string, string[]> = {
  Fragrance:  ["Women", "Men", "Unisex", "Floral", "Woody", "Oriental/Amber", "Collections"],
  Skincare:   ["Serums", "Moisturisers", "Cleansers", "Eye Care", "Masks"],
  Makeup:     ["Foundation", "Lips", "Eyes", "Blush & Bronzer"],
  Hair:       ["Shampoo", "Conditioner", "Hair Oil", "Treatments"],
  Body:       ["Body Lotion", "Body Wash", "Scrub", "Body Mist"],
  "Gift Sets":["Birthday", "Wedding", "Mother's Day", "Luxury Hampers"],
};

const CAT_TO_TYPE: Record<string, string> = {
  Fragrance:   "perfume",
  Skincare:    "skincare",
  Makeup:      "makeup",
  Hair:        "haircare",
  Body:        "body",
  "Gift Sets": "gift_set",
};

const QUICK_NAV = [
  { label: "New Arrivals", to: "/shop?sort=newest" },
  { label: "Sale",         to: "/shop?on_sale=true" },
];

export default function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  const cartCount = useCart((s) => s.lines.reduce((t, l) => t + l.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const toggleCart = useCart((s) => s.toggle);
  const [openCat, setOpenCat] = useState<string | null>(null);

  if (!mobileMenuOpen) return null;
  const close = () => setMobileMenuOpen(false);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" onClick={close} aria-label="H STORE home">
          <Logo className="text-2xl" />
        </Link>
        <button onClick={close} aria-label="Close menu"><X size={24} /></button>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-4">
        {Object.entries(CATEGORIES).map(([cat, items]) => {
          const ptType = CAT_TO_TYPE[cat];
          return (
            <div key={cat} className="border-b border-border">
              <button
                onClick={() => setOpenCat(openCat === cat ? null : cat)}
                className="flex w-full items-center justify-between py-4 font-display text-2xl font-bold tracking-wide transition-colors hover:text-accent"
              >
                {cat}
                <ChevronDown size={18} className={`text-muted transition-transform ${openCat === cat ? "rotate-180" : ""}`} />
              </button>
              {openCat === cat && (
                <div className="space-y-1 pb-3 pl-2">
                  <Link
                    to={`/shop?product_type=${ptType}`}
                    onClick={close}
                    className="block py-2 text-sm font-semibold text-accent transition-colors hover:text-accent-2"
                  >
                    Shop All {cat}
                  </Link>
                  {items.map((item) => (
                    <Link
                      key={item}
                      to={`/shop?product_type=${ptType}&subcategory=${encodeURIComponent(item)}`}
                      onClick={close}
                      className="block py-2 text-sm text-muted transition-colors hover:text-white"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {QUICK_NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={close}
            className="block border-b border-border py-4 font-display text-2xl font-bold tracking-wide transition-colors hover:text-accent"
          >
            {n.label}
          </Link>
        ))}

        <Link to="/admin" onClick={close} className="mt-4 block text-sm text-muted transition-colors hover:text-white">
          Admin
        </Link>
      </nav>

      <div className="flex items-center gap-6 border-t border-border px-6 py-5">
        <button
          onClick={() => { toggleCart(); close(); }}
          className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
        >
          <ShoppingBag size={18} />
          Cart
          {cartCount > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] text-white">{cartCount}</span>}
        </button>
        <Link to="/wishlist" onClick={close} className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-white">
          <Heart size={18} />
          Wishlist
          {wishCount > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] text-white">{wishCount}</span>}
        </Link>
      </div>
    </div>
  );
}
