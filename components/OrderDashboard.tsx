"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/orders";

const money = (n: number) => `$${n.toFixed(2)}`;

const statusStyles: Record<Order["status"], string> = {
  Pending: "bg-amber-100 text-amber-800",
  Preparing: "bg-blue-100 text-blue-800",
  Delivered: "bg-green-100 text-green-800",
};

export default function OrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

const [reloadKey, setReloadKey] = useState(0);

useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Server returned an error");
      }
      const data: Order[] = await response.json();
      if (!cancelled) {
        setOrders(data);
        setLoadError(null);
      }
    } catch {
      if (!cancelled) setLoadError("We couldn't load the orders. Please try again.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();
  return () => {
    cancelled = true;
  };
}, [reloadKey]);

// Call this to re-fetch the list (after add, edit, delete, or Retry)
function refresh() {
  setReloadKey((k) => k + 1);
}

function retry() {
  setLoading(true);
  setLoadError(null);
  refresh();
}

  // Summary counts are derived from the real order data
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "Pending").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Candelle</h1>
        <p className="text-gray-600">Order desk for Nour Candle Studio</p>
      </header>

      <section aria-label="Order summary" className="mb-6 grid grid-cols-3 gap-3">
        <SummaryCard label="Total orders" value={total} />
        <SummaryCard label="Pending" value={pending} />
        <SummaryCard label="Delivered" value={delivered} />
      </section>

      <section aria-label="Orders">
        <h2 className="mb-3 text-xl font-semibold">Orders</h2>

        {loading && <p role="status">Loading orders...</p>}

        {!loading && loadError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-4">
            <p className="mb-2 text-red-800">{loadError}</p>
            <button
              onClick={retry}
              className="rounded bg-red-700 px-3 py-1.5 text-white hover:bg-red-800 focus:outline-2 focus:outline-offset-2 focus:outline-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && orders.length === 0 && (
          <p className="rounded border border-dashed p-6 text-center text-gray-600">
            No orders yet. Add the first one to get started.
          </p>
        )}

        {!loading && !loadError && orders.length > 0 && (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border p-4"
              >
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-600">
                    {order.quantity} × {order.productName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{money(order.total)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}