import StreetHero from "./hero/StreetHero";
import ProductGrid from "./ProductGrid";
import RecentlyViewed from "./RecentlyViewed";

export default function Home() {
  return (
    <>
      <StreetHero />
      <ProductGrid />
      <RecentlyViewed />
    </>
  );
}
