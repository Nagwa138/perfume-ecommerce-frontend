import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, TrendingUp, Clock, RefreshCw } from "lucide-react";
import {
  getProducts, getAdminOrders, updateOrderStatus, fmtEGP,
  type Product, type AdminOrder,
} from "./api";
import ChatWidget from "./ChatWidget";

type Tab = "products" | "orders";

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

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadProducts = () => getProducts().then((page) => setProducts(page.items));
  const loadOrders = async () => {
    setLoadingOrders(true);
    const data = await getAdminOrders();
    setOrders(data);
    setLoadingOrders(false);
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { if (tab === "orders") loadOrders(); }, [tab]);

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
        {(["products", "orders"] as Tab[]).map((t) => (
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
