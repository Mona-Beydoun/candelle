"use client";

import { useEffect, useRef, useState } from "react";
import type { Order } from "@/lib/orders";

// Defined here on purpose: importing values from lib/orders would pull the
// server-side store into the browser bundle. Types are safe (erased at build).
const STATUSES = ["Pending", "Preparing", "Delivered"] as const;
type Status = (typeof STATUSES)[number];

const CATALOGUE = [
  { name: "Vanilla Candle", price: 8 },
  { name: "Cedar Candle", price: 10 },
  { name: "Mini Gift Candle", price: 6 },
];

const inputClass =
  "w-full rounded-xl border border-amber-400/30 bg-black/30 px-3 py-2 text-[#faf3e3] placeholder:text-[#faf3e3]/40 focus:outline-2 focus:outline-offset-2 focus:outline-amber-400";

type Props = {
  order?: Order; // present = edit mode (used in Part C)
  onClose: () => void;
  onSaved: () => void;
};

export default function OrderFormModal({ order, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [customerName, setCustomerName] = useState(order?.customerName ?? "");
  const [phone, setPhone] = useState(order?.phone ?? "");
  const [productName, setProductName] = useState(order?.productName ?? "");
  const [quantity, setQuantity] = useState(String(order?.quantity ?? 1));
  const [unitPrice, setUnitPrice] = useState(order ? String(order.unitPrice) : "");
  const [status, setStatus] = useState<Status>(order?.status ?? "Pending");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open as a real modal dialog: focus is trapped and Esc closes it
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function handleProductChange(value: string) {
    setProductName(value);
    const match = CATALOGUE.find((p) => p.name === value);
    if (match && !order) setUnitPrice(String(match.price)); // price stays editable
  }

  // Display-only preview. The server calculates the real total.
  const q = Number(quantity);
  const p = Number(unitPrice);
  const preview =
    Number.isInteger(q) && q > 0 && unitPrice !== "" && Number.isFinite(p)
      ? `$${((Math.round(p * 100) * q) / 100).toFixed(2)}`
      : "—";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customerName,
        phone,
        productName,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
      };
      const response = await fetch(order ? `/api/orders/${order.id}` : "/api/orders", {
        method: order ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order ? { ...payload, status } : payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
        return; // form stays open, values are kept
      }
      onSaved();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close(); // backdrop click
      }}
      aria-labelledby="order-form-title"
      className="m-auto max-h-[90dvh] w-[min(92vw,32rem)] overflow-y-auto rounded-3xl border border-amber-400/40 bg-[#1c130e] p-0 text-[#faf3e3] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <h2 id="order-form-title" className="font-serif text-2xl">
          {order ? "Edit order" : "New order"}
        </h2>

        <div>
          <label htmlFor="customerName" className="mb-1 block text-sm">Customer name</label>
          <input id="customerName" required className={inputClass} value={customerName}
            onChange={(e) => setCustomerName(e.target.value)} />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm">Phone</label>
          <input id="phone" required className={inputClass} value={phone}
            onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <label htmlFor="productName" className="mb-1 block text-sm">Product</label>
          <input id="productName" required list="catalogue" className={inputClass} value={productName}
            onChange={(e) => handleProductChange(e.target.value)} />
          <datalist id="catalogue">
            {CATALOGUE.map((c) => <option key={c.name} value={c.name} />)}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm">Quantity</label>
            <input id="quantity" type="number" required min={1} step={1} className={inputClass}
              value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <label htmlFor="unitPrice" className="mb-1 block text-sm">Unit price (USD)</label>
            <input id="unitPrice" type="number" required min={0} step="0.01" className={inputClass}
              value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </div>
        </div>

        {order && (
          <div>
            <label htmlFor="status" className="mb-1 block text-sm">Status</label>
            <select id="status" className={inputClass} value={status}
              onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <p className="text-sm text-[#faf3e3]/70">
          Estimated total: <span className="font-semibold text-amber-300">{preview}</span>{" "}
          (the server calculates the final amount)
        </p>

        {error && (
          <p role="alert" className="rounded-xl border border-red-400/50 bg-red-950/60 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => dialogRef.current?.close()}
            className="rounded-full border border-amber-400/40 px-5 py-2 hover:bg-white/10 focus:outline-2 focus:outline-offset-2 focus:outline-amber-400">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="rounded-full bg-amber-400 px-5 py-2 font-semibold text-[#1c130e] hover:bg-amber-300 focus:outline-2 focus:outline-offset-2 focus:outline-amber-200 disabled:opacity-60">
            {submitting ? "Saving..." : order ? "Save changes" : "Add order"}
          </button>
        </div>
      </form>
    </dialog>
  );
}