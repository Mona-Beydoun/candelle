"use client";

import { useEffect, useRef, useState } from "react";
import type { Order } from "@/lib/orders";

type Props = {
  order: Order;
  onClose: () => void;
  onDeleted: () => void;
};

export default function ConfirmDeleteModal({ order, onClose, onDeleted }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });

      // 204 has no body, so only read JSON when the request failed
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not delete the order. Please try again.");
        return;
      }
      onDeleted();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="confirm-delete-title"
      className="m-auto w-[min(92vw,26rem)] rounded-3xl border border-red-400/40 bg-[#1c130e] p-0 text-[#faf3e3] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-4 p-6">
        <h2 id="confirm-delete-title" className="font-serif text-2xl">Delete this order?</h2>
        <p className="text-sm text-[#faf3e3]/80">
          {order.quantity} × {order.productName} for{" "}
          <span className="font-semibold">{order.customerName}</span> will be removed. This
          cannot be undone.
        </p>

        {error && (
          <p role="alert" className="rounded-xl border border-red-400/50 bg-red-950/60 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-full border border-amber-400/40 px-5 py-2 hover:bg-white/10 focus:outline-2 focus:outline-offset-2 focus:outline-amber-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full bg-red-500 px-5 py-2 font-semibold text-white hover:bg-red-400 focus:outline-2 focus:outline-offset-2 focus:outline-red-200 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}