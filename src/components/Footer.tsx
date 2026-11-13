import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../brand";

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function PinterestIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );
}

const LINKS = {
  "Beauty": [
    { label: "Fragrance",          to: "/shop?product_type=perfume" },
    { label: "Skincare",           to: "/shop?product_type=skincare" },
    { label: "Makeup",             to: "/shop?product_type=makeup" },
    { label: "Hair",               to: "/shop?product_type=haircare" },
    { label: "Body & Bath",        to: "/shop?product_type=body" },
    { label: "Gift Sets",          to: "/shop?product_type=gift_set" },
    { label: "Pharmacy",           to: "/shop?product_type=pharmacy" },
  ],
  "Discover": [
    { label: "New Arrivals",  to: "/shop?sort=newest" },
    { label: "Best Sellers",  to: "/shop?sort=popular" },
    { label: "On Sale",       to: "/shop?on_sale=true" },
    { label: "Gift Sets",     to: "/shop?collection=Gift+Sets" },
  ],
  "Support": [
    { label: "FAQ",               to: "/faq" },
    { label: "Shipping & Returns", to: "/shipping" },
    { label: "Track Order",       to: "/orders" },
    { label: "Contact",           to: "/contact" },
  ],
};

const PAYMENT = ["VISA", "MC", "AMEX", "PayPal", "Apple Pay"];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(""); }
  };

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-2xl font-bold tracking-[0.25em]">
              {BRAND.nameUpper}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {BRAND.tagline} — luxury beauty curated for those who appreciate the art of scent and skincare.
              Refined rituals, extraordinary results.
            </p>
            <div className="mt-6 flex gap-5">
              <a href="#" aria-label="Instagram" className="text-muted transition-colors hover:text-white">
                <InstagramIcon size={20} />
              </a>
              <a href="#" aria-label="Twitter / X" className="text-muted transition-colors hover:text-white">
                <TwitterIcon size={20} />
              </a>
              <a href="#" aria-label="Pinterest" className="text-muted transition-colors hover:text-white">
                <PinterestIcon size={20} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([col, links]) => (
            <div key={col}>
              <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
                {col}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-muted transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-14 rounded-2xl border border-border bg-surface-2 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="font-display text-xl font-bold tracking-wide">
                The Inner Circle
              </h4>
              <p className="mt-1 text-sm text-muted">
                New launches, exclusive edits &amp; members-only offers.
              </p>
            </div>
            {submitted ? (
              <p className="text-sm font-medium text-success">Welcome to {BRAND.name}. Luxury awaits.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full gap-2 sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none placeholder:text-muted focus:border-accent sm:w-56 sm:flex-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name} Beauty. All rights reserved.</p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <Link key={l} to={`/${l.toLowerCase()}`} className="transition-colors hover:text-white">
                {l}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PAYMENT.map((p) => (
              <span key={p} className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted/70">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
