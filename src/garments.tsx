import { Link } from "react-router-dom";
import { fmtEGP, type Product } from "./api";

type GarmentProps = {
  product: Product;
  onAdd: (p: Product) => void;
};

export function Garment({ product: p, onAdd }: GarmentProps) {
  const img   = p.images?.[0] ?? "";
  const price = p.sale_price ?? (p.sizes?.[0]?.price ?? 0);
  const stock = (p.sizes ?? []).reduce((s, sz) => s + sz.stock, 0);

  return (
    <div className="group">
      <Link to={`/product/${p.slug || p.id}`}>
        {img ? (
          <img src={img} loading="lazy" decoding="async" alt={p.name}
            className="aspect-[4/5] w-full rounded-xl object-cover transition group-hover:scale-[1.02]" />
        ) : (
          <div className="aspect-[4/5] w-full rounded-xl bg-surface-2" />
        )}
        <div className="mt-2 text-sm text-white/50 capitalize">{p.product_type}</div>
        <div className="font-semibold">{p.name}</div>
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <span>{fmtEGP(price)}</span>
        <button disabled={stock < 1} onClick={() => onAdd(p)}
          className="rounded bg-white px-3 py-1 text-xs font-semibold text-black disabled:opacity-40">
          {stock < 1 ? "Sold out" : "Add"}
        </button>
      </div>
    </div>
  );
}
