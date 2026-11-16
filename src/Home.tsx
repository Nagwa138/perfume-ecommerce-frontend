import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, type Product } from "./api";
import ProductCard from "./ProductCard";
import RecentlyViewed from "./RecentlyViewed";

const HERO_IMAGE = "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1600&auto=format&fit=crop";

export default function Home() {
  const [_featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ sort: "popular", page_size: 8 }).then((d) => setFeatured(d.items));
    getProducts({ sort: "newest", page_size: 8 }).then((d) => setNewArrivals(d.items));
  }, []);

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#111] overflow-x-hidden">
      
      {/* 1. Promotional Hero Banner */}
      <section className="relative w-full bg-[#F9D8E0]">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-center min-h-[400px] md:min-h-[500px]">
          {/* Text Side */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center z-10 bg-[#F9D8E0]">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#D9385E] mb-2">Taya's Picks</p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 text-black">
              Taya's Must-Have Beauty Favorites.
            </h1>
            <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-md">
              From everyday essentials to standout finds, explore the products she loves and thinks you will too!
            </p>
            <Link to="/shop" className="bg-black text-white px-6 md:px-8 py-3 rounded-full font-bold text-sm md:text-base w-fit hover:bg-gray-800 transition-colors">
              Shop Taya's Picks
            </Link>
          </div>
          
          {/* Image Side */}
          <div className="w-full md:w-1/2 h-[300px] md:h-[500px] relative">
            <img src={HERO_IMAGE} alt="Beauty Model" className="w-full h-full object-cover" />
          </div>
        </div>
        
        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          <div className="h-2 w-2 rounded-full bg-black"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        </div>
      </section>

      {/* 2. Deals Selling Fast (Product Rail) */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-black">Deals selling fast</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Our bestsellers, now on sale</p>
          </div>
          <Link to="/shop?on_sale=true" className="text-xs md:text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[#D9385E]">
            View All
          </Link>
        </div>
        
        {/* Horizontal Scroll Rail - Fixed width for mobile, wider for desktop */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x">
          {newArrivals.slice(0, 6).map((p, i) => (
            <div key={p.id} className="w-[160px] md:w-[240px] shrink-0 snap-start">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Shop the Sale (Pink Promo Grid) */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16 bg-white">
        <h2 className="text-xl md:text-2xl font-extrabold text-black mb-6 md:mb-8">Shop the sale</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Card 1 */}
          <Link to="/shop?product_type=skincare" className="promo-card p-6 md:p-8 flex flex-col justify-between h-[360px] md:h-[400px] relative overflow-hidden group">
            <div className="z-10 relative">
              <h3 className="text-xl md:text-2xl font-extrabold text-black mb-1 md:mb-2">THE SKINCARE GIRL</h3>
              <p className="text-xs md:text-sm text-gray-700 italic font-serif mb-3 md:mb-4">Beauty Kit</p>
              <ul className="text-xs md:text-sm font-medium text-gray-800 space-y-1 mb-4 md:mb-6">
                <li>+ Hydrate</li>
                <li>+ Repair</li>
                <li>+ Healthy Glow</li>
              </ul>
              <div className="bg-black text-white text-[9px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full w-fit">Black Friday UP TO 70% OFF</div>
            </div>
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[url('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center rounded-tl-full opacity-80 group-hover:scale-105 transition-transform duration-500"></div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
               <span className="bg-black text-white text-[10px] md:text-xs font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-full whitespace-nowrap">SHOP SKINCARE</span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link to="/shop?product_type=makeup" className="promo-card p-6 md:p-8 flex flex-col justify-between h-[360px] md:h-[400px] relative overflow-hidden group">
             <div className="z-10 relative">
              <h3 className="text-xl md:text-2xl font-extrabold text-black mb-1 md:mb-2">THE NIGHT OUT GIRL</h3>
              <p className="text-xs md:text-sm text-gray-700 italic font-serif mb-3 md:mb-4">Beauty Kit</p>
              <ul className="text-xs md:text-sm font-medium text-gray-800 space-y-1 mb-4 md:mb-6">
                <li>+ Effortless</li>
                <li>+ Polished</li>
                <li>+ Always on the go</li>
              </ul>
              <div className="bg-black text-white text-[9px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full w-fit">Black Friday UP TO 70% OFF</div>
            </div>
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center rounded-tl-full opacity-80 group-hover:scale-105 transition-transform duration-500"></div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
               <span className="bg-black text-white text-[10px] md:text-xs font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-full whitespace-nowrap">SHOP MAKEUP</span>
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/shop?product_type=haircare" className="promo-card p-6 md:p-8 flex flex-col justify-between h-[360px] md:h-[400px] relative overflow-hidden group md:col-span-2 lg:col-span-1">
             <div className="z-10 relative">
              <h3 className="text-xl md:text-2xl font-extrabold text-black mb-1 md:mb-2">THE HEALTHY HAIR GIRL</h3>
              <p className="text-xs md:text-sm text-gray-700 italic font-serif mb-3 md:mb-4">Beauty Kit</p>
              <ul className="text-xs md:text-sm font-medium text-gray-800 space-y-1 mb-4 md:mb-6">
                <li>+ Hydrated</li>
                <li>+ Fresh</li>
                <li>+ Natural glow</li>
              </ul>
              <div className="bg-black text-white text-[9px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full w-fit">Black Friday UP TO 70% OFF</div>
            </div>
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center rounded-tl-full opacity-80 group-hover:scale-105 transition-transform duration-500"></div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
               <span className="bg-black text-white text-[10px] md:text-xs font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-full whitespace-nowrap">SHOP HAIRCARE</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Shop by Budget */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16">
        <h2 className="text-xl md:text-2xl font-extrabold text-black mb-6 md:mb-8">Shop by budget</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[500, 1000, 1500].map((price, i) => (
            <div key={i} className="bg-[#F9D8E0] rounded-2xl p-6 md:p-10 flex flex-col items-center text-center">
              <p className="font-serif italic text-lg md:text-xl text-[#D9385E] mb-2">
                {i === 0 ? "Little Beauty Finds" : i === 1 ? "Everyday Favorites" : "Treat Yourself"}
              </p>
              <h3 className="text-2xl md:text-4xl font-extrabold text-black mb-3 md:mb-4">UNDER {price} <span className="text-base md:text-xl">EGP</span></h3>
              <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gray-700 mb-6 md:mb-8">
                {i === 0 ? "Small prices. Big finds." : i === 1 ? "Everyday favorites, within reach." : "More beauty. More savings."}
              </p>
              <Link to={`/shop?max_price=${price}`} className="mt-auto bg-black text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold hover:bg-gray-800 transition-colors">
                Shop the sale
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Shop by Concern (Grid) */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16 bg-white">
        <h2 className="text-xl md:text-2xl font-extrabold text-black mb-6 md:mb-8">Shop by concern</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {[
            { title: "HAIR LOSS", desc: "Fuller hair starts here." },
            { title: "DARK SPOTS & BLEMISHES", desc: "Your brighter-skin edit." },
            { title: "ACNE & PORES", desc: "Keep pores in check." },
            { title: "FINE LINES & FIRMING", desc: "Smooth. Firm. Glow." },
            { title: "DRY & SENSITIVE", desc: "Calm. Comfort. Hydrate." },
            { title: "LASHES & BROWS", desc: "Your lash & brow boost." },
          ].map((concern, i) => (
            <Link key={i} to="/shop" className="bg-[#F9D8E0] rounded-xl p-5 md:p-6 flex flex-col justify-center min-h-[140px] md:min-h-[200px] relative overflow-hidden group">
              <div className="z-10 max-w-[70%] md:max-w-[60%]">
                <h3 className="text-base md:text-xl font-extrabold text-black mb-1">{concern.title}</h3>
                <p className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase mb-3 md:mb-4">{concern.desc}</p>
                <span className="bg-black text-white text-[9px] md:text-[10px] font-bold px-3 md:px-4 py-1.5 rounded-full inline-block">Shop the sale</span>
              </div>
              {/* Decorative imagery */}
              <div className="absolute right-0 bottom-0 w-2/5 md:w-1/2 h-full opacity-80 group-hover:scale-105 transition-transform duration-500 bg-contain bg-no-repeat bg-right-bottom" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop')` }}></div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Brands on Sale */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-16">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-extrabold text-black">Brands on sale</h2>
          <Link to="/brands" className="text-xs md:text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[#D9385E]">All Brands</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-gray-200">
          {["QUEEN BY LORD", "BLUMIN' KAKTUS", "CAPIXY", "SHEGLAM", "VACATION", "LOCKEN", "THE BATH LAND", "SESH", "HELMADERM", "PLUMPY CURLS", "NFRY", "DERMACY LABS"].map((brand) => (
            <Link key={brand} to="/shop" className="border-r border-b border-gray-200 p-4 md:p-8 flex items-center justify-center text-center hover:bg-gray-50 transition-colors">
              <span className="text-[10px] md:text-sm font-bold tracking-[0.2em] text-gray-800 uppercase">{brand}</span>
            </Link>
          ))}
        </div>
      </section>

      <RecentlyViewed />
      
    </div>
  );
}