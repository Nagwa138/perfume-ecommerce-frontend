import { Link } from "react-router-dom";
import { Search, ShoppingBag, Menu, Heart } from "lucide-react";
import { useCart } from "../store";
import { useUI } from "../ui";
import Logo from "./Logo";

const NAV = [
  { label: "Fragrance",          href: "/shop?category=fragrance" },
  { label: "Skincare",           href: "/shop?category=skincare" },
  { label: "Makeup",             href: "/shop?category=makeup" },
  { label: "Hair",               href: "/shop?category=hair" },
  { label: "Body & Bath",        href: "/shop?category=body-bath" },
  { label: "Gifts",              href: "/shop?category=gift-sets" },
];

export default function Header() {
  const { lines, toggle: toggleCart } = useCart();
  const { setCommandOpen, setMobileMenuOpen } = useUI();
  const cartCount = lines.reduce((t, l) => t + l.qty, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-bg)] border-b border-[var(--color-line)]">

      {/* Announcement bar */}
      <div className="bg-[var(--color-accent)] px-4 py-2 text-center text-[10px] md:text-xs font-semibold text-[var(--color-accent-contrast)] tracking-widest uppercase">
        Free delivery across Egypt on orders over EGP 1,500
      </div>

      {/* Main header */}
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8">
        <div className="flex h-20 md:h-28 items-center justify-between gap-4">

          <Link to="/" className="flex shrink-0 items-center h-full py-1" aria-label="H STORE home">
            <Logo className="text-2xl md:text-3xl lg:text-[2rem]" />
          </Link>

          {/* Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative mx-4">
            <input
              type="text"
              placeholder="Search fragrance, skincare, makeup…"
              className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] py-2 pl-4 pr-10 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-ink-muted)]"
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setCommandOpen(true)}
              className="md:hidden text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 transition-colors"
            >
              <Search size={22} />
            </button>
            <Link
              to="/wishlist"
              className="hidden md:block text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 transition-colors"
            >
              <Heart size={22} />
            </Link>
            <button
              onClick={toggleCart}
              className="relative text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1 transition-colors"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-[var(--color-accent-contrast)]">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-[var(--color-ink-soft)] p-1"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Category nav (desktop) */}
        <nav className="hidden lg:flex items-center gap-6 py-3 overflow-x-auto hide-scrollbar">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm font-medium whitespace-nowrap text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
