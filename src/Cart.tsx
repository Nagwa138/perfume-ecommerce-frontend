import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, Minus, Plus, Tag, Truck, Shield,
  Banknote, CreditCard, Smartphone, Wallet, Check,
  ShoppingBag, MapPin, Phone, Mail, User, Building,
} from "lucide-react";
import {
  createOrder, validateCoupon, fmtEGP,
  FREE_SHIPPING_USD, SHIPPING_USD,
} from "./api";
import { useCart } from "./store";

// ── Constants ─────────────────────────────────────────────────────────────────
const GOVERNORATES = [
  "Cairo","Giza","Alexandria","Aswan","Luxor",
  "Dakahlia","Gharbia","Monufia","Qalyubia","Sharqia",
  "Beheira","Kafr el-Sheikh","Damietta","Port Said",
  "Ismailia","Suez","Asyut","Sohag","Qena","Minya",
  "Beni Suef","Faiyum","Red Sea","South Sinai",
  "North Sinai","Matrouh","New Valley",
];

type Step = "cart" | "delivery" | "payment" | "done";
type PayType = "cod" | "card" | "apple_pay" | "vodafone" | "fawry" | "instapay" | "meeza";

type DeliveryForm = {
  name: string; email: string; phone: string;
  governorate: string; city: string; street: string; apartment: string;
};
const EMPTY_DELIVERY: DeliveryForm = {
  name: "", email: "", phone: "",
  governorate: "", city: "", street: "", apartment: "",
};

