import { useState } from "react";
import { X } from "lucide-react";

const MESSAGES = [
  "FREE SHIPPING on orders over EGP 2,500",
  "Use code HOSSAM20 for 20% off",
  "New arrivals every Friday",
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [idx] = useState(() => Math.floor(Math.random() * MESSAGES.length));

  if (!visible) return null;

  return (
    <div className="relative bg-accent px-8 py-2 text-center text-xs font-semibold tracking-wide text-white">
      {MESSAGES[idx]}
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={13} />
      </button>
    </div>
  );
}
