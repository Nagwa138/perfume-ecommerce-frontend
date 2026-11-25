import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../brand";
import { Sparkles, ShieldCheck, Package } from "lucide-react";
import Logo from "./Logo";

const SHOP_LINKS = [
  { label: "Fragrance",          href: "/shop?category=fragrance" },
  { label: "Skincare",           href: "/shop?category=skincare" },
  { label: "Makeup",             href: "/shop?category=makeup" },
  { label: "Hair",               href: "/shop?category=hair" },
  { label: "Body & Bath",        href: "/shop?category=body-bath" },
  { label: "Gift Sets",          href: "/shop?category=gift-sets" },
];

const HOUSE_LINKS = [
  { label: "About the house", href: "/about" },
  { label: "Journal",         href: "/journal" },
  { label: "Contact",         href: "/contact" },
];

const CARE_LINKS = [
  { label: "Shipping & delivery", href: "/shipping" },
  { label: "Returns",             href: "/returns" },
  { label: "FAQ",                 href: "/faq" },
];

export default function Footer() {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(""); }
  };

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-line)] pt-16 pb-10">

      {/* Trust bar */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-b border-[var(--color-line)] pb-12">
          <div className="flex flex-col items-center">
            <ShieldCheck size={28} className="text-[var(--color-accent)] mb-3" strokeWidth={1.5} />
            <h4 className="font-bold text-[var(--color-ink)] mb-1">100% authentic</h4>
            <p className="text-sm text-[var(--color-ink-muted)]">Sourced directly from the brands</p>
          </div>
          <div className="flex flex-col items-center">
            <Package size={28} className="text-[var(--color-accent)] mb-3" strokeWidth={1.5} />
            <h4 className="font-bold text-[var(--color-ink)] mb-1">Free delivery across Egypt</h4>
            <p className="text-sm text-[var(--color-ink-muted)]">On orders over EGP 1,500</p>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles size={28} className="text-[var(--color-accent)] mb-3" strokeWidth={1.5} />
            <h4 className="font-bold text-[var(--color-ink)] mb-1">Curated by the house</h4>
            <p className="text-sm text-[var(--color-ink-muted)]">Every piece chosen with intention</p>
          </div>
        </div>
      </div>

      {/* Links + newsletter */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo className="text-xl" />
            </div>
            <p className="text-xs text-[var(--color-ink-muted)] mb-5 leading-relaxed">
              New arrivals, ritual edits, and notes from the house — a few times a month.
            </p>
            {submitted ? (
              <p className="text-sm font-medium text-[var(--color-success)]">You're on the list.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-ink-muted)]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-xs font-bold text-[var(--color-accent-contrast)] transition-colors hover:bg-[var(--color-accent-hover)]"
                >
                  Stay
                </button>
              </form>
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">Shop</h4>
            <ul className="space-y-2.5 text-sm text-[var(--color-ink-soft)]">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="hover:text-[var(--color-accent)] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The house */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">The House</h4>
            <ul className="space-y-2.5 text-sm text-[var(--color-ink-soft)]">
              {HOUSE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="hover:text-[var(--color-accent)] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Care */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">Care</h4>
            <ul className="space-y-2.5 text-sm text-[var(--color-ink-soft)]">
              {CARE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="hover:text-[var(--color-accent)] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--color-line)] pt-6 flex flex-col items-center justify-between gap-3 text-xs text-[var(--color-ink-muted)] md:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name} · {BRAND.tagline}</p>
          <p className="text-[var(--color-ink-muted)]">Shipping across Egypt · Free over EGP 1,500</p>
          <div className="flex gap-2">
            <span className="font-semibold text-[var(--color-ink-soft)]">EN</span>
            <span className="text-[var(--color-line)]">|</span>
            <span className="font-semibold text-[var(--color-ink-muted)] font-arabic">ع</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