type CardForm = { number: string; holder: string; expiry: string; cvv: string; };
const EMPTY_CARD: CardForm = { number: "", holder: "", expiry: "", cvv: "" };

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ step }: { step: Step }) {
  const STEPS: Step[] = ["cart", "delivery", "payment"];
  const labels = ["Cart", "Delivery", "Payment"];
  const idx = STEPS.indexOf(step);
  if (idx < 0) return null;
  return (
    <div className="flex items-center justify-center gap-0 px-6 py-3">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
            i < idx ? "bg-accent text-white" :
            i === idx ? "bg-accent text-white ring-2 ring-accent/30" :
            "bg-zinc-800 text-zinc-500"
          }`}>
            {i < idx ? <Check size={12} /> : i + 1}
          </div>
          <span className={`ml-1.5 text-xs font-medium ${i === idx ? "text-white" : "text-zinc-500"}`}>
            {labels[i]}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`mx-3 h-px w-8 transition-colors ${i < idx ? "bg-accent" : "bg-zinc-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Payment method icons ──────────────────────────────────────────────────────
function PayMethodCard({
  type: _type, selected, onClick, icon, label, sublabel,
}: {
  type: PayType; selected: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; sublabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 transition-all text-left ${
        selected
          ? "border-accent bg-accent/10"
          : "border-zinc-800 hover:border-zinc-600 bg-zinc-900"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        selected ? "bg-accent/20" : "bg-zinc-800"
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{label}</p>
        <p className="text-xs text-zinc-500">{sublabel}</p>
      </div>
      <div className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
        selected ? "border-accent bg-accent" : "border-zinc-700"
      }`}>
        {selected && <Check size={10} className="text-white" />}
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Cart() {
  const { lines, open, remove, setQty, toggle, clear } = useCart();

  const [step, setStep] = useState<Step>("cart");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryForm>(EMPTY_DELIVERY);
  const [payType, setPayType] = useState<PayType>("cod");
  const [card, setCard] = useState<CardForm>(EMPTY_CARD);
  const [walletPhone, setWalletPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderErr, setOrderErr] = useState("");

  const subtotalUSD = lines.reduce(
    (t, l) => t + (l.product.sale_price ?? l.product.price) * l.qty, 0
  );
  const discountUSD = coupon ? (subtotalUSD * coupon.percent) / 100 : 0;
  const shippingUSD = subtotalUSD >= FREE_SHIPPING_USD ? 0 : SHIPPING_USD;
  const totalUSD = subtotalUSD - discountUSD + shippingUSD;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponBusy(true); setCouponErr("");
    const res = await validateCoupon(couponInput.trim());
    if (res) { setCoupon(res); setCouponInput(""); }
    else setCouponErr("Invalid or expired coupon");
    setCouponBusy(false);
  };

  const deliveryValid =
    delivery.name && delivery.email && delivery.phone &&
    delivery.governorate && delivery.city && delivery.street;

  const paymentValid = (): boolean => {
    if (payType === "card")
      return !!(card.number.length >= 16 && card.holder && card.expiry && card.cvv);
    if (payType === "vodafone" || payType === "fawry" || payType === "instapay" || payType === "meeza")
      return walletPhone.length >= 11;
    return true; // cod, apple_pay
  };

  const handlePlaceOrder = async () => {
    setOrderErr("");
    setBusy(true);
    try {
      const address = [
        delivery.street,
        delivery.apartment && `Apt ${delivery.apartment}`,
        delivery.city,
        delivery.governorate,
      ].filter(Boolean).join(", ");
      const payMethod = payType === "vodafone" ? "vodafone_cash" : payType;
      const res = await createOrder(
        delivery.name, delivery.email, delivery.phone, address,
        lines.map((l) => ({
          product_id: l.product.id,
          qty: l.qty,
          size: l.size,
          color: l.colorName,
        })),
        coupon?.code,
        payMethod,
      );
      if (res.order_id) {
        setOrderId(res.order_id);
        clear();
        setStep("done");
      } else {
        setOrderErr("Could not place order — an item may be out of stock.");
      }
    } catch {
      setOrderErr("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => toggle();
  const handleBack = () => {
    if (step === "delivery") setStep("cart");
    else if (step === "payment") setStep("delivery");
  };

  const stepTitle: Record<Step, string> = {
    cart: `Cart (${lines.length})`,
    delivery: "Delivery Info",
    payment: "Payment",
    done: "Order Confirmed",
  };

  const fInp =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-accent focus:outline-none transition-colors";
  const fLabel = "mb-1 block text-xs font-medium text-zinc-400";

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-zinc-950 shadow-2xl sm:w-[480px]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-5 py-4">
          {step !== "cart" && step !== "done" && (
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <h2 className="flex-1 font-display text-xl font-bold tracking-wide text-white">
            {stepTitle[step]}
          </h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step dots */}
        {step !== "done" && (
          <div className="shrink-0 border-b border-zinc-800">
            <Steps step={step} />
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ── CART STEP ─────────────────────────────────────────────── */}
            {step === "cart" && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-4"
              >
                {lines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShoppingBag size={40} className="text-zinc-700" />
                    <p className="mt-4 font-semibold text-white">Your cart is empty</p>
                    <p className="mt-1 text-sm text-zinc-500">Add items from the shop to get started</p>
                    <button
                      onClick={handleClose}
                      className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-2 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Line items */}
                    <div className="space-y-3">
                      {lines.map((l) => (
                        <div
                          key={`${l.product.id}-${l.size}-${l.colorHex}`}
                          className="flex gap-3 rounded-xl bg-zinc-900 p-3"
                        >
                          <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                            <img
                              src={l.product.images?.[0] ?? l.product.image}
                              alt={l.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-tight line-clamp-2">
                              {l.product.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {l.size && (
                                <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                                  {l.size}
                                </span>
                              )}
                              {l.colorHex && (
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-zinc-700"
                                  style={{ background: l.colorHex }}
                                  title={l.colorName}
                                />
                              )}
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              {/* Qty stepper */}
                              <div className="flex items-center gap-1 rounded-lg border border-zinc-800">
                                <button
                                  onClick={() => setQty(l.product.id, l.qty - 1, l.size, l.colorHex)}
                                  className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-white">
                                  {l.qty}
                                </span>
                                <button
                                  onClick={() => setQty(l.product.id, l.qty + 1, l.size, l.colorHex)}
                                  className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {fmtEGP((l.product.sale_price ?? l.product.price) * l.qty)}
                                </span>
                                <button
                                  onClick={() => remove(l.product.id, l.size, l.colorHex)}
                                  className="text-zinc-600 hover:text-sale transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coupon */}
                    <div className="rounded-xl border border-zinc-800 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={14} className="text-accent" />
                        <p className="text-sm font-semibold text-white">Coupon Code</p>
                      </div>
                      {coupon ? (
                        <div className="flex items-center justify-between rounded-lg bg-accent/10 border border-accent/30 px-3 py-2">
                          <span className="text-sm font-bold text-accent">{coupon.code}</span>
                          <span className="text-xs text-accent">{coupon.percent}% off</span>
                          <button
                            onClick={() => setCoupon(null)}
                            className="ml-2 text-zinc-500 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                            placeholder="Enter coupon code"
                            className={fInp + " flex-1"}
                          />
                          <button
                            onClick={applyCoupon}
                            disabled={couponBusy || !couponInput}
                            className="shrink-0 rounded-lg bg-zinc-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                      {couponErr && (
                        <p className="mt-2 text-xs text-sale">{couponErr}</p>
                      )}
                    </div>

                    {/* Free shipping nudge */}
                    {shippingUSD > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2.5 text-xs text-zinc-400">
                        <Truck size={13} className="shrink-0 text-accent" />
                        <span>
                          Add{" "}
                          <span className="font-semibold text-white">
                            {fmtEGP(FREE_SHIPPING_USD - subtotalUSD)}
                          </span>{" "}
                          more for free shipping
                        </span>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── DELIVERY STEP ──────────────────────────────────────────── */}
            {step === "delivery" && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div className="col-span-2">
                    <label className={fLabel}>
                      <User size={11} className="inline mr-1" />Full Name *
                    </label>
                    <input
                      value={delivery.name}
                      onChange={(e) => setDelivery({ ...delivery, name: e.target.value })}
                      placeholder="Ahmed Mohamed"
                      className={fInp}
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label className={fLabel}>
                      <Phone size={11} className="inline mr-1" />Phone *
                    </label>
                    <input
                      value={delivery.phone}
                      onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                      placeholder="01x xxxx xxxx"
                      type="tel"
                      className={fInp}
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label className={fLabel}>
                      <Mail size={11} className="inline mr-1" />Email *
                    </label>
                    <input
                      value={delivery.email}
                      onChange={(e) => setDelivery({ ...delivery, email: e.target.value })}
                      placeholder="email@example.com"
                      type="email"
                      className={fInp}
                    />
                  </div>
                  {/* Governorate */}
                  <div>
                    <label className={fLabel}>
                      <MapPin size={11} className="inline mr-1" />Governorate *
                    </label>
                    <select
                      value={delivery.governorate}
                      onChange={(e) => setDelivery({ ...delivery, governorate: e.target.value })}
                      className={fInp + " cursor-pointer"}
                    >
                      <option value="">Select…</option>
                      {GOVERNORATES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  {/* City */}
                  <div>
                    <label className={fLabel}>
                      <Building size={11} className="inline mr-1" />City / District *
                    </label>
                    <input
                      value={delivery.city}
                      onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                      placeholder="Nasr City"
                      className={fInp}
                    />
                  </div>
                  {/* Street */}
                  <div className="col-span-2">
                    <label className={fLabel}>Street &amp; Building *</label>
                    <input
                      value={delivery.street}
                      onChange={(e) => setDelivery({ ...delivery, street: e.target.value })}
                      placeholder="15 El Tahrir St, Building 4"
                      className={fInp}
                    />
                  </div>
                  {/* Apartment */}
                  <div className="col-span-2">
                    <label className={fLabel}>Apartment / Floor (optional)</label>
                    <input
                      value={delivery.apartment}
                      onChange={(e) => setDelivery({ ...delivery, apartment: e.target.value })}
                      placeholder="Apt 3, Floor 2"
                      className={fInp}
                    />
                  </div>
                </div>

                {/* Delivery info */}
                <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <Truck size={16} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-white">Estimated Delivery</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Standard: 2–5 business days &nbsp;·&nbsp; Express: Next day
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PAYMENT STEP ───────────────────────────────────────────── */}
            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-3"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                  Select payment method
                </p>

                <PayMethodCard type="cod" selected={payType === "cod"} onClick={() => setPayType("cod")}
                  icon={<Banknote size={18} className="text-green-400" />}
                  label="Cash on Delivery" sublabel="Pay when your order arrives" />

                <PayMethodCard type="card" selected={payType === "card"} onClick={() => setPayType("card")}
                  icon={<CreditCard size={18} className="text-blue-400" />}
                  label="Credit / Debit Card" sublabel="Visa, Mastercard, Meeza" />

                {payType === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3"
                  >
                    <div>
                      <label className={fLabel}>Card Number</label>
                      <input
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                        placeholder="0000 0000 0000 0000"
                        className={fInp}
                      />
                    </div>
                    <div>
                      <label className={fLabel}>Cardholder Name</label>
                      <input
                        value={card.holder}
                        onChange={(e) => setCard({ ...card, holder: e.target.value })}
                        placeholder="As on card"
                        className={fInp}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={fLabel}>Expiry</label>
                        <input
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className={fInp}
                        />
                      </div>
                      <div>
                        <label className={fLabel}>CVV</label>
                        <input
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          placeholder="•••"
                          type="password"
                          className={fInp}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Shield size={12} />
                      <span>256-bit SSL encrypted</span>
                    </div>
                  </motion.div>
                )}

                <PayMethodCard type="apple_pay" selected={payType === "apple_pay"} onClick={() => setPayType("apple_pay")}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.33.07 2.26.76 3.03.82.9-.19 1.76-.89 3.11-.95 1.68.07 2.95.78 3.74 1.98-3.44 2.07-2.88 6.9.6 8.26-.65 1.52-1.5 3.04-2.48 3.75zM12 7.42c-.11-2.56 1.95-4.68 4.47-4.92.33 2.9-2.63 5.03-4.47 4.92z"/>
                    </svg>
                  }
                  label="Apple Pay" sublabel="Pay with Touch ID or Face ID" />

                {/* Digital wallet options */}
                <div className="rounded-xl border border-zinc-800 overflow-hidden">
                  {(["vodafone", "fawry", "instapay", "meeza"] as PayType[]).map((pt, i) => {
                    const walletInfo: Record<string, { label: string; sub: string; color: string }> = {
                      vodafone: { label: "Vodafone Cash", sub: "Transfer via Vodafone wallet", color: "text-red-400" },
                      fawry:    { label: "Fawry",         sub: "Pay at any Fawry outlet",      color: "text-orange-400" },
                      instapay: { label: "InstaPay",      sub: "Instant bank transfer",        color: "text-cyan-400" },
                      meeza:    { label: "Meeza",         sub: "National Payment Network",     color: "text-green-400" },
                    };
                    const w = walletInfo[pt];
                    return (
                      <button
                        key={pt}
                        onClick={() => setPayType(pt)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all ${
                          i > 0 ? "border-t border-zinc-800" : ""
                        } ${payType === pt ? "bg-accent/10" : "hover:bg-zinc-900 bg-zinc-950"}`}
                      >
                        <Smartphone size={16} className={w.color} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{w.label}</p>
                          <p className="text-xs text-zinc-500">{w.sub}</p>
                        </div>
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          payType === pt ? "border-accent bg-accent" : "border-zinc-700"
                        }`}>
                          {payType === pt && <Check size={9} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Wallet phone input */}
                {["vodafone","fawry","instapay","meeza"].includes(payType) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <label className={fLabel}>
                      <Phone size={11} className="inline mr-1" />
                      Wallet Phone Number
                    </label>
                    <input
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="01x xxxx xxxx"
                      type="tel"
                      className={fInp}
                    />
                  </motion.div>
                )}

                {orderErr && (
                  <p className="rounded-lg bg-sale/10 border border-sale/30 px-3 py-2 text-xs text-sale">
                    {orderErr}
                  </p>
                )}
              </motion.div>
            )}

            {/* ── DONE STEP ──────────────────────────────────────────────── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center px-8 py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 border-2 border-success"
                >
                  <Check size={36} className="text-success" />
                </motion.div>
                <h3 className="mt-6 font-display text-3xl font-bold text-white">
                  Order Confirmed!
                </h3>
                {orderId && (
                  <p className="mt-2 text-sm text-zinc-400">
                    Order #{orderId}
                  </p>
                )}
                <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                  Thank you for shopping with us. You'll receive a confirmation
                  shortly. Estimated delivery: <span className="text-white font-medium">2–5 business days</span>.
                </p>
                <button
                  onClick={() => { setStep("cart"); setDelivery(EMPTY_DELIVERY); setCard(EMPTY_CARD); setWalletPhone(""); setCoupon(null); setOrderId(null); toggle(); }}
                  className="mt-8 rounded-full bg-accent px-8 py-3 text-sm font-bold text-white hover:bg-accent-2 transition-colors"
                >
                  Continue Shopping
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer (order summary + CTA) ─────────────────────────────────── */}
        {step !== "done" && lines.length > 0 && (
          <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-5 pb-6 pt-4 space-y-3">
            {/* Summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{fmtEGP(subtotalUSD)}</span>
              </div>
              {discountUSD > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({coupon?.percent}%)</span>
                  <span>−{fmtEGP(discountUSD)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span>
                  {shippingUSD === 0 ? (
                    <span className="font-semibold text-success">FREE</span>
                  ) : fmtEGP(shippingUSD)}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold text-white">
                <span>Total</span>
                <span className="text-accent">{fmtEGP(totalUSD)}</span>
              </div>
            </div>

            {/* CTA */}
            {step === "cart" && (
              <button
                onClick={() => setStep("delivery")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-2"
              >
                Proceed to Checkout
                <Truck size={15} />
              </button>
            )}
            {step === "delivery" && (
              <button
                disabled={!deliveryValid}
                onClick={() => setStep("payment")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue to Payment
                <Wallet size={15} />
              </button>
            )}
            {step === "payment" && (
              <button
                disabled={busy || !paymentValid()}
                onClick={handlePlaceOrder}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Placing Order…" : (
                  payType === "apple_pay" ? (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.33.07 2.26.76 3.03.82.9-.19 1.76-.89 3.11-.95 1.68.07 2.95.78 3.74 1.98-3.44 2.07-2.88 6.9.6 8.26-.65 1.52-1.5 3.04-2.48 3.75zM12 7.42c-.11-2.56 1.95-4.68 4.47-4.92.33 2.9-2.63 5.03-4.47 4.92z"/>
                      </svg>
                      Pay {fmtEGP(totalUSD)}
                    </>
                  ) : `Place Order — ${fmtEGP(totalUSD)}`
                )}
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
              <Shield size={11} />
              <span>Secure checkout · 30-day returns</span>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
