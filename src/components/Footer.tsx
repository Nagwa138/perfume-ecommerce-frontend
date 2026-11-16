import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../brand";
import { Smile, DollarSign, Package } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(""); }
  };

  return (
    <footer className="bg-[#FAFAFA] border-t border-gray-200 pt-16 pb-10">
      
      {/* Trust Bar */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-b border-gray-200 pb-12">
          <div className="flex flex-col items-center">
            <Smile size={32} className="text-[#D9385E] mb-3" strokeWidth={1.5} />
            <h4 className="font-bold text-black mb-1">100% authentic</h4>
            <p className="text-sm text-gray-500">Sourced from the brands</p>
          </div>
          <div className="flex flex-col items-center">
            <DollarSign size={32} className="text-[#D9385E] mb-3" strokeWidth={1.5} />
            <h4 className="font-bold text-black mb-1">Cash on delivery</h4>
            <p className="text-sm text-gray-500">Or pay securely online</p>
          </div>
          <div className="flex flex-col items-center">
            <Package size={32} className="text-[#D9385E] mb-3" strokeWidth={1.5} />
            <h4 className="font-bold text-black mb-1">Free delivery</h4>
            <p className="text-sm text-gray-500">On orders over EGP 999</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 mb-12">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <span className="text-2xl font-extrabold tracking-[0.1em] text-black block mb-4">
              {BRAND.nameUpper}
            </span>
            <h4 className="text-xl font-bold text-black mb-2">Join Our Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Sign up to our newsletter & receive 10% off your first order.</p>
            {submitted ? (
              <p className="text-sm font-bold text-[#2E7D32]">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-black outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-black">By Category</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/shop?product_type=perfume" className="hover:text-black">Fragrance</Link></li>
              <li><Link to="/shop?product_type=skincare" className="hover:text-black">Skincare</Link></li>
              <li><Link to="/shop?product_type=makeup" className="hover:text-black">Makeup</Link></li>
              <li><Link to="/shop?product_type=haircare" className="hover:text-black">Hair</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-black">Customer Account</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/account" className="hover:text-black">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-black">Order & Tracking</Link></li>
              <li><Link to="/wishlist" className="hover:text-black">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-black">About Us</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-black">About HOSSAM</Link></li>
              <li><Link to="/contact" className="hover:text-black">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-black">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-6 flex flex-col items-center justify-between gap-4 text-xs text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="font-bold">VISA</span>
            <span className="font-bold">Mastercard</span>
            <span className="font-bold">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}