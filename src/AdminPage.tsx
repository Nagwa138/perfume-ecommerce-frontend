import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, TrendingUp, Clock, RefreshCw, Plus, BarChart2 } from "lucide-react";
import {
  getProducts, getAdminOrders, updateOrderStatus, getAnalytics, adminCreateProduct, fmtEGP,
  type Product, type AdminOrder, type Analytics, type ProductDraft,
} from "./api";
import ChatWidget from "./ChatWidget";

type Tab = "products" | "orders" | "dashboard";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  shipped:   "bg-purple-500/15 text-purple-400 border-purple-500/30",
  delivered: "bg-success/15 text-success border-success/30",
  cancelled: "bg-sale/15 text-sale border-sale/30",
};

const STATUS_OPTS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const PAY_LABELS: Record<string, string> = {
  cod: "Cash on Delivery", card: "Credit Card",
  apple_pay: "Apple Pay", vodafone_cash: "Vodafone Cash",
  fawry: "Fawry", instapay: "InstaPay", meeza: "Meeza",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-zinc-800 text-zinc-400"}`}>
      {status}
    </span>
  );
}

function OrderModal({
  order, onClose, onStatusChange,
}: {
  order: AdminOrder;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateOrderStatus(order.id, status);
    onStatusChange(order.id, status);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h3 className="font-display text-xl font-bold text-white">Order #{order.id}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date(order.created_at).toLocaleString("en-EG")}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full border border-zinc-800 p-1.5 text-zinc-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          {/* Customer info */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Customer</p>
              <p className="mt-1 text-sm font-semibold text-white">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email</p>
              <p className="mt-1 text-sm text-zinc-300 break-all">{order.customer_email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Phone</p>
              <p className="mt-1 text-sm text-zinc-300">{order.customer_phone || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Payment</p>
              <p className="mt-1 text-sm text-zinc-300">{PAY_LABELS[order.payment_method] ?? order.payment_method}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Address</p>
              <p className="mt-1 text-sm text-zinc-300">{order.customer_address || "—"}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.product_name}</p>
                    <p className="text-xs text-zinc-500">
                      {item.size_ml > 0 ? `${item.size_ml} ml` : ""}
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <p className="text-sm font-bold text-white">×{item.qty}</p>
                    <p className="text-xs text-zinc-500">{fmtEGP(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span><span>{fmtEGP(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                <span>−{fmtEGP(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : fmtEGP(order.shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold text-white">
              <span>Total</span>
              <span className="text-accent">{fmtEGP(order.total)}</span>
            </div>
          </div>

          {/* Status update */}
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none capitalize"
            >
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <button
              onClick={save}
              disabled={saving || status === order.status}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-2 disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : "Update Status"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Product creation form (slide-in) ─────────────────────────────────────────

const PRODUCT_TYPES = ["perfume", "skincare", "makeup", "haircare", "body"] as const;
const FAMILIES = ["Floral","Woody","Oriental/Amber","Fresh/Aquatic","Citrus","Gourmand","Aromatic","Leather","Musk"];
const CONCS    = ["Parfum","Eau de Parfum","Eau de Toilette","Eau de Cologne"];
const CAP_STYLES = ["round", "square", "tall"];

function ProductForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [draft, setDraft] = useState<ProductDraft>({
    name: "", brand: "", product_type: "perfume", subcategory: "",
    gender: "Unisex", description: "", bottle_color: "#C8A951", cap_style: "round",
    longevity: 5, sillage: 5,
    sizes: [{ ml: 50, price: 65, stock: 20 }],
    variants: [],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof ProductDraft, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  const pt = draft.product_type;

  const addSize    = () => set("sizes",    [...(draft.sizes ?? []),    { ml: 100, price: 80, stock: 15 }]);
  const removeSize = (i: number) => set("sizes", (draft.sizes ?? []).filter((_, j) => j !== i));
  const setSize    = (i: number, k: string, v: string | number) =>
    set("sizes", (draft.sizes ?? []).map((s, j) => j === i ? { ...s, [k]: k === "ml" || k === "stock" ? Number(v) : v } : s));

  const addShade    = () => set("variants", [...(draft.variants ?? []), { name: "Shade", shade_hex: "#c0392b", stock: 10 }]);
  const removeShade = (i: number) => set("variants", (draft.variants ?? []).filter((_, j) => j !== i));
  const setShade    = (i: number, k: string, v: string | number) =>
    set("variants", (draft.variants ?? []).map((s, j) => j === i ? { ...s, [k]: k === "stock" ? Number(v) : v } : s));

  const save = async () => {
    if (!draft.name.trim() || !draft.brand.trim()) { setErr("Name and brand are required."); return; }
    setSaving(true); setErr("");
    const res = await adminCreateProduct(draft);
    setSaving(false);
    if (!res) { setErr("Failed to create product. Check server logs."); return; }
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="relative z-10 h-full w-full max-w-lg overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">New Product</h2>
          <button onClick={onClose} className="rounded-full border border-zinc-800 p-1.5 text-zinc-400 hover:text-white">
            <X size={15} />
          </button>
        </div>

        {err && <p className="mb-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{err}</p>}

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="label-xs">Product Type</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((t) => (
                <button key={t} onClick={() => set("product_type", t)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                    pt === t ? "border-accent bg-accent/15 text-accent" : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Core fields */}
          {[
            { k: "name",        label: "Product Name", ph: "e.g. Rose Elixir" },
            { k: "brand",       label: "Brand",        ph: "e.g. Hossam" },
            { k: "subcategory", label: "Subcategory",  ph: pt === "perfume" ? "e.g. Eau de Parfum" : "e.g. Serum" },
          ].map(({ k, label, ph }) => (
            <div key={k}>
              <label className="label-xs">{label}</label>
              <input value={(draft as Record<string, unknown>)[k] as string ?? ""}
                onChange={(e) => set(k as keyof ProductDraft, e.target.value)}
                placeholder={ph}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none" />
            </div>
          ))}

          <div>
            <label className="label-xs">Description</label>
            <textarea value={draft.description ?? ""} onChange={(e) => set("description", e.target.value)}
              rows={3} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none resize-none" />
          </div>

          {/* Fragrance-specific */}
          {pt === "perfume" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Family</label>
                  <select value={draft.family ?? ""} onChange={(e) => set("family", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none">
                    <option value="">—</option>
                    {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Concentration</label>
                  <select value={draft.concentration ?? ""} onChange={(e) => set("concentration", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none">
                    <option value="">—</option>
                    {CONCS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Bottle colour</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="color" value={draft.bottle_color ?? "#C8A951"} onChange={(e) => set("bottle_color", e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <span className="font-mono text-xs text-zinc-400">{draft.bottle_color}</span>
                  </div>
                </div>
                <div>
                  <label className="label-xs">Cap style</label>
                  <select value={draft.cap_style ?? "round"} onChange={(e) => set("cap_style", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none">
                    {CAP_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Makeup shades */}
          {pt === "makeup" && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="label-xs">Shades / Variants</label>
                <button onClick={addShade} className="text-xs text-accent hover:underline">+ Add shade</button>
              </div>
              <div className="space-y-2">
                {(draft.variants ?? []).map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="color" value={v.shade_hex} onChange={(e) => setShade(i, "shade_hex", e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <input value={v.name} onChange={(e) => setShade(i, "name", e.target.value)}
                      placeholder="Shade name" className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-accent focus:outline-none" />
                    <input type="number" value={v.stock} onChange={(e) => setShade(i, "stock", e.target.value)}
                      min={0} className="w-16 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-accent focus:outline-none" />
                    <button onClick={() => removeShade(i)} className="text-zinc-600 hover:text-red-400"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skincare/haircare/body extras */}
          {(pt === "skincare" || pt === "haircare" || pt === "body") && (
            <>
              <div>
                <label className="label-xs">Key Ingredients</label>
                <textarea value={draft.ingredients ?? ""} onChange={(e) => set("ingredients", e.target.value)}
                  rows={2} placeholder="Hyaluronic Acid, Niacinamide..."
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none resize-none" />
              </div>
              <div>
                <label className="label-xs">How to Use</label>
                <textarea value={draft.how_to_use ?? ""} onChange={(e) => set("how_to_use", e.target.value)}
                  rows={2} placeholder="Apply morning and evening..."
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none resize-none" />
              </div>
            </>
          )}

          {/* Sizes */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label-xs">Sizes (ml · price USD · stock)</label>
              <button onClick={addSize} className="text-xs text-accent hover:underline">+ Add size</button>
            </div>
            <div className="space-y-2">
              {(draft.sizes ?? []).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="number" value={s.ml} onChange={(e) => setSize(i, "ml", e.target.value)}
                    min={1} placeholder="ml" className="w-16 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-accent focus:outline-none" />
                  <input type="number" value={s.price} onChange={(e) => setSize(i, "price", e.target.value)}
                    min={0} step={0.01} placeholder="$" className="w-20 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-accent focus:outline-none" />
                  <input type="number" value={s.stock} onChange={(e) => setSize(i, "stock", e.target.value)}
                    min={0} placeholder="qty" className="w-16 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-accent focus:outline-none" />
                  <button onClick={() => removeSize(i)} className="text-zinc-600 hover:text-red-400"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="mt-2 w-full rounded-lg bg-accent py-3 text-sm font-bold text-white hover:bg-accent-2 disabled:opacity-50 transition-colors">
            {saving ? "Creating…" : "Create Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Analytics dashboard ───────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  perfume: "#C8A951", skincare: "#a0c4b8", makeup: "#d4a0a0", haircare: "#b8a0d4", body: "#a0c4c8",
};

function AnalyticsDashboard({ data }: { data: Analytics }) {
  const types   = Object.entries(data.revenue_by_type).sort((a, b) => b[1] - a[1]);
  const maxRev  = Math.max(...types.map(([, v]) => v), 1);
  const statuses = Object.entries(data.orders_by_status);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue",  value: fmtEGP(data.total_revenue), icon: <TrendingUp size={18} />, color: "text-success" },
          { label: "Total Orders",   value: data.total_orders,           icon: <Package size={18} />,    color: "text-blue-400" },
          { label: "Product Types",  value: types.length,                icon: <BarChart2 size={18} />,  color: "text-accent" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className={`mb-2 ${color}`}>{icon}</div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue by type */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-5 text-sm font-bold text-zinc-300">Revenue by Category</h3>
        <div className="space-y-3">
          {types.map(([type, rev]) => (
            <div key={type} className="flex items-center gap-3">
              <span className="w-20 text-xs capitalize text-zinc-400">{type}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-zinc-800 h-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: TYPE_COLOR[type] ?? "#C8A951" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(rev / maxRev) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
              <span className="w-28 text-right text-xs font-semibold text-white">{fmtEGP(rev)}</span>
            </div>
          ))}
          {types.length === 0 && <p className="text-xs text-zinc-600">No sales data yet.</p>}
        </div>
      </div>

      {/* Orders by status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-bold text-zinc-300">Orders by Status</h3>
          <div className="space-y-2">
            {statuses.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-zinc-400">{status}</span>
                <span className="font-bold text-white">{count}</span>
              </div>
            ))}
            {statuses.length === 0 && <p className="text-xs text-zinc-600">No orders yet.</p>}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-bold text-zinc-300">Top Products</h3>
          <div className="space-y-2">
            {data.top_products.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-xs text-zinc-600">{i + 1}</span>
                <span className="flex-1 truncate text-zinc-300">{p.name}</span>
                <span className="shrink-0 text-xs font-bold text-white">{p.units} sold</span>
              </div>
            ))}
            {data.top_products.length === 0 && <p className="text-xs text-zinc-600">No sales yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadProducts = () => getProducts().then((page) => setProducts(page.items));
  const loadOrders = async () => {
    setLoadingOrders(true);
    const data = await getAdminOrders();
    setOrders(data);
    setLoadingOrders(false);
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { if (tab === "orders") loadOrders(); }, [tab]);
  useEffect(() => {
    if (tab === "dashboard") getAnalytics().then(setAnalytics);
  }, [tab]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const handleStatusChange = (id: number, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selectedOrder?.id === id) setSelectedOrder((o) => o ? { ...o, status } : null);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-28">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your store catalog and orders.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-zinc-800">
        {(["products", "orders", "dashboard"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-5 py-3 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
            {t === "orders" && pendingCount > 0 && tab !== "orders" && (
              <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
            {tab === t && (
              <motion.div layoutId="admin-tab-line" className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── PRODUCTS TAB ────────────────────────────────────────────────── */}
        {tab === "products" && (
          <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">{products.length} products</p>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/8 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/15 transition-colors">
                <Plus size={13} /> New Product
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="p-3 font-semibold text-zinc-400">ID</th>
                    <th className="p-3 font-semibold text-zinc-400">Name</th>
                    <th className="p-3 font-semibold text-zinc-400">Type</th>
                    <th className="p-3 font-semibold text-zinc-400">From</th>
                    <th className="p-3 font-semibold text-zinc-400">In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3 text-zinc-500">{p.id}</td>
                      <td className="p-3 font-medium text-white">{p.name}</td>
                      <td className="p-3 text-zinc-400 capitalize">{p.product_type}</td>
                      <td className="p-3 text-zinc-300">{fmtEGP(p.sale_price ?? (p.sizes?.[0]?.price ?? 0))}</td>
                      <td className="p-3">
                        {(() => {
                          const st = (p.sizes ?? []).reduce((s, sz) => s + sz.stock, 0);
                          return <span className={`font-semibold ${st === 0 ? "text-sale" : st < 5 ? "text-orange-400" : "text-success"}`}>{st}</span>;
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ChatWidget onChange={loadProducts} />
          </motion.div>
        )}

        {/* ── ORDERS TAB ───────────────────────────────────────────────────── */}
        {tab === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              {[
                { icon: <Package size={18} />, label: "Total Orders", value: orders.length, color: "text-blue-400" },
                { icon: <TrendingUp size={18} />, label: "Total Revenue", value: fmtEGP(totalRevenue), color: "text-success" },
                { icon: <Clock size={18} />, label: "Pending", value: pendingCount, color: "text-yellow-400" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className={`mb-2 ${color}`}>{icon}</div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">{orders.length} orders</p>
              <button
                onClick={loadOrders}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
              >
                <RefreshCw size={12} className={loadingOrders ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {orders.length === 0 && !loadingOrders ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 py-20 text-center">
                <Package size={36} className="text-zinc-700" />
                <p className="mt-4 font-semibold text-zinc-400">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-zinc-900">
                    <tr className="border-b border-zinc-800">
                      {["Order", "Customer", "Phone", "Payment", "Total", "Status", "Date"].map((h) => (
                        <th key={h} className="p-3 font-semibold text-zinc-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className="cursor-pointer border-t border-zinc-800 hover:bg-zinc-900/60 transition-colors"
                      >
                        <td className="p-3 font-mono text-zinc-400">#{o.id}</td>
                        <td className="p-3 font-medium text-white max-w-[160px] truncate">{o.customer_name}</td>
                        <td className="p-3 text-zinc-400">{o.customer_phone || "—"}</td>
                        <td className="p-3 text-zinc-400 text-xs">{PAY_LABELS[o.payment_method] ?? o.payment_method}</td>
                        <td className="p-3 font-semibold text-accent">{fmtEGP(o.total)}</td>
                        <td className="p-3"><StatusBadge status={o.status} /></td>
                        <td className="p-3 text-xs text-zinc-500">
                          {new Date(o.created_at).toLocaleDateString("en-EG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ── DASHBOARD TAB ────────────────────────────────────────────────── */}
        {tab === "dashboard" && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {analytics ? (
              <AnalyticsDashboard data={analytics} />
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product form drawer */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            onClose={() => setShowForm(false)}
            onCreated={loadProducts}
          />
        )}
      </AnimatePresence>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal
            key={selectedOrder.id}
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
