import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { useCart, useWishlist } from "../store";
import { useUI } from "../ui";
import logoImg from "../assets/logo.jpg"; 

const NAV = [
  "Black Friday", "New & Bestsellers", "Skincare", "K-Beauty", "Hair", "Fragrance", "Body & Wellbeing", "Makeup", "Brands"
];

export default function Header() {
  const { lines, toggle: toggleCart } = useCart();
  const { setCommandOpen, setMobileMenuOpen } = useUI();
  const cartCount = lines.reduce((t, l) => t + l.qty, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      
      {/* Announcement Bar */}
      <div className="bg-[#D9385E] px-4 py-2 text-center text-[10px] md:text-xs font-semibold text-white tracking-wide">
        BLACK FRIDAY SALE · UP TO 70% OFF! <Link to="/shop" className="underline ml-1">Shop Now</Link>
      </div>

      {/* Main Header */}
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center h-full py-2">
            <img 
              src={logoImg} 
              alt="HOSSAM Pharmacy" 
              className="h-10 md:h-14 lg:h-16 w-auto object-contain"
            />
          </Link>

          {/* Gender Tabs (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center border border-gray-200 rounded-md overflow-hidden ml-2">
            <button className="bg-gray-100 px-6 py-2 text-sm font-bold text-black border-r border-gray-200 hover:bg-gray-200 transition-colors">WOMEN</button>
            <button className="bg-white px-6 py-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">MEN</button>
          </div>

          {/* Search Bar (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative mx-4">
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm text-black outline-none focus:border-black focus:bg-white transition-colors"
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => setCommandOpen(true)} className="md:hidden text-gray-600 p-1"><Search size={22} /></button>
            <Link to="/wishlist" className="hidden md:block text-gray-600 hover:text-black transition-colors p-1"><User size={22} /></Link>
            <button onClick={toggleCart} className="relative text-gray-600 hover:text-black transition-colors p-1">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D9385E] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-gray-600 p-1"><Menu size={24} /></button>
          </div>
        </div>

        {/* Categories Nav (Hidden on Mobile) */}
        <nav className="hidden lg:flex items-center gap-6 py-3 overflow-x-auto hide-scrollbar">
          {NAV.map((item) => (
            <Link 
              key={item} 
              to={item === "Black Friday" ? "/shop?on_sale=true" : "/shop"}
              className={`text-sm font-medium whitespace-nowrap transition-colors ${item === "Black Friday" ? "text-[#D9385E]" : "text-gray-700 hover:text-black"}`}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}