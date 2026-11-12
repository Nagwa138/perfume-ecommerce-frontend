import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { useCart, useWishlist } from "../store";
import { useUI } from "../ui";

// Inline taxonomy for navigation — static, no API call needed
const NAV_TAXONOMY: Record<string, Record<string, string[]>> = {
  Men: {
    "Tops":                  ["T-Shirts", "Polos", "Shirts", "Tank Tops", "Long Sleeves"],
    "Hoodies & Sweatshirts": ["Pullover", "Zip Hoodie", "Crewneck", "Oversized"],
    "Outerwear":             ["Bomber", "Denim Jacket", "Puffer", "Leather Jacket", "Windbreaker"],
    "Bottoms":               ["Jeans", "Cargo Pants", "Joggers", "Chinos", "Shorts"],
    "Footwear":              ["Sneakers", "Boots", "Loafers", "Slides"],
    "Accessories":           ["Caps", "Beanies", "Bags & Backpacks", "Sunglasses"],
  },
  Women: {
    "Tops":                  ["T-Shirts", "Crop Tops", "Shirts", "Tank Tops"],
    "Hoodies & Sweatshirts": ["Pullover", "Zip Hoodie", "Crewneck", "Oversized"],
    "Outerwear":             ["Bomber", "Puffer", "Leather Jacket", "Wool Coat", "Blazer"],
    "Bottoms":               ["Jeans", "Cargo Pants", "Joggers", "Shorts", "Skirts"],
    "Dresses":               ["Mini", "Midi", "Maxi"],
    "Footwear":              ["Sneakers", "Boots", "Sandals", "Slides"],
    "Accessories":           ["Caps", "Bags & Backpacks", "Sunglasses", "Watches"],
  },
  Kids: {
    "Tops":                  ["T-Shirts", "Long Sleeves"],
    "Hoodies & Sweatshirts": ["Pullover", "Zip Hoodie"],
    "Outerwear":             ["Puffer", "Windbreaker"],
    "Bottoms":               ["Jeans", "Joggers", "Shorts"],
    "Footwear":              ["Sneakers", "Boots"],
    "Accessories":           ["Caps", "Beanies", "Socks"],
  },
};

const DEPARTMENTS = Object.keys(NAV_TAXONOMY) as (keyof typeof NAV_TAXONOMY)[];

// ── Mega-menu panel ───────────────────────────────────────────────────────────

function MegaMenu({ dep, onClose }: { dep: string; onClose: () => void }) {
  const cats = NAV_TAXONOMY[dep] ?? {};
  return (
    <div className="absolute left-0 top-full z-50 w-full border-t border-border bg-bg/97 shadow-xl backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 md:grid-cols-4 lg:grid-cols-6">
          {Object.entries(cats).map(([cat, subcats]) => (
            <div key={cat}>
              <Link
                to={`/shop?department=${encodeURIComponent(dep)}&category=${encodeURIComponent(cat)}`}
                onClick={onClose}
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-white hover:text-accent"
              >
                {cat}
              </Link>
              <ul className="space-y-1">
                {subcats.map((sc) => (
                  <li key={sc}>
                    <Link
                      to={`/shop?department=${encodeURIComponent(dep)}&category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sc)}`}
                      onClick={onClose}
                      className="block text-xs text-muted transition-colors hover:text-white"
                    >
                      {sc}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* View all CTA */}
          <div className="flex items-end">
            <Link
              to={`/shop?department=${encodeURIComponent(dep)}`}
              onClick={onClose}
              className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-2"
            >
              Shop All {dep} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

const QUICK_NAV = [
  { label: "New",      to: "/shop?sort=newest"   },
  { label: "Sale",     to: "/shop?on_sale=true"  },
  { label: "Lookbook", to: "/lookbook"           },
];

export default function Header() {
  const { lines, toggle: toggleCart } = useCart();
  const wishCount = useWishlist((s) => s.ids.length);
  const { setCommandOpen, setMobileMenuOpen } = useUI();
  const cartCount = lines.reduce((t, l) => t + l.qty, 0);

  const [activeDep, setActiveDep] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu  = (dep: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDep(dep);
  };
  const startClose = () => {
    closeTimer.current = setTimeout(() => setActiveDep(null), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-widest transition-colors hover:text-accent"
        >
          NOVA WEAR
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">

          {/* Department mega-menu triggers */}
          {DEPARTMENTS.map((dep) => (
            <div
              key={dep}
              className="relative"
              onMouseEnter={() => openMenu(dep)}
              onMouseLeave={startClose}
            >
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  activeDep === dep ? "text-accent" : "text-muted hover:text-white"
                }`}
              >
                {dep}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${activeDep === dep ? "rotate-180 text-accent" : ""}`}
                />
              </button>
            </div>
          ))}

          {/* Quick links */}
          {QUICK_NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-muted transition-colors hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setCommandOpen(true)}
            aria-label="Search (Ctrl+K)"
            className="hidden items-center gap-1.5 text-muted transition-colors hover:text-white md:flex"
          >
            <Search size={18} />
            <span className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] lg:inline">
              ⌘K
            </span>
          </button>

          <button
            onClick={() => setCommandOpen(true)}
            aria-label="Search"
            className="text-muted transition-colors hover:text-white md:hidden"
          >
            <Search size={20} />
          </button>

          <Link to="/wishlist" aria-label="Wishlist" className="relative text-muted transition-colors hover:text-white">
            <Heart size={20} />
            {wishCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {wishCount > 9 ? "9+" : wishCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleCart}
            aria-label="Cart"
            className="relative text-muted transition-colors hover:text-white"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
            className="text-muted transition-colors hover:text-white md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mega-menu panel (full-width, below header) */}
      {activeDep && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={startClose}
        >
          <MegaMenu dep={activeDep} onClose={() => setActiveDep(null)} />
        </div>
      )}
    </header>
  );
}
