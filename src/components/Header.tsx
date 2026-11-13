import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu } from "lucide-react";
import { useCart, useWishlist } from "../store";
import { useUI } from "../ui";
import { BRAND } from "../brand";

// Beauty navigation taxonomy
const NAV: Record<string, Record<string, string[]>> = {
  Fragrance: {
    "By Gender":    ["Women", "Men", "Unisex"],
    "By Family":    ["Floral", "Woody", "Oriental/Amber", "Fresh/Aquatic", "Citrus", "Gourmand"],
    "Collections":  ["Signature", "Nuit Privée", "Velour Essentials"],
    "Format":       ["Parfum", "Eau de Parfum", "Eau de Toilette"],
  },
  Skincare: {
    "Face":         ["Serums", "Moisturisers", "Cleansers", "Eye Care", "Masks & Exfoliants"],
    "By Skin Type": ["Dry", "Oily", "Sensitive", "Combination"],
    "Body":         ["Body Cream", "Body Oil", "SPF & Sun Care"],
    "Sets":         ["Gift Sets", "Routines"],
  },
  Makeup: {
    "Complexion":   ["Foundation", "Concealer", "Primers", "Powders"],
    "Eyes":         ["Mascara", "Eyeliner", "Eye Shadow"],
    "Lips":         ["Lipstick", "Lip Gloss", "Lip Liner"],
    "Cheeks":       ["Blush", "Bronzer", "Highlighter"],
  },
  Hair: {
    "Cleanse":      ["Shampoo", "Co-Wash"],
    "Condition":    ["Conditioner", "Hair Mask"],
    "Style & Treat":["Hair Oil", "Serum", "Styling Cream"],
  },
  Body: {
    "Moisturise":   ["Body Lotion", "Body Butter", "Body Oil"],
    "Cleanse":      ["Body Wash", "Scrub", "Bar Soap"],
    "Fragrance":    ["Body Mist", "Deodorant"],
  },
  "Gift Sets": {
    "By Occasion":  ["Birthday", "Wedding", "Mother's Day", "Eid"],
    "By Category":  ["Fragrance Sets", "Skincare Sets", "Makeup Sets", "Luxury Hampers"],
    "By Price":     ["Under EGP 500", "EGP 500–1000", "Over EGP 1000"],
  },
  "Pharmacy": {
    "Vitamins":     ["Vitamin C", "Vitamin D", "Omega-3", "Probiotics"],
    "Skincare Rx":  ["Retinol", "AHA/BHA", "Niacinamide", "SPF Medical"],
    "Wellness":     ["Collagen", "Supplements", "Herbal Remedies"],
    "Medical":      ["Derma Brands", "Prescription Items"],
  },
};

const CATEGORIES = Object.keys(NAV);

const QUICK = [
  { label: "New",  to: "/shop?sort=newest" },
  { label: "Sale", to: "/shop?on_sale=true" },
];

function MegaMenu({ cat, onClose }: { cat: string; onClose: () => void }) {
  const groups = NAV[cat] ?? {};
  const ptType = cat === "Fragrance" ? "perfume"
    : cat === "Hair" ? "haircare"
    : cat === "Gift Sets" ? "gift_set"
    : cat === "Pharmacy" ? "pharmacy"
    : cat.toLowerCase();

  return (
    <div className="absolute left-0 top-full z-50 w-full border-t border-border bg-bg/97 shadow-xl backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 lg:grid-cols-5">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent/80">
                {group}
              </p>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      to={`/shop?product_type=${ptType}&subcategory=${encodeURIComponent(item)}`}
                      onClick={onClose}
                      className="block text-xs text-muted transition-colors hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex items-end">
            <Link
              to={`/shop?product_type=${ptType}`}
              onClick={onClose}
              className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-2"
            >
              Shop All {cat} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { lines, toggle: toggleCart } = useCart();
  const wishCount = useWishlist((s) => s.ids.length);
  const { setCommandOpen, setMobileMenuOpen } = useUI();
  const cartCount = lines.reduce((t, l) => t + l.qty, 0);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu  = (cat: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); setActiveCat(cat); };
  const startClose = () => { closeTimer.current = setTimeout(() => setActiveCat(null), 180); };
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-bold tracking-[0.25em] transition-colors hover:text-accent">
          {BRAND.nameUpper}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="relative"
              onMouseEnter={() => openMenu(cat)}
              onMouseLeave={startClose}
            >
              <button
                className={`text-sm font-medium transition-colors ${
                  activeCat === cat ? "text-accent" : "text-muted hover:text-white"
                }`}
              >
                {cat}
              </button>
            </div>
          ))}
          {QUICK.map((n) => (
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
            aria-label="Search"
            className="hidden text-muted transition-colors hover:text-white md:flex items-center gap-1.5"
          >
            <Search size={18} />
            <span className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] lg:inline">⌘K</span>
          </button>
          <button onClick={() => setCommandOpen(true)} aria-label="Search" className="text-muted transition-colors hover:text-white md:hidden">
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

          <button onClick={toggleCart} aria-label="Cart" className="relative text-muted transition-colors hover:text-white">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          <button onClick={() => setMobileMenuOpen(true)} aria-label="Menu" className="text-muted transition-colors hover:text-white md:hidden">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {activeCat && (
        <div onMouseEnter={cancelClose} onMouseLeave={startClose}>
          <MegaMenu cat={activeCat} onClose={() => setActiveCat(null)} />
        </div>
      )}
    </header>
  );
}
