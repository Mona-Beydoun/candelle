"use client";

import { useEffect, useRef } from "react";
import type { Order } from "@/lib/orders";

const money = (n: number) => `$${n.toFixed(2)}`;

export default function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const rows: [string, string][] = [
    ["Customer", order.customerName],
    ["Phone", order.phone],
    ["Product", order.productName],
    ["Quantity", String(order.quantity)],
    ["Unit price", money(order.unitPrice)],
    ["Total", money(order.total)],
    ["Status", order.status],
    ["Order ID", order.id],
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="order-details-title"
      className="m-auto max-h-[90dvh] w-[min(92vw,32rem)] overflow-y-auto rounded-3xl border border-amber-400/40 bg-[#1c130e] p-0 text-[#faf3e3] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-4 p-6">
        <h2 id="order-details-title" className="font-serif text-2xl">Order details</h2>

        <dl className="divide-y divide-amber-400/20">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-[#faf3e3]/70">{label}</dt>
              <dd className="break-all text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={() => dialogRef.current?.close()}
            className="rounded-full bg-amber-400 px-5 py-2 font-semibold text-[#1c130e] hover:bg-amber-300 focus:outline-2 focus:outline-offset-2 focus:outline-amber-200">
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}