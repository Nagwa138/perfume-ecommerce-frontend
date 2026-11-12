import { useState } from "react";
import { Link } from "react-router-dom";

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

function YoutubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

const LINKS = {
  Shop: [
    { label: "All Products", to: "/shop" },
    { label: "New Arrivals", to: "/shop?sort=newest" },
    { label: "Sale", to: "/shop?on_sale=true" },
    { label: "Hoodies", to: "/shop?category=Hoodies" },
    { label: "Sneakers", to: "/shop?category=Sneakers" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Blog", to: "/blog" },
    { label: "Press", to: "/press" },
  ],
  Support: [
    { label: "FAQ", to: "/faq" },
    { label: "Shipping & Returns", to: "/shipping" },
    { label: "Track Order", to: "/orders" },
    { label: "Contact", to: "/contact" },
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
        {/* Main grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-2xl font-bold tracking-widest">
              NOVA WEAR
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Premium streetwear designed for those who push limits.
              Crafted with intent, worn with purpose.
            </p>
            <div className="mt-6 flex gap-5">
              <a href="#" aria-label="Instagram" className="text-muted transition-colors hover:text-white">
                <InstagramIcon size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-muted transition-colors hover:text-white">
                <TwitterIcon size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="text-muted transition-colors hover:text-white">
                <YoutubeIcon size={20} />
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
                    <Link
                      to={l.to}
                      className="text-sm text-muted transition-colors hover:text-white"
                    >
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
                Stay in the loop
              </h4>
              <p className="mt-1 text-sm text-muted">
                New drops, exclusive deals &amp; early access.
              </p>
            </div>
            {submitted ? (
              <p className="text-sm font-medium text-success">
                You&apos;re in! Check your inbox.
              </p>
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
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} NOVA WEAR. All rights reserved.</p>

          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <Link
                key={l}
                to={`/${l.toLowerCase()}`}
                className="transition-colors hover:text-white"
              >
                {l}
              </Link>
            ))}
          </div>

          {/* Payment icons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PAYMENT.map((p) => (
              <span
                key={p}
                className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted/70"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
