import { Link } from "react-router-dom";
import type { Product } from "./api";

type GarmentProps = {
  product: Product;
  onAdd: (p: Product) => void;
};

export function Garment({ product: p, onAdd }: GarmentProps) {
  return (
    <div className="group">
      <Link to={`/product/${p.id}`}>
        <img
          src={p.image.replace("/600/760", "/360/450")}
          loading="lazy"
          decoding="async"
          alt={p.name}
          className="aspect-[4/5] w-full rounded-xl object-cover transition group-hover:scale-[1.02]"
        />
        <div className="mt-2 text-sm text-white/50">{p.category}</div>
        <div className="font-semibold">{p.name}</div>
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <span>${p.price}</span>
        <button
          disabled={p.stock < 1}
          onClick={() => onAdd(p)}
          className="rounded bg-white px-3 py-1 text-xs font-semibold text-black disabled:opacity-40"
        >
          {p.stock < 1 ? "Sold out" : "Add"}
        </button>
      </div>
    </div>
  );
}
